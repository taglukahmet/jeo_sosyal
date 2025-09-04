Bu platformun genel yapısı ve işleyişi hakkında detaylı bir Türkçe özet hazırlayabilirim.

-----

# Türkiye Sosyal Medya Duygu Analiz Platformu

Bu proje, Türkiye'deki illere yönelik sosyal medya duygu analizi yapabilen, **React** tabanlı bir platformdur. Kullanıcılar, etkileşimli haritalar, gerçek zamanlı veriler ve kapsamlı karşılaştırma araçları sayesinde sosyal medyadaki gündemi ve duygu durumunu kolayca takip edebilirler.

## Ana Özellikler

  * **Etkileşimli Türkiye Haritası**: Harita üzerinde bir şehre tıklayarak o şehre ait detaylı analiz verilerine ulaşın.
  * **Gerçek Zamanlı Duygu Analizi**: Sosyal medyadaki duygu değişimlerini anlık olarak izleyin.
  * **Şehir Karşılaştırma**: Aynı anda en fazla 3 şehri seçerek duygu analiz verilerini karşılaştırın.
  * **Ulusal Gündem Takibi**: Ülke genelindeki trendleri ve popüler konuları anında görün.
  * **Gelişmiş Filtreleme**: Hashtag'lere, duygu durumlarına ve bölgelere göre verileri filtreleyin.
  * **Çoklu Platform Analizi**: X (Twitter), Instagram ve Next Sosyal platformlarından gelen verileri destekler.

## Arka Uç (Backend) Entegrasyonu

Frontend (ön uç) kısmı, belirli bir arka uç API yapısıyla çalışacak şekilde tasarlanmıştır.

### Gerekli API Uç Noktaları

Aşağıdaki API uç noktaları, platformun işlevselliği için gereklidir:

#### İl Verileri

  - `GET /api/provinces`: Tüm illerin güncel verilerini getirir.
  - `GET /api/provinces/{id}/data`: Belirli bir ilin detaylı verilerini sağlar.
  - `POST /api/provinces/filter`: Belirlenen kriterlere göre illeri filtreler.
  - `POST /api/provinces/compare`: Birden fazla ilin karşılaştırmalı verilerini sunar.
  - `GET /api/provinces/{id}/realtime`: Belirli bir il için gerçek zamanlı güncellemeler sağlar.

#### Sosyal Medya Analizi

  - `GET /api/social-media/city/{cityName}`: Belirli bir şehir için sosyal medya verilerini getirir.
  - `GET /api/social-media/national`: Ulusal sosyal medya verilerini karşılaştırır.
  - `GET /api/social-media/platform/{platform}`: Belirli bir platforma özgü analizleri sunar.
  - `GET /api/social-media/trending`: Trend olan konuları ve hashtagleri listeler.

#### Ulusal Gündem

  - `GET /api/national-agenda`: Ulusal duygu durumu ve trend verilerini sağlar.
  - `GET /api/national-agenda/weekly-trends`: Haftalık ulusal trendleri gösterir.
  - `GET /api/national-agenda/regional-performance`: Bölgelerin performans verilerini sunar.
  - `GET /api/national-agenda/insights`: Ulusal verilere dayalı içgörüleri getirir.
  - `GET /api/national-agenda/platform-comparison`: Ulusal düzeyde platform karşılaştırması yapar.

#### Filtre Seçenekleri

  - `GET /api/filters/options`: Kullanılabilecek filtre seçeneklerini (hashtag'ler, bölgeler vb.) sunar.

### Entegrasyon Dosyaları

Arka uç entegrasyonu için **Axios** ve **React Query** kullanılmıştır.

  * `src/services/api.ts`: Ana Axios konfigürasyonu.
  * `src/services/provinceService.ts`: İllerle ilgili API çağrılarını içerir.
  * `src/services/socialMediaService.ts`: Sosyal medya analiz API çağrılarını barındırır.
  * `src/services/nationalAgendaService.ts`: Ulusal gündem API çağrılarını içerir.
  * `src/hooks/useBackendData.ts`: Veri getirme ve önbelleğe alma için React Query kancaları (hooks).

### Gerçek Zamanlı Güncellemeler

Platformun anlık veri akışı sağlaması için **WebSocket** bağlantıları kullanılabilir. Bu bağlantılarla, illerin duygu durumundaki değişiklikler, ulusal trend konuları ve canlı etkileşim metrikleri anlık olarak güncellenir.

## Yerel Geliştirme

1.  Depoyu klonlayın: `git clone <depo-adresi>`
2.  Bağımlılıkları yükleyin: `npm install`
3.  `src/services/api.ts` dosyasındaki API temel URL'sini güncelleyin.
4.  Geliştirme sunucusunu başlatın: `npm run dev`
5.  Arka uç sunucunuzu 3001 numaralı porta (veya `api.ts`'deki portu güncelleyerek) başlatın.

## Kullanılan Teknolojiler

  * **Ön Uç**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
  * **Grafikler**: Recharts
  * **HTTP İstemci**: Axios ve React Query
  * **Yönlendirme**: React Router DOM
  * **Durum Yönetimi**: React Query önbellek yönetimi ile React hooks

## Proje Yapısı

```
src/
├── components/           # Kullanıcı arayüzü bileşenleri
├── services/            # Arka uç API hizmetleri
├── hooks/               # Özel React Query kancaları
├── types/               # TypeScript arayüzleri
├── frontend_data/       # Deneme verileri
└── pages/               # Sayfa bileşenleri
```
