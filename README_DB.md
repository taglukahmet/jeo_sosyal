### Veri Elde Etme Aşamaları

Bu proje, bakanlık çalışmalarına ilişkin hashtag'leri içeren sosyal medya paylaşımlarını elde etmek amacıyla geliştirilmiştir. Veri toplama sürecinde, Türkiye'nin yerli sosyal medyası olan **NSosyal** ve aynı zamanda dünyada en çok kullanılan platformlar olan **Instagram** ve **X** hedeflenmiştir.

Her bir sosyal medya platformunun veri elde etme zorlukları ve kısıtlayıcı yapısı nedeniyle **API kullanımı**ndan kaçınılmıştır. Kısıtlayıcı ve maliyetli API'ler yerine **Selenium WebDriver** kütüphanesi tercih edilmiştir. Bu metodoloji, her platformun kendine özgü veri yapısına ve zorluklarına uygun, ayrı algoritmalar geliştirilmesini sağlamıştır. Bu sayede, verilerin daha doğru ve kapsamlı bir şekilde toplanması mümkün olmuştur.

-----

### NSosyal Veri Toplama Aracı

#### Nasıl Çalışır?

Kod, **Selenium WebDriver** kütüphanesi kullanarak bir web tarayıcısını kontrol eder. Önceden tanımlanmış bir kullanıcı adı ve şifre ile platforma giriş yapar. Ardından, bir hashtag listesini dolaşarak her bir hashtag sayfasına gider ve sonsuz kaydırma özelliğini kullanarak tüm gönderileri çeker. Çekilen her bir gönderi verisi (yazar, içerik, tarih, etkileşimler vb.), aynı klasördeki **SQLite** veritabanına kaydedilir. Veritabanına veri eklenirken, mükerrer kayıtların önüne geçmek için `INSERT OR IGNORE` komutu kullanılır.

#### Kurulum ve Kullanım

**Gereksinimler**

  * Python 3.x
  * Google Chrome web tarayıcısı

**Kütüphaneleri Kurma**
Öncelikle, gerekli Python kütüphanelerini terminal veya komut istemcisi üzerinden kurmanız gerekir:

```bash
pip install selenium
```

**Giriş Bilgilerinizi Güncelleme**
Kod, otomatik giriş yapmak için kullanıcı adı ve şifreye ihtiyaç duyar. Aşağıdaki satırları kendi NSosyal hesabınızın bilgileriyle değiştirmeniz gerekmektedir:

```python
username_input.send_keys(“[USERNAME]”)
password_input.send_keys(“[PASSWORD]”)
```

**Kodu Çalıştırma**
Tüm kurulumları tamamladıktan sonra, `nexttotal.py` dosyasını terminalden çalıştırın:

```bash
python nexttotal.py
```

-----

### Instagram Veri Toplama Aracı

Bu Python kodu, Instagram platformundan belirli hashtag'lere sahip paylaşımları otomatize bir şekilde toplamayı amaçlamaktadır. Elde edilen veriler, yerel bir **SQLite** veritabanında saklanır.

#### Nasıl Çalışır?

Bu araç, **Selenium WebDriver** kütüphanesini kullanarak bir web tarayıcısına bağlanır ve onu kontrol eder. Kod, önceden tanımlanmış hashtag listesini tek tek dolaşır. Her hashtag için, o etikete ait gönderiler listesine gidilir, ilk gönderi açılır ve tüm veriler (kullanıcı adı, açıklama, hashtagler, konum, beğeni sayısı vb.) çekilir. Daha sonra, bir sonraki gönderiye otomatik olarak geçilir ve bu işlem, belirlenen limit dahilinde tüm gönderiler için tekrarlanır. Toplanan veriler, `instagramposts.db` dosyasına kaydedilir. Veri tabanına kaydedilen her gönderi için, mükerrer kayıtları önlemek amacıyla `ON CONFLICT REPLACE` komutu kullanılır. Bu sayede aynı gönderi birden fazla kez kaydedilmez veya eğer veri değişmişse güncellenir.

