import os, re, time, sqlite3, random, sys, urllib.parse
from dataclasses import dataclass
from typing import Tuple, Set

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import (
    TimeoutException, NoSuchElementException, WebDriverException,
    StaleElementReferenceException, ElementClickInterceptedException
)


DEBUGGER_ADDRESS = "127.0.0.1:9222"    # Başlatmadan önce, Chrome --remote-debugging-port=9222 ile çalıştırılmalı.
HASHTAGS = [
    "Çevre","ÇevreKoruma","ÇevreDostu","SürdürülebilirYaşam","SıfırAtık","GeriDönüşüm","YeşilHayat",
    "TemizÇevre","Doğa","DoğayıKoru","EkolojikYaşam","Ekoloji","Biyoçeşitlilik","DoğalKaynaklar",
    "AtıkYönetimi","PlastiksizYaşam","DoğaSevgisi","SuTasarrufu","HavaTemizliği","SuKirliliği",
    "İklim","İklimDeğişikliği","KüreselIsınma","İklimKrizi","İklimEylemi","İklimAdaleti","TemizEnerji",
    "YenilenebilirEnerji","GüneşEnerjisi","RüzgarEnerjisi","YeşilEnerji","EnerjiVerimliliği",
    "KarbonAyakİzi","KarbonNötr","SürdürülebilirEnerji","DoğaİçinEnerji","FosilYakıtlarıBırak",
    "MaviEnerji","YeşilGelecek","EnerjiTasarrufu","Şehircilik","KentselDönüşüm","KentselGelişim",
    "KentselTasarım","KentEstetiği","KentKültürü","KentYaşamı","ŞehirPlanlama","Mimarlık",
    "YeşilMimari","AkıllıŞehirler","DayanıklıŞehirler","YaşanabilirŞehirler","KentselAltyapı",
    "TopluTaşıma","BisikletYolları","YayaAlanları","AkıllıUlaşım","KentMobilyaları","KentPeyzajı",
    "Orman","Ağaçlandırma","FidanDik","OrmanYangını","SulakAlanlar","MilliParklar","DoğaKoruma",
    "Ekosistem","YeşilAlan","SirazDoğa","GölKoruma","DenizTemizliği","Okyanus","BiyolojikÇeşitlilik",
    "HabitatKoruma","Doğasever","KuşGöçü","YabanHayatı","DoğaGönüllüsü","DoğayaSaygı","YeşilPolitika",
    "ÇevreHareketi","SürdürülebilirKalkınma","2030Hedefleri","UNSDG","GelecekNesiller","TemizHava",
    "TemizSu","YaşanabilirDünya","AdilDönüşüm","YeşilEkonomi","DoğaHakları","KüreselEylem",
    "İklimİçinBirlik","GençlikVeİklim","DoğaİçinBirlik","ÇevreHakkı","ÇevreBilinci","EkolojikDenge",
    "GelecekİçinDoğa"
] 
MAX_PER_HASHTAG = 40               
DB_PATH = "instagramposts.db"


STABILIZE = (0.35, 0.55)             
SCROLL_NUDGE = (0.3, 0.45)          
NAV_RETRY = 2


@dataclass
class PostRow:
    username: str
    caption: str
    hashtags: str
    location: str
    timestamp: str
    hashtag: str
    like_count: int


def rsleep(a_b: Tuple[float, float]): time.sleep(random.uniform(*a_b))

def create_driver_attach(debug_addr: str) -> webdriver.Chrome:
    opts = Options()
    opts.add_experimental_option("debuggerAddress", debug_addr)
    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)

def goto_hashtag_grid(driver: webdriver.Chrome, tag: str) -> None:
    url = f"https://www.instagram.com/explore/tags/{tag}/"
    driver.get(url)
    thumb_xpath = "//a[contains(@href,'/p/') or contains(@href,'/reel/')]"
    WebDriverWait(driver, 30).until(EC.presence_of_all_elements_located((By.XPATH, thumb_xpath)))
    driver.execute_script("window.scrollTo(0, 600);")
    rsleep(SCROLL_NUDGE)

def open_first_post(driver: webdriver.Chrome) -> None:
    first = WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "(//a[contains(@href,'/p/') or contains(@href,'/reel/')])[1]"))
    )
    driver.execute_script("arguments[0].click();", first)
    WebDriverWait(driver, 20).until(EC.presence_of_element_located(
        (By.XPATH, "//div[@role='dialog'] | //article")
    ))
    rsleep(STABILIZE)

