import time
import sqlite3
from datetime import datetime, timedelta
from urllib.parse import quote, urlparse
import re, random

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


class Twitterbot:
    def __init__(self, email: str, password: str, db_path: str | None = None, headless: bool = False):
        self.email = email
        self.password = password
        self._closed = False
        self.db_path = db_path or "tweets.db"
        self.conn = None
        self.cur = None

        # ----- Chrome (Selenium 4) -----
        chrome_options = Options()
        chrome_options.page_load_strategy = "eager"
        if headless:
            chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-notifications")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_experimental_option(
            "prefs",
            {
                "profile.managed_default_content_settings.images": 2,
                "profile.default_content_setting_values.notifications": 2,
            },
        )

        service = Service(ChromeDriverManager().install())
        self.bot = webdriver.Chrome(service=service, options=chrome_options)
        self.bot.set_page_load_timeout(60)
        self.bot.implicitly_wait(0)
        self.wait = WebDriverWait(self.bot, 10)

        # ----- SQLite -----
        self._open_db()
        self._ensure_schema()

    # ===== DB helpers =====
    def _open_db(self):
        if self.conn:
            return
        self.conn = sqlite3.connect(self.db_path)
        self.cur = self.conn.cursor()

    def _ensure_schema(self):
        self.cur.execute(
            """
            CREATE TABLE IF NOT EXISTS tweets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT,
                author TEXT,
                text TEXT,
                hashtag TEXT,
                created_at TEXT,
                replies INTEGER DEFAULT 0,
                reposts INTEGER DEFAULT 0,
                likes INTEGER DEFAULT 0,
                views INTEGER DEFAULT 0
            )
            """
        )
        for alter in [
            "ALTER TABLE tweets ADD COLUMN hashtag TEXT",
            "ALTER TABLE tweets ADD COLUMN created_at TEXT",
            "ALTER TABLE tweets ADD COLUMN replies INTEGER DEFAULT 0",
            "ALTER TABLE tweets ADD COLUMN reposts INTEGER DEFAULT 0",
            "ALTER TABLE tweets ADD COLUMN likes INTEGER DEFAULT 0",
            "ALTER TABLE tweets ADD COLUMN views INTEGER DEFAULT 0",
        ]:
            try:
                self.cur.execute(alter)
            except sqlite3.OperationalError:
                pass

        self.cur.execute("CREATE INDEX IF NOT EXISTS idx_tweets_hashtag ON tweets(hashtag)")
        self.cur.execute("CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at)")
        self.conn.commit()

        try:
            self.cur.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_tweets_url_hashtag_unique ON tweets(url, hashtag)"
            )
            self.conn.commit()
        except sqlite3.IntegrityError:
            self.cur.execute(
                """
                DELETE FROM tweets
                WHERE rowid NOT IN (
                    SELECT MIN(rowid) FROM tweets GROUP BY url, hashtag
                );
                """
            )
            self.conn.commit()
            self.cur.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_tweets_url_hashtag_unique ON tweets(url, hashtag)"
            )
            self.conn.commit()

    def _count_by_hashtag(self, hashtag: str) -> int:
        self.cur.execute("SELECT COUNT(*) FROM tweets WHERE hashtag = ?", (hashtag,))
        row = self.cur.fetchone()
        return int(row[0]) if row and row[0] is not None else 0

    # ---- sayı yakalama yardımcıları ----
    _RE_NUM = re.compile(r"(\d+(?:[.,]\d+)?)", re.I)

    @staticmethod
    def _norm_space(s: str) -> str:
        return s.replace("\u00a0", " ").strip().lower()

    def _extract_number(self, s: str | None) -> int:
        if not s:
            return 0
        txt = self._norm_space(s)
        mult = 1
        # Handle "K" for thousands
        if "k" in txt or "K" in txt:
            mult = 1_000
        # Handle "M" for millions
        elif "m" in txt or "M" in txt:
            mult = 1_000_000
        # Handle "B" for billions
        elif "b" in txt or "B" in txt:
            mult = 1_000_000_000
        
        # Find numbers in the text
        m = self._RE_NUM.search(txt)
        if not m:
            return 0
        num_str = m.group(1).replace(",", ".")
        try:
            return int(round(float(num_str) * mult))
        except Exception:
            try:
                return int(re.sub(r"\D", "", num_str))
            except Exception:
                return 0

    def _get_action_count(self, tweet_el, testid: str) -> int:
        try:
            # Locate the like button or target element
            btn = tweet_el.find_element(By.XPATH, f'.//*[@data-testid="{testid}"]')
        except Exception:
            return 0
        
        try:
            # Extract the aria-label and normalize the number
            label = btn.get_attribute("aria-label") or ""
            n = self._extract_number(label)
            if n:
                return n
        except Exception:
            pass
        
        try:
            # If there are spans with numbers, try to extract the number from there
            spans = btn.find_elements(By.XPATH, './/span[normalize-space(text())!=""]')
            for sp in reversed(spans):
                n = self._extract_number(sp.text)
                if n:
                    return n
        except Exception:
            pass
        
        # Extra check for like count if the primary method fails
        try:
            btn = tweet_el.find_element(By.XPATH, './/*[@aria-label and contains(translate(@aria-label, "Like", "like"), "like")]')
            label = btn.get_attribute("aria-label") or ""
            n = self._extract_number(label)
            if n:
                return n
        except Exception:
            pass
        
        return 0

    def _get_views_count(self, tweet_el) -> int:
        try:
            vc = tweet_el.find_element(By.XPATH, './/*[@data-testid="viewCount"]')
            label = (vc.get_attribute("aria-label") or vc.text or "").strip()
            n = self._extract_number(label)
            if n:
                return n
        except Exception:
            pass
        try:
            node = tweet_el.find_element(
                By.XPATH,
                './/*[@aria-label and (contains(translate(@aria-label,"VIEWS","views"),"views") '
                'or contains(translate(@aria-label,"GÖRÜNTÜLENME","görüntülenme"),"görüntülenme"))]'
            )
            n = self._extract_number(node.get_attribute("aria-label"))
            if n:
                return n
        except Exception:
            pass
        try:
            spans = tweet_el.find_elements(
                By.XPATH,
                './/span[contains(translate(.,"VIEWS","views"),"views") or '
                'contains(translate(.,"GÖRÜNTÜLENME","görüntülenme"),"görüntülenme")]'
            )
            for sp in spans[::-1]:
                n = self._extract_number(sp.text)
                if n:
                    return n
        except Exception:
            pass
        return 0

    # ===== Auth =====
    def login(self):
        bot, wait = self.bot, self.wait
        bot.get("https://twitter.com/login")
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "text")))

        email_input.send_keys(self.email)
        email_input.send_keys(Keys.RETURN)
        try:
            pwd = WebDriverWait(bot, 6).until(EC.presence_of_element_located((By.NAME, "password")))

        except Exception:
            try:
                maybe_user = WebDriverWait(bot, 4).until(EC.presence_of_element_located((By.NAME, "text")))

                maybe_user.send_keys(self.email)
                maybe_user.send_keys(Keys.RETURN)
                pwd = WebDriverWait(bot, 6).until(EC.presence_of_element_located((By.NAME, "password")))

            except Exception:
                pwd = wait.until(EC.presence_of_element_located((By.NAME, "password")))

        pwd.send_keys(self.password)
        pwd.send_keys(Keys.RETURN)
        WebDriverWait(bot, 10).until(EC.any_of(
            EC.presence_of_element_located((By.XPATH, '//a[@href="/home"]'))),
            EC.presence_of_element_located((By.XPATH, '//a[@data-testid="AppTabBar_Home_Link"]')))

    # ===== Scrape with polite pacing =====
    def scrape_hashtag(self, hashtag: str, *, rounds: int = 5, row_limit: int | None = None, session_row_cap: int | None = 800, since_days: int = 365, filter_type: str = "live", max_idle_rounds: int = 2, timeout_seconds: int = 180, auto_close_on_complete: bool = True, commit_batch: int = 20, safe_rate_limits: bool = True, cooldown_every_n_rows: int = 40, cooldown_rows_range: tuple[float, float] = (35.0, 90.0), cooldown_every_n_rounds: int = 3, cooldown_rounds_range: tuple[float, float] = (20.0, 60.0), micro_jitter_range: tuple[float, float] = (0.05, 0.15), between_rounds_range: tuple[float, float] = (0.6, 1.2)):
        self._open_db()
        print(f"[DB] Using database: {self.db_path}")

        bot, wait = self.bot, self.wait
        start = time.monotonic()

        running_total = self._count_by_hashtag(hashtag)
        if row_limit is not None and running_total >= row_limit:
            print(f"[STOP] DB total ({running_total}) already >= row_limit ({row_limit}).")
            if auto_close_on_complete:
                self.close()
            return

        until = datetime.utcnow().date()
        since = until - timedelta(days=since_days)
        q = f"%23{hashtag} since:{since.isoformat()} until:{until.isoformat()}"
        url = f"https://twitter.com/search?q={quote(q)}&src=typed_query&f={filter_type}"

        bot.get(url)
        try:
            wait.until(EC.presence_of_element_located((By.XPATH, '//article[@data-testid="tweet"]')))
        except Exception:
            pass

        idle_rounds = 0
        writes_since_commit = 0
        rows_since_cooldown = 0
        rounds_since_cooldown = 0
        session_rows = 0

        def _jitter(a, b):
            if safe_rate_limits:
                time.sleep(random.uniform(a, b))

        for round_idx in range(rounds):
            if time.monotonic() - start > timeout_seconds:
                print(f"[STOP] Timeout (~{timeout_seconds}s).")
                break

            new_in_round = 0
            tweets = bot.find_elements(By.XPATH, '//article[@data-testid="tweet"]')

            for t in tweets:
                try:
                    link = t.find_element(By.XPATH, './/a[@href and contains(@href,"/status/")]')
                    t_url = link.get_attribute("href") or ""
                except Exception:
                    t_url = ""
                if not t_url:
                    continue

                try:
                    t_text = t.find_element(By.XPATH, './/div[@data-testid="tweetText"]').text
                except Exception:
                    t_text = ""

                created_at = ""
                try:
                    time_el = t.find_element(By.XPATH, ".//time")
                    created_at = (time_el.get_attribute("datetime") or "").strip()
                except Exception:
                    pass

                t_author = ""
                try:
                    handle_elem = t.find_element(
                        By.XPATH,
                        './/div[@data-testid="User-Names"]//span[starts-with(normalize-space(text()), "@")]'
                    )
                    t_author = handle_elem.text.strip()
                except Exception:
                    pass
                if not t_author:
                    try:
                        name_spans = t.find_elements(
                            By.XPATH,
                            './/div[@data-testid="User-Names"]//span[not(starts-with(normalize-space(text()), "@"))]'
                        )
                        if name_spans:
                            t_author = name_spans[0].text.strip()
                    except Exception:
                        pass
                if not t_author and t_url:
                    try:
                        parts = [p for p in urlparse(t_url).path.split('/') if p]
                        if parts:
                            t_author = f"@{parts[0]}"
                    except Exception:
                        pass

                replies = self._get_action_count(t, "reply")
                reposts = self._get_action_count(t, "retweet")
                likes = self._get_action_count(t, "like")
                views = self._get_views_count(t)

                self.cur.execute(
                    "INSERT OR IGNORE INTO tweets (url, author, text, hashtag, created_at, replies, reposts, likes, views) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (t_url, t_author, t_text, hashtag, created_at, replies, reposts, likes, views),
                )
                inserted = self.cur.rowcount
                if not inserted:
                    self.cur.execute(
                        """
                        UPDATE tweets SET
                            author = COALESCE(?, author),
                            text = COALESCE(NULLIF(?, ''), text),
                            created_at = COALESCE(NULLIF(?, ''), created_at),
                            replies = MAX(replies, ?),
                            reposts = MAX(reposts, ?),
                            likes = MAX(likes, ?),
                            views = MAX(views, ?)
                        WHERE url = ? AND hashtag = ?
                        """,
                        (t_author or None, t_text, created_at, replies, reposts, likes, views, t_url, hashtag),
                    )
                else:
                    running_total += 1
                    new_in_round += 1
                    session_rows += 1
                    rows_since_cooldown += 1

                writes_since_commit += 1
                if writes_since_commit >= commit_batch:
                    self.conn.commit()
                    writes_since_commit = 0

                _jitter(*micro_jitter_range)

                if row_limit is not None and running_total >= row_limit:
                    if writes_since_commit:
                        self.conn.commit()
                    print(f"[STOP] Row limit reached: {running_total} / {row_limit}.")
                    if auto_close_on_complete:
                        self.close()
                    return

                if session_row_cap is not None and session_rows >= session_row_cap:
                    if writes_since_commit:
                        self.conn.commit()
                    print(f"[STOP] Session cap reached: {session_rows} rows (cap {session_row_cap}).")
                    if auto_close_on_complete:
                        self.close()
                    return

                if safe_rate_limits and rows_since_cooldown >= cooldown_every_n_rows:
                    if writes_since_commit:
                        self.conn.commit()
                        writes_since_commit = 0
                    pause = random.uniform(*cooldown_rows_range)
                    print(f"[PAUSE] Cooldown after {rows_since_cooldown} new rows: sleeping ~{pause:.1f}s")
                    time.sleep(pause)
                    rows_since_cooldown = 0

            if writes_since_commit:
                self.conn.commit()
                writes_since_commit = 0

            print(f"[Round {round_idx+1}/{rounds}] DB new rows: {new_in_round} "
                  f"(session: {session_rows}"
                  f"{' / cap ' + str(session_row_cap) if session_row_cap is not None else ''}; "
                  f"total: {running_total}"
                  f"{' / limit ' + str(row_limit) if row_limit is not None else ''})")

            if new_in_round == 0:
                idle_rounds += 1
                if idle_rounds >= max_idle_rounds:
                    print(f"[STOP] No DB growth for {idle_rounds} rounds.")
                    break
            else:
                idle_rounds = 0

            rounds_since_cooldown += 1

            old_h = bot.execute_script("return document.body.scrollHeight")
            bot.execute_script("window.scrollTo(0, arguments[0]);", old_h)
            try:
                WebDriverWait(bot, 4).until(
                    lambda d: d.execute_script("return document.body.scrollHeight") > old_h
                    or len(d.find_elements(By.XPATH, '//article[@data-testid="tweet"]')) > len(tweets)
                )
            except Exception:
                pass

            _jitter(*between_rounds_range)

            if safe_rate_limits and rounds_since_cooldown >= cooldown_every_n_rounds:
                pause = random.uniform(*cooldown_rounds_range)
                print(f"[PAUSE] Round cooldown after {rounds_since_cooldown} rounds: sleeping ~{pause:.1f}s")
                time.sleep(pause)
                rounds_since_cooldown = 0

        print(f"[DONE] Finished rounds. Session rows: {session_rows}"
              f"{' / cap ' + str(session_row_cap) if session_row_cap is not None else ''}; "
              f"total for '{hashtag}': {running_total}"
              f"{' / limit ' + str(row_limit) if row_limit is not None else ''}.")
        if auto_close_on_complete:
            self.close()

    def close(self):
        if getattr(self, "_closed", False):
            return
        try:
            if self.conn is not None:
                try:
                    self.conn.close()
                except Exception:
                    pass
        finally:
            try:
                self.bot.quit()
            except Exception:
                pass
        self._closed = True