#### Kurulum ve Kullanım

Bu aracı kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla izleyin.

**Gereksinimler**

  * Python 3.x
  * Google Chrome web tarayıcısı

<!-- end list -->

1.  **Kütüphaneleri Kurma**
    Öncelikle, gerekli Python kütüphanelerini terminal veya komut istemcisi üzerinden kurmanız gerekir:

    ```bash
    pip install selenium webdriver-manager
    ```

2.  **ÖNEMLİ: Tarayıcıyı Hazırlama**
    Bu adım, script'in düzgün çalışması için hayati önem taşır. Öncelikle, Chrome'u aşağıdaki komutla özel modda başlatmanız gerekir. Bu komutu çalıştırdığınızda yeni bir Chrome penceresi açılacaktır.

      * **Windows:**
        ```
        "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp_profile"
        ```
      * **macOS:**
        ```
        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=~/tmp/chrome_profile
        ```
      * **Linux:**
        ```
        google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome_profile
        ```

    Bu özel tarayıcı penceresinde Instagram hesabınıza giriş yapın. Script bu pencereyi kullanacağı için giriş yapmış olmanız gerekir. Bu pencere açık tutulmalıdır.

3.  **Kodu Çalıştırma**
    Tüm kurulumları tamamladıktan ve tarayıcıyı hazırlayıp giriş yaptıktan sonra, `instagramtotal.py` dosyasını terminalden çalıştırın:

    ```bash
    python instagramtotal.py
    ```

    Kod çalışmaya başladığında, verileri otomatik olarak çekmeye başlayacaktır. İşlem tamamlandığında, aynı dizinde `instagramposts.db` adında bir veritabanı dosyası oluşacaktır.

-----

### X (Twitter) Veri Toplama Aracı

Bu Python kodu, **X** platformundan belirli hashtag'lere sahip paylaşımları otomatik olarak toplamak için tasarlanmıştır. Proje, veri çekme işlemini gerçekleştiren ana bir bot (`twitterbot.py`), komut satırı arayüzünden hashtag'leri okuyan ve botu çalıştıran bir ana dosya (`main.py`) ve giriş bilgilerini güvenli bir şekilde yöneten yardımcı bir modülden (`secrets.py`) oluşur.

#### Nasıl Çalışır?

Kod, **Selenium WebDriver** kütüphanesini kullanarak bir Chrome tarayıcı oturumu başlatır ve kontrol eder. Giriş bilgilerinizi içeren `credentials.txt` dosyasını okuyarak otomatik olarak hesabınıza giriş yapar. `main.py` dosyası, `yeni_hashtagler.txt` dosyasından toplanacak hashtag'leri okur.

Her bir hashtag için bot, ilgili arama sayfasına gider ve sayfayı aşağı kaydırarak yeni gönderileri yükler. Bu süreçte her bir tweet'in metnini, yazarını, tarihini ve etkileşim sayılarını (cevap, repost, beğeni ve görüntülenme) çeker. Veriler, `tweets.db` adında yerel bir **SQLite** veritabanına kaydedilir. Bot, platformun hız limitlerini aşmamak için akıllı bekleme süreleri kullanır ve bu sayede veri toplama işlemi daha güvenli ve istikrarlı hale gelir. Aynı zamanda, mükerrer kayıtları engellemek için veritabanında benzersizlik kontrolü yapılır.

#### Kurulum ve Kullanım

Kodu kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izlemeniz gerekmektedir.

**Gereksinimler**

  * Python 3.x
  * Google Chrome web tarayıcısı

<!-- end list -->

1.  **Proje Dosyalarını Ayarlama**
    Tüm proje dosyalarının (`twitterbot.py`, `main.py`, `secrets.py`, `credentials.txt`, `yeni_hashtagler.txt` ve `requirements.txt`) aynı klasör içinde olduğundan emin olun.