def modal_root(driver):
    try:
        return driver.find_element(By.XPATH, "//div[@role='dialog']")
    except NoSuchElementException:
        return driver.find_element(By.XPATH, "//article")

def try_expand_more(driver):
    
    for xp in [
        "//button[.//span[translate(normalize-space(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='more']]",
        "//span[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'devamını gör')]",
        "//span[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'daha fazla')]",
    ]:
        try:
            for b in driver.find_elements(By.XPATH, xp):
                try:
                    driver.execute_script("arguments[0].click();", b)
                    time.sleep(0.1)
                except Exception:
                    continue
        except Exception:
            continue

def extract_username(driver) -> str:
    root = modal_root(driver)
   #instagram içi arama yöntemi
    anchors = root.find_elements(By.XPATH, ".//a[@role='link' and starts-with(@href,'/')]")
    for a in anchors:
        href = a.get_attribute("href") or ""
        if any(s in href for s in ("/explore/", "/p/", "/reel/", "/stories/", "/accounts/", "/directory/")):
            continue
        txt = (a.text or "").strip()
        if txt and " " not in txt and not txt.startswith("#") and "@" not in txt and len(txt) <= 30:
            return txt
        try:
            path = urllib.parse.urlparse(href).path
            parts = [p for p in path.split("/") if p]
            if parts and len(parts[0]) <= 30:
                return parts[0]
        except Exception:
            continue
    return ""

def extract_caption_and_tags(driver) -> Tuple[str, str]:
    try:
        meta = driver.find_element(By.XPATH, "//meta[@property='og:description' or @name='description']")
        content = (meta.get_attribute("content") or "").strip()
        m = re.search(r"“([^”]+)”|\"([^\"]+)\"", content)
        caption_meta = (m.group(1) or m.group(2)).strip() if m else content
    except NoSuchElementException:
        caption_meta = ""

    try_expand_more(driver)


    texts = []
    for xp in (
        "//*[@data-testid='post-caption']",
        "//div[@role='dialog']//h1",
        "//div[@role='dialog']//span[not(ancestor::a)]",
    ):
        try:
            for e in driver.find_elements(By.XPATH, xp):
                t = (e.text or "").strip()
                if t:
                    texts.append(t)
            if texts:
                break
        except Exception:
            continue

    if not texts:
        for xp in ("//article//h1", "//article//span[not(ancestor::a)]"):
            try:
                for e in driver.find_elements(By.XPATH, xp):
                    t = (e.text or "").strip()
                    if t:
                        texts.append(t)
                if texts:
                    break
            except Exception:
                continue

    caption_dom = max(texts, key=len) if texts else ""
    caption = (caption_dom or caption_meta or "").strip()
    caption = re.sub(r"\s*See translation$", "", caption, flags=re.IGNORECASE).strip()

    tag_set = set(re.findall(r"#\w+", caption.lower()))
    try:
        root = modal_root(driver)
        for a in root.find_elements(By.XPATH, ".//a[starts-with(@href, '/explore/tags/')]"):
            txt = (a.text or "").strip()
            if txt.startswith("#"):
                tag_set.add(txt.lower())
    except Exception:
        pass

    return caption, " ".join(sorted(tag_set))

def extract_location(driver) -> str:
    root = modal_root(driver)
    try:
        el = root.find_element(By.XPATH, ".//a[contains(@href, '/explore/locations/')]")
        t = (el.text or "").strip()
        return t
    except NoSuchElementException:
        return ""

def extract_timestamp(driver) -> str:
    root = modal_root(driver)
    try:
        return (root.find_element(By.TAG_NAME, "time").get_attribute("datetime") or "").strip()
    except NoSuchElementException:
        return ""

def extract_like_count(driver) -> int:
   
    root = modal_root(driver)

    
    for xp in [
        ".//section//button[contains(., 'likes')]",
        ".//section//a[contains(., 'likes')]",
        ".//section//button[contains(., 'beğeni')]",
        ".//section//a[contains(., 'beğeni')]",
    ]:
        try:
            els = root.find_elements(By.XPATH, xp)
            for el in els:
                txt = (el.text or "").strip()
                if not txt:
                    continue
                m = re.search(r"(\d[\d.,]*)", txt)
                if m:
                    s = m.group(1).replace(".", "").replace(",", "")
                    try:
                        return int(s)
                    except ValueError:
                        continue
        except Exception:
            continue

    
    for xp in [
        ".//*[@aria-label[contains(.,'likes')]]",
        ".//*[@aria-label[contains(.,'beğeni')]]",
    ]:
        try:
            els = root.find_elements(By.XPATH, xp)
            for el in els:
                lab = el.get_attribute("aria-label") or ""
                m = re.search(r"(\d[\d.,]*)", lab)
                if m:
                    s = m.group(1).replace(".", "").replace(",", "")
                    try:
                        return int(s)
                    except ValueError:
                        continue
        except Exception:
            continue

    #instagramda beğeni sayısı gizlenmiş ise sıfır döndür
    return 0

