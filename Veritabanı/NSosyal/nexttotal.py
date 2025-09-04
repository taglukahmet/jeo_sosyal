import sqlite3
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


conn = sqlite3.connect("nextposts.db")
cur = conn.cursor()
cur.execute(
    """
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        author TEXT,
        text TEXT,
        hashtag TEXT,
        date TEXT,
        replies INTEGER,
        boosts INTEGER,
        favorites INTEGER
    )
    """
)
cur.execute(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_url_hashtag_unique ON posts(url, hashtag)"
)
conn.commit()


driver_path = "./chromedriver"
service = Service(driver_path)
driver = webdriver.Chrome(service=service)
wait = WebDriverWait(driver, 10)

driver.get("https://sosyal.teknofest.app/auth/sign_in")

login_button = wait.until(
    EC.element_to_be_clickable((By.CSS_SELECTOR, "a.button.button-openid_connect"))
)
login_button.click()
time.sleep(2)

username_input = wait.until(EC.presence_of_element_located((By.NAME, "username")))
username_input.send_keys("[USERNAME]")
username_input.send_keys(Keys.RETURN)
time.sleep(2)

password_input = wait.until(EC.presence_of_element_located((By.NAME, "password")))
password_input.send_keys("[PASSWORD]")
password_input.send_keys(Keys.RETURN)
time.sleep(2)

hashtags = [
    "Çevre",
    "ÇevreKoruma",
    "ÇevreDostu",
    "SürdürülebilirYaşam",
    "SıfırAtık",
    "GeriDönüşüm",
    "YeşilHayat",
    "TemizÇevre",
    "Doğa",
    "DoğayıKoru",
    "EkolojikYaşam",
    "Ekoloji",
    "Biyoçeşitlilik",
    "DoğalKaynaklar",
    "AtıkYönetimi",
    "PlastiksizYaşam",
    "DoğaSevgisi",
    "SuTasarrufu",
    "HavaTemizliği",
    "SuKirliliği",
    "İklim",
    "İklimDeğişikliği",
    "KüreselIsınma",
    "İklimKrizi",
    "İklimEylemi",
    "İklimAdaleti",
    "TemizEnerji",
    "YenilenebilirEnerji",
    "GüneşEnerjisi",
    "RüzgarEnerjisi",
    "YeşilEnerji",
    "EnerjiVerimliliği",
    "KarbonAyakİzi",
    "KarbonNötr",
    "SürdürülebilirEnerji",
    "DoğaİçinEnerji",
    "FosilYakıtlarıBırak",
    "MaviEnerji",
    "YeşilGelecek",
    "EnerjiTasarrufu",
    "Şehircilik",
    "KentselDönüşüm",
    "KentselGelişim",
    "KentselTasarım",
    "KentEstetiği",
    "KentKültürü",
    "KentYaşamı",
    "ŞehirPlanlama",
    "Mimarlık",
    "YeşilMimari",
    "AkıllıŞehirler",
    "DayanıklıŞehirler",
    "YaşanabilirŞehirler",
    "KentselAltyapı",
    "TopluTaşıma",
    "BisikletYolları",
    "YayaAlanları",
    "AkıllıUlaşım",
    "KentMobilyaları",
    "KentPeyzajı",
    "Orman",
    "Ağaçlandırma",
    "FidanDik",
    "OrmanYangını",
    "SulakAlanlar",
    "MilliParklar",
    "DoğaKoruma",
    "Ekosistem",
    "YeşilAlan",
    "SirazDoğa",
    "GölKoruma",
    "DenizTemizliği",
    "Okyanus",
    "BiyolojikÇeşitlilik",
    "HabitatKoruma",
    "Doğasever",
    "KuşGöçü",
    "YabanHayatı",
    "DoğaGönüllüsü",
    "DoğayaSaygı",
    "YeşilPolitika",
    "ÇevreHareketi",
    "SürdürülebilirKalkınma",
    "2030Hedefleri",
    "UNSDG",
    "GelecekNesiller",
    "TemizHava",
    "TemizSu",
    "YaşanabilirDünya",
    "AdilDönüşüm",
    "YeşilEkonomi",
    "DoğaHakları",
    "KüreselEylem",
    "İklimİçinBirlik",
    "GençlikVeİklim",
    "DoğaİçinBirlik",
    "ÇevreHakkı",
    "ÇevreBilinci",
    "EkolojikDenge",
    "GelecekİçinDoğa"
]

for hashtag in hashtags:
    driver.get(f"https://sosyal.teknofest.app/tags/{hashtag}")
    time.sleep(3)
    posinset = 1
    while True:
        try:
            post = wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, f'article[aria-posinset="{posinset}"]'))
            )

           
            author = post.find_element(By.CSS_SELECTOR, ".display-name__html").text
            content = post.find_element(By.CSS_SELECTOR, ".status__content__text").text
            url = driver.current_url + f"#post-{posinset}"

            
            try:
                date = post.find_element(By.CSS_SELECTOR, "time").get_attribute("title")
            except:
                date = None

           
            try:
                replies = post.find_element(By.CSS_SELECTOR, 'button[title="Reply"] .icon-button__counter').text
                replies = int(replies) if replies else 0
            except:
                replies = 0

            try:
                boosts = post.find_element(By.CSS_SELECTOR, 'button[title="Boost"] .icon-button__counter').text
                boosts = int(boosts) if boosts else 0
            except:
                boosts = 0

            try:
                favorites = post.find_element(By.CSS_SELECTOR, 'button[title*="favorites"] .icon-button__counter').text
                favorites = int(favorites) if favorites else 0
            except:
                favorites = 0

            
            cur.execute(
                """
                INSERT OR IGNORE INTO posts 
                (url, author, text, hashtag, date, replies, boosts, favorites) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (url, author, content, hashtag, date, replies, boosts, favorites)
            )
            conn.commit()
            print(f"[{hashtag}] Post {posinset} kaydedildi.")

           
            post_y = post.location['y']
            post_height = post.size['height']
            driver.execute_script(f"window.scrollTo(0, {post_y + post_height + 10});")
            time.sleep(0.1)

            posinset += 1
        except:
            print(f"{hashtag} etiketi için tüm postlar alındı.\n")
            break

driver.quit()
conn.close()