2.  **Kütüphaneleri Kurma**
    Gerekli Python kütüphanelerini kurmak için terminal veya komut istemcisinde aşağıdaki komutu çalıştırın. `webdriver-manager` paketi sayesinde, `chromedriver` dosyasını manuel olarak indirmenize gerek kalmaz, bu paket Chrome sürümünüze uygun olanı otomatik olarak kurar.

    ```bash
    pip install selenium webdriver-manager
    ```

3.  **Giriş Bilgilerinizi Ayarlama**
    `credentials.txt` dosyasını bir metin düzenleyici ile açın ve aşağıdaki satırlara kendi X (Twitter) e-posta adresinizi ve şifrenizi girin:

    ```
    email: #HESAP EPOSTA
    password: #HESAP SİFRE
    ```

    Burada e-posta adresiniz ve şifreniz, sırasıyla `#HESAP EPOSTA` ve `#HESAP SİFRE` etiketlerinin yerine yazılmalıdır.

4.  **Hashtag Listesini Güncelleme**
    Eğer veri toplamak istediğiniz hashtag'leri değiştirmek isterseniz, `yeni_hashtagler.txt` dosyasını düzenleyebilirsiniz. Her bir hashtag ayrı bir satırda veya virgül ya da boşluklarla ayrılmış şekilde yer alabilir.

5.  **Kodu Çalıştırma**
    Tüm ayarları tamamladıktan sonra, terminalden aşağıdaki komutu çalıştırarak veri toplama işlemini başlatın:

    ```bash
    python main.py
    ```

    Kod çalışmaya başladığında, bir Chrome penceresi açılacak ve veri toplama işlemi otomatik olarak başlayacaktır. Toplanan veriler aynı dizinde bulunan `tweets.db` dosyasına kaydedilecektir.

-----

### İl ve İlçe Belirleme Algoritması

Bu Python betiği, daha önce topladığınız sosyal medya verilerinizin içeriklerini analiz ederek, gönderilerde geçen Türkiye'deki il ve ilçe isimlerini tespit eder ve bu bilgileri veritabanınıza ekler.

#### Nasıl Çalışır?

Betiğin çalışma mantığı oldukça basittir ve aşağıdaki adımlardan oluşur:

**Veritabanı Bağlantısı ve Hazırlığı**: Öncelikle, kodun en başında yer alan `[db_ismi]` bölümünü, topladığınız verilerin bulunduğu veritabanı dosyasının adıyla değiştirmeniz gerekir (örneğin: `nextposts.db`, `instagramposts.db` veya `tweets.db`). Ardından, betik, mevcut `posts` tablonuza `il` ve `ilce` adında iki yeni sütun ekler.

**Coğrafi Veri Eşleştirme**: Kodun içerisinde Türkiye'deki tüm il ve ilçelerin listesini içeren kapsamlı bir sözlük bulunmaktadır. Bu sözlük, gönderi metinlerindeki konum bilgilerini bulmak için bir referans olarak kullanılır.

**Arama ve Güncelleme**: Betik, veritabanındaki her bir gönderiyi tek tek okur ve şu iki aşamalı arama işlemini gerçekleştirir:

  * **İlçe Arama**: İlk olarak, gönderi metninde listelenen tüm ilçe isimlerini aramaya başlar. Eğer bir ilçe adı bulursa, ilgili ilin adını da otomatik olarak belirler ve arama işlemini durdurur. Bu, daha spesifik bir konum bilgisi yakalamayı sağlar.
  * **İl Arama**: Eğer gönderi metninde bir ilçe adı bulunamazsa, bu sefer sadece il isimlerini aramaya geçer. Metinde geçen ilk il adını bulduğunda onu kaydeder.