def go_next(driver) -> bool:
    for xp in [
        "//button[@aria-label='Next']",
        "//div[@role='button' and @aria-label='Next']",
        "//button[@aria-label='İleri']",
        "//div[@role='button' and @aria-label='İleri']",
    ]:
        try:
            btn = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, xp)))
            driver.execute_script("arguments[0].click();", btn)
            return True
        except Exception:
            continue
    try:
        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ARROW_RIGHT)
        return True
    except Exception:
        return False

#veritabanı
def init_db(db_path: str):
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            username TEXT,
            caption TEXT,
            hashtags TEXT,
            location TEXT,
            timestamp TEXT,
            hashtag TEXT NOT NULL,
            like_count INTEGER DEFAULT 0,
            UNIQUE(username, timestamp, hashtag) ON CONFLICT REPLACE
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_started_at TEXT DEFAULT (datetime('now')),
            hashtag TEXT,
            attempted_count INTEGER,
            saved_count INTEGER
        )
    """)
    # indices to speed up reruns/joins
    cur.execute("CREATE INDEX IF NOT EXISTS idx_posts_hashtag ON posts(hashtag)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_posts_time ON posts(timestamp)")
    con.commit()
    return con

def insert_or_update(con: sqlite3.Connection, row: PostRow):
    con.execute("""
        INSERT INTO posts (username, caption, hashtags, location, timestamp, hashtag, like_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(username, timestamp, hashtag) DO UPDATE SET
            caption=excluded.caption,
            hashtags=excluded.hashtags,
            location=excluded.location,
            like_count=excluded.like_count
    """, (row.username, row.caption, row.hashtags, row.location, row.timestamp, row.hashtag, row.like_count))
    con.commit()


def main():
    try:
        driver = create_driver_attach(DEBUGGER_ADDRESS)
        print(f"Attached to Chrome at {DEBUGGER_ADDRESS}")
    except WebDriverException:
        print("Could not attach to Chrome. Start Chrome with --remote-debugging-port=9222 and try again.")
        sys.exit(1)

    con = init_db(DB_PATH)

    for tag in HASHTAGS:
        context = f"#{tag}"
        print(f"\n{context}: navigating to grid")
        goto_hashtag_grid(driver, tag)

        print("Opening first post")
        open_first_post(driver)

        saved, attempts = 0, 0
        
        seen_in_run: Set[Tuple[str, str]] = set()

        while saved < MAX_PER_HASHTAG and attempts < MAX_PER_HASHTAG * 2:
            attempts += 1

            try:
                rsleep(STABILIZE)
                username = extract_username(driver)
                caption, tags = extract_caption_and_tags(driver)
                location = extract_location(driver)
                ts = extract_timestamp(driver)
                likes = extract_like_count(driver)

                
                row = PostRow(
                    username=username or "",
                    caption=caption or "",
                    hashtags=tags or "",
                    location=location or "",
                    timestamp=ts or "",
                    hashtag=context,
                    like_count=int(likes) if isinstance(likes, int) else 0
                )

                #aynı postun birden fazla kez çekilmesi önleniyor
                k = (row.username, row.caption[:120])
                if not row.timestamp and k in seen_in_run:
                    pass
                else:
                    insert_or_update(con, row)
                    if not row.timestamp:
                        seen_in_run.add(k)
                    saved += 1
                    print(f"[{context}] saved {saved}/{MAX_PER_HASHTAG}")

            except Exception as e:
                print(f"[{context}] extract error: {e}")

            moved = False
            for _ in range(NAV_RETRY):
                if go_next(driver):
                    moved = True
                    break
                time.sleep(0.25)
            if not moved:
                print(f"[{context}] cannot move to next; stopping early")
                break

        con.execute("INSERT INTO runs (hashtag, attempted_count, saved_count) VALUES (?, ?, ?)",
                    (context, attempts, saved))
        con.commit()
        print(f"{context}: done, saved={saved}")

    con.close()
    print(f"\nAll done. DB: {DB_PATH}")

if __name__ == "__main__":
    main()
