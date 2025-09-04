Türkiye Sosyal Medya Duygu Analiz Platformu
Türkiye illerine yönelik, interaktif haritalar, gerçek zamanlı analizler ve kapsamlı karşılaştırma araçları içeren, React tabanlı bir sosyal medya duygu analizi platformu.

Özellikler
İnteraktif Türkiye Haritası: Ayrıntılı analizleri görmek için illere tıklayın

Gerçek Zamanlı Duygu Analizi: Sosyal medya duygu durumunun canlı takibi

Şehir Karşılaştırması: Aynı anda 3 şehre kadar yan yana karşılaştırma

Ulusal Gündem Takibi: Ülke genelindeki trendleri ve konuları izleyin

Gelişmiş Filtreleme: Hashtag'lere, duygu durumuna ve bölgelere göre filtreleme

Çoklu Platform Analizi: X (Twitter), Instagram ve Next Sosyal desteği

Backend Entegrasyonu
Gerekli API Uç Noktaları

Frontend, aşağıdaki backend API yapısıyla çalışacak şekilde yapılandırılmıştır:

İl Verileri

GET /api/provinces              - Tüm illeri güncel verilerle getir
GET /api/provinces/{id}/data      - Belirli bir il için detaylı veri getir
POST /api/provinces/filter        - İlleri kriterlere göre filtrele
POST /api/provinces/compare       - Birden fazla il için karşılaştırmalı veri getir
GET /api/provinces/{id}/realtime    - İl için gerçek zamanlı güncellemeler

Sosyal Medya Analizi

GET /api/social-media/city/{cityName}     - Belirli bir şehir için sosyal medya verisi
GET /api/social-media/national          - Ulusal sosyal medya karşılaştırması
GET /api/social-media/platform/{platform} - Platforma özel analizler
GET /api/social-media/trending          - Trend konular ve hashtag'ler

Ulusal Gündem

GET /api/national-agenda            - Ulusal duygu durumu ve trend verileri
GET /api/national-agenda/weekly-trends      - Haftalık ulusal trendler
GET /api/national-agenda/regional-performance - Bölgesel performans verileri
GET /api/national-agenda/insights         - Ulusal içgörüler ve bulgular
GET /api/national-agenda/platform-comparison  - Ulusal platform karşılaştırması

Filtreleme Seçenekleri

GET /api/filters/options          - Mevcut filtreleme seçenekleri (hashtag'ler, bölgeler, vb.)

Backend Entegrasyon Dosyaları

Aşağıdaki dosyalar, axios ve React Query ile backend entegrasyon kodunu içerir:

API Servis Dosyaları

src/services/api.ts - Interceptor'lar ile ana axios konfigürasyonu

src/services/provinceService.ts - İl bazlı API çağrıları

src/services/socialMediaService.ts - Sosyal medya analiz API çağrıları

src/services/nationalAgendaService.ts - Ulusal gündem API çağrıları

Özel Hook'lar

src/hooks/useBackendData.ts - Veri çekme ve önbelleğe alma için React Query hook'ları

Bileşen Entegrasyon Noktaları

src/pages/Index.tsx - İl verilerini çeken ana kontrol paneli

src/components/TurkeyMap.tsx - Gerçek zamanlı il verisi güncellemeleri

src/components/CityDetailPanel.tsx - Şehir analizleri ve gerçek zamanlı güncellemeler

src/components/FilterInterface.tsx - Backend'den gelen dinamik filtreleme seçenekleri

src/components/ComparisonView.tsx - Çoklu şehir karşılaştırma verisi

src/components/NationalAgendaPanel.tsx - Ulusal trendler ve içgörüler

src/components/SocialMediaComparison.tsx - Platforma özel analizler

Konfigürasyon

src/services/api.ts dosyasındaki API temel URL'sini güncelleyin:

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api'  // Yerel backend URL'niz
  : '[https://your-backend-domain.com/api](https://your-backend-domain.com/api)';  // Üretim URL'si

Gerçek Zamanlı Güncellemeler

Gerçek zamanlı güncellemeler için WebSocket bağlantıları uygulanabilir:

İl duygu durumu değişiklikleri

Ulusal trend konular

Canlı etkileşim metrikleri

Yerel Geliştirme
Depoyu klonlayın: git clone [depo_url'niz]

Bağımlılıkları yükleyin: npm install

src/services/api.ts dosyasındaki API uç noktalarını güncelleyin

Geliştirme sunucusunu başlatın: npm run dev

Backend sunucunuzu 3001 portunda başlatın (veya api.ts dosyasında portu güncelleyin)

Teknolojiler
Frontend: Vite, TypeScript, React, shadcn-ui, Tailwind CSS

Grafikler: Veri görselleştirme için Recharts

HTTP İstemcisi: API çağrıları için Axios

Yönlendirme: React Router DOM

Durum Yönetimi: React Query önbellekleme ve React hook'ları ile durum yönetimi

Proje Yapısı
src/
├── components/         # UI bileşenleri
├── services/           # Backend API servisleri (YENİ)
├── hooks/              # Özel React Query hook'ları (YENİ)
├── types/              # TypeScript arayüzleri
├── frontend_data/      # Mock verisi (backend ile değiştirilecek)
└── pages/              # Rota bileşenleri

Dağıtım
Uygulama herhangi bir statik barındırma hizmetine dağıtılabilir. Backend entegrasyonu için şunlardan emin olun:

Backend'inizde CORS'un doğru yapılandırıldığından

API uç noktalarının beklenen yapıyla eşleştiğinden

Ortam değişkenlerinin doğru ayarlandığından

Katkıda Bulunma
Backend entegrasyon noktaları için kod tabanındaki TODO yorumlarını takip edin

Tüm API çağrıları önbelleğe alma ve hata yönetimi için React Query kullanır

API yanıtları için TypeScript arayüzlerini koruyun

Hem mock verileriyle hem de gerçek backend yanıtlarıyla test edin

