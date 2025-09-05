import React from 'react';
import { ArrowLeft, Users, Target, Database, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen dashboard-gradient">
      {/* Header */}
      <header className="glass-panel border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary">Hakkında</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Mission */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Target className="w-7 h-7 text-primary" />
              Proje Misyonu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed text-justify">
              <strong>JeoSosyal: Türkiye'nin Bölgesel Panoraması</strong>, Türkiye Cumhuriyeti Çevre, Şehircilik ve İklim Değişikliği Bakanlığının 
              çevre politikalarına yönelik halkın duygusal tepkilerini ve katılımını görselleştiren kapsamlı bir platform olarak 
              TEKNOFEST “Geleceğin Sürdürülebilir Şehirleri Hackathonu” için geliştirilmiştir.
            </p>
            <p className="text-muted-foreground text-justify">
            Bu projenin temel amacı, sosyal medya verilerini analiz ederek, bakanlıkların ve yetkili kuruluşların halkın çevre konularındaki algısını daha iyi anlamalarını sağlamak ve veri odaklı karar alma süreçlerini desteklemektir. Bu sayede, toplumsal öncelikler, bölgesel sorunlar ve duyarlılıklar tespit edilerek kamu politikalarının geliştirilmesine ve sürdürülebilir şehircilik alanında etkin çözümler üretilmesine katkı sağlamak hedeflenmektedir.
            </p>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Database className="w-7 h-7 text-primary" />
              Metodoloji
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-accent text-center ">Veri Elde Etme Yöntemi</h4>
                <p className="text-sm text-muted-foreground text-justify">
                Güncel toplumsal eğilimleri ve kamu gündemini yansıtmak amacıyla sosyal medya verileri üç ana platformdan toplanmaktadır: yerli bir sosyal medya ağı olan NSosyal, küresel erişime sahip Instagram ve X (eski adıyla Twitter). Bu platformlar, kullanıcıların bakanlıklar ve çevresel konular gibi belirli başlıklara yönelik görüş ve duyarlılıklarını ifade ettikleri geniş bir veri havuzu sunmaktadır.

Veri toplama sürecinde, özellikle bu platformların API erişiminde uyguladığı kısıtlamaları aşmak için Selenium WebDriver gibi otomasyon araçlarından faydalanılmaktadır. Bu araç, belirlenen bakanlık çalışmalarıyla ilgili hashtagler üzerinden otomatik olarak filtreleme yaparak ilgili gönderileri dinamik bir şekilde taramaktadır. Elde edilen metin ve hashtag verileri, daha sonraki analiz adımları için titizlikle işlenerek merkezi bir veritabanına kaydedilmektedir. Bu metodoloji, farklı sosyal medya kaynaklarından gelen verilerin tutarlı ve bütüncül bir biçimde derlenmesini sağlayarak, kapsamlı ve derinlemesine bir analiz yapılmasına olanak tanımaktadır. Bu sayede, kamuoyunun belirli konulara yönelik nabzı doğru ve güncel bir şekilde tutulabilmektedir.</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-accent text-center ">Analiz Yöntemi</h4>
                <p className="text-sm text-muted-foreground text-justify">
                
Toplanan veriler, iki ana aşamada analiz edilmektedir. İlk aşamada, gönderilerin coğrafi konumları tespit edilmektedir. Halihazırda konum bilgisi etiketlenmiş gönderilerin yanı sıra, konum etiketi olmayan postlar için kendi geliştirdiğimiz bir anahtar kelime tespiti (keyword detection) uygulaması kullanılmaktadır. Bu uygulama, post açıklamalarındaki metinleri analiz ederek il ve ilçe isimlerini belirlemekte ve gönderiyi ilgili konuma etiketlemektedir.

İkinci aşamada ise, kullanıcıların paylaşımlarındaki duyarlılıkları analiz etmek amacıyla duygu analizi gerçekleştirilmektedir. Bu kritik aşamada, geleneksel kelime bazlı duygu analizi modellerinin bağlamsal yetersizlikleri göz önünde bulundurularak, daha gelişmiş bir yaklaşıma geçilmiştir. Bu amaçla, Microsoft BitNet adlı hafif ve güçlü bir büyük dil modeli (LLM) kullanılmıştır. BitNet modelinin yerel bilgisayarlarda çalıştırılması tercih edilerek hem API kullanım maliyetlerinden kaçınılmış hem de verilerin çevrimiçi platformlara yüklenmeyerek gizliliği ve güvenliği sağlanmıştır. BitNet, gönderi açıklamalarının bağlamını doğru bir şekilde anlayarak, her bir paylaşımın duygusunu pozitif, negatif veya nötr olarak sınıflandırmaktadır. Bu sayede, toplumsal duyarlılıklar hakkında daha derin ve doğru içgörüler elde edilmektedir.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-accent text-center">Teknik Özellikler</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">81</div>
                  <div className="text-sm text-muted-foreground">İl Kapsamı</div>
                </div>
                <div className="bg-accent/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-2">Gerçek Zamanlı</div>
                  <div className="text-sm text-muted-foreground">Veri Güncelleme</div>
                </div>
                <div className="bg-sentiment-positive/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-sentiment-positive mb-2">Konum ve Duygu Analizi</div>
                  <div className="text-sm text-muted-foreground">Analiz Boyutu</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TEKNOFEST */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Award className="w-7 h-7 text-primary" />
              TEKNOFEST 2025
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed text-justify">
              Bu proje, TEKNOFEST 2025 "Geleceğin Sürdürülebilir Şehirleri" kategorisi için özel olarak geliştirilmiş 
              bir Minimum Viable Product (MVP) olarak tasarlanmıştır.
            </p>
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-6">
              <h4 className="font-semibold text-lg mb-3">Hedef Kitle</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">Bakanlıklar</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Database className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-sm font-medium">Araştırmacılar</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-sentiment-positive/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-sentiment-positive" />
                  </div>
                  <div className="text-sm font-medium">Hackathon Jürisi</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="w-7 h-7 text-primary" />
              METUNATION
            </CardTitle>
          </CardHeader>
          <CardContent>
    <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-accent">Takım Tanıtımı</h3>
        <p className="text-muted-foreground">
            Bilgisayar bilimleri ve veri analizi alanlarında uzman multidisipliner bir takım tarafından geliştirilmektedir.
        </p>
    </div>
    
    <div className="mt-8 grid grid-cols-5 gap-8 items-start">
        <div className="flex flex-col items-center space-y-2">
            <img src="https://i.imgur.com/AE5jfAI.png" alt="Barış Gürel" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
            <h4 className="font-semibold text-lg text-foreground">Yunus Emre Gebeş</h4>
            <p className="text-sm text-muted-foreground">Orta Doğu Teknik Üniversitesi</p>
            <p className="text-xs text-muted-foreground">Fizik</p>
            <p className="text-xs font-medium text-accent">Takım Kaptanı</p>
        </div>

        <div className="flex flex-col items-center space-y-2">
            <img src="https://i.imgur.com/17mx6zW.png" alt="Melih Tarık Arslan" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
            <h4 className="font-semibold text-lg text-foreground">Melih Tarık Arslan</h4>
            <p className="text-sm text-muted-foreground">Boğaziçi Üniversitesi</p>
            <p className="text-xs text-muted-foreground">Bilgisayar Mühendisliği</p>
            <p className="text-xs font-medium text-accent">Takım Üyesi</p>
        </div>

        <div className="flex flex-col items-center space-y-2">
            <img src="https://i.imgur.com/IA6lhW3.png" alt="Ahmet Tağluk" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
            <h4 className="font-semibold text-lg text-foreground">Ahmet Tağluk</h4>
            <p className="text-sm text-muted-foreground">Orta Doğu Teknik Üniversitesi</p>
            <p className="text-xs text-muted-foreground">Bilgisayar Mühendisliği</p>
            <p className="text-xs font-medium text-accent">Takım Üyesi</p>
        </div>

        <div className="flex flex-col items-center space-y-2">
            <img src="https://i.imgur.com/BVObcND.png" alt="Barış Gürel" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
            <h4 className="font-semibold text-lg text-foreground">Barış Gürel</h4>
            <p className="text-sm text-muted-foreground">Boğaziçi Üniversitesi</p>
            <p className="text-xs text-muted-foreground">Elektrik-Elektronik Mühendisliği</p>
            <p className="text-xs font-medium text-accent">Takım Üyesi</p>
        </div>

        <div className="flex flex-col items-center space-y-2">
            <img src="https://i.imgur.com/2I6tzJZ.png" alt="Mehmet Nuri Öğüt" className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
            <h4 className="font-semibold text-lg text-foreground">Mehmet Nuri Öğüt</h4>
            <p className="text-sm text-muted-foreground">Manisa Celal Bayar Üniversitesi</p>
            <p className="text-xs text-muted-foreground">Öğretim Üyesi</p>
            <p className="text-xs font-medium text-accent">Takım Danışmanı</p>
        </div>
    </div>
</CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;