**Veritabanını Temizleme**: Son olarak, betik veritabanında metni boş olan veya il/ilçe bilgisi tespit edilemeyen gönderileri siler. Bu işlem, veri setinizi daha temiz ve kullanılabilir hale getirir. Betiğin sonunda ekrana "İl ve ilçe isimleri işlendi, boş satırlar silindi." mesajı basılır. Bu, işlemin başarıyla tamamlandığını gösterir. Artık veritabanınızda her bir gönderi için olası il ve ilçe bilgileri etiketlenmiş olacaktır.

-----

### Duygu Analizi

#### Nasıl Çalışır?

Bu script, daha önce topladığınız ham veritabanı dosyalarını (`nextposts.db`, `tweets.db`, vb.) okur ve her bir gönderiyi ileri düzey analizlerle zenginleştirerek yeni bir veritabanına kaydeder. Betik, içeriği otomatik olarak analiz eder ve üç ana zenginleştirme işlemi uygular:

**Duygu Analizi (Sentiment Analysis)**: Gönderi metninin duygusunu (`positive`, `negative`, `neutral`) belirler ve bu analizin güvenilirliğini (`confidence`) yüzde olarak belirtir. Bu işlem için öncelikli olarak **BitNet** modelini kullanmaya çalışır. Eğer BitNet için gerekli GPU veya CPU kaynakları bulunamazsa, sırasıyla Türkçe veya çok dilli **BERT** modellerine düşer. Ayrıca, anahtar kelime tabanlı kurallarla (örneğin; "teşekkürler" içeren gönderilere pozitif, "deprem" içerenlere negatif duygu atanması gibi) duygu analizinin doğruluğunu artırır.

**Konum Tespiti**: Gönderi metni ve yazar adında geçen Türkiye'deki il ve ilçe isimlerini arar. Öncelikle daha spesifik olan ilçe ismini bulmaya çalışır, bulamazsa il ismini tespit eder. Bu bilgileri de güvenilirlik derecesiyle birlikte veritabanına ekler.

**Metin Zenginleştirme**: Her bir gönderi metninden URL'leri ve hashtag'leri ayıklayarak ayrı sütunlara kaydeder. Ayrıca, farklı veritabanı formatlarından gelen tarih ve saat bilgilerini standart bir formata dönüştürür ve metindeki karakter kodlama hatalarını düzeltmeye çalışır.

#### Kullanım

Bu betik, komut satırından çalışacak şekilde tasarlanmıştır.

**Gereksinimleri Karşılayın**

  * Bu betik, ana makine öğrenimi kütüphaneleri olan **PyTorch** ve **Transformers**'ı kullanır. Bu kütüphaneleri kurmanız gerekmektedir.
  * İl ve ilçe verileri için `tr_il_ilce.json` dosyasının da betikle aynı dizinde veya ortam değişkenlerinde belirtilen bir yolda bulunması beklenir.

**Çalıştırma Komutu**

  * Terminali veya komut istemcisini açın ve betiğin bulunduğu klasöre gidin.
  * Aşağıdaki komutu kullanarak zenginleştirme işlemini başlatın. Burada `giriş_db_dosyası.db` sizin topladığınız ham verileri içeren veritabanı dosyasının adıdır.
    ```bash
    python Duygu_analiz.py giriş_db_dosyası.db
    ```

**Çıktı**

  * Betiğin çalışması tamamlandığında, giriş veritabanı dosyanızın adı kullanılarak yeni bir veritabanı dosyası (`giriş_db_dosyası_enriched.db`) oluşturulur.
  * Bu yeni veritabanı, ham verilerle birlikte duygu, konum ve diğer zenginleştirilmiş bilgileri içeren `tweets_enriched` adlı yeni bir tablo içerir.
  * İsteğe bağlı olarak, `--output-db` argümanıyla çıktı veritabanı için farklı bir isim belirleyebilirsiniz. Örneğin: `python Duygu_analiz.py tweets.db --output-db zenginlestirilmis_tweets.db`
