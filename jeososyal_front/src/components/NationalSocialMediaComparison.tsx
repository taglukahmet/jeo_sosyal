import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Twitter, Instagram, Globe2, TrendingUp } from 'lucide-react';
import { useNationalPlatformComparison } from '@/hooks/useBackendData';
import { TbSquareRoundedLetterN } from 'react-icons/tb';

interface NationalSocialMediaComparisonProps {
  isVisible: boolean;
}

const SENTIMENT_COLORS = {
  positive: 'hsl(var(--sentiment-positive))',
  neutral: 'hsl(var(--primary)/0.8)',
  negative: 'hsl(var(--sentiment-negative))'
};

export const NationalSocialMediaComparison: React.FC<NationalSocialMediaComparisonProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  const {data:nationalComparison, isLoading: nationalLoading} = useNationalPlatformComparison();

  const nationalSocial = !nationalLoading && nationalComparison.nationalSocial
  const weeklyComparison = !nationalLoading && nationalComparison.weeklyComparison

  const nationalSocialData = nationalSocial || [
    {
      platform: 'X (Twitter)',
      icon: <Twitter className="w-4 h-4" />, 
      totalPosts: 127500,
      mainHashtag: 89.2,
      avgSentiment: 65,
      topRegion: 'İstanbul',
      weeklyGrowth: 12
    },
    {
      platform: 'NSosyal',
      icon: <Globe2 className="w-4 h-4" />,
      totalPosts: 73200,
      mainHashtag: 92.1,
      avgSentiment: 72,
      topRegion: 'Ankara', 
      weeklyGrowth: 28
    },
    {
      platform: 'Instagram',
      icon: <Instagram className="w-4 h-4" />,
      totalPosts: 45800,
      mainHashtag: 94.7,
      avgSentiment: 78,
      topRegion: 'İzmir',
      weeklyGrowth: 15
    }
  ];

  const weeklyComparisonData = weeklyComparison || [
    { day: 'Pzt', twitter: 18500, next: 12300, instagram: 7200 },
    { day: 'Sal', twitter: 21200, next: 13800, instagram: 8100 },
    { day: 'Çar', twitter: 24300, next: 15200, instagram: 9400 },
    { day: 'Per', twitter: 22100, next: 14600, instagram: 8800 },
    { day: 'Cum', twitter: 26800, next: 16900, instagram: 10200 },
    { day: 'Cmt', twitter: 19400, next: 11700, instagram: 6900 },
    { day: 'Paz', twitter: 15200, next: 9800, instagram: 5400 }
  ];

  return (
    <div className="fixed left-[28rem] top-16 h-[calc(100vh-4rem)] w-80 glass-panel panel-shadow z-35 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="pb-2 border-b border-border/50">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ulusal Platform Analizi
          </h3>
        </div>

        {/* Platform Overview */}
        <div className="space-y-3">
          {nationalSocialData.map((platform, index) => (
            <Card key={index} className="bg-card/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {(nationalSocialData == nationalSocial)?
                  (platform.icon === "twitter" ? <Twitter className="w-4 h-4" /> :
                   platform.icon === "next" ? <TbSquareRoundedLetterN className="w-4 h-4" /> :
                   <Instagram className="w-4 h-4" />
                   ):platform.icon}
                  <span className="font-medium text-sm">{platform.platform}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Toplam Gönderi</span>
                    <span className="font-semibold">{platform.totalPosts.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">En Popüler</span>
                    <span className="font-semibold">{platform.mainHashtag}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Pozitif Duygu</span>
                    <span className="font-semibold text-sentiment-positive">{platform.avgSentiment}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Haftalık Büyüme</span>
                    <span className="font-semibold text-primary">+{platform.weeklyGrowth}%</span>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">En Aktif Bölge: </span>
                  <span className="text-xs font-medium text-accent">{platform.topRegion}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Comparison Chart */}
        <Card className="bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Haftalık Platform Karşılaştırması</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Line 
                    type="monotone" 
                    dataKey="twitter" 
                    stroke="#1DA1F2" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="next" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="instagram" 
                    stroke="#E4405F" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#1DA1F2] rounded-full"></div>
                <span>X</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Next</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#E4405F] rounded-full"></div>
                <span>Instagram</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cross-Platform Insights */}
        <Card className="bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Platform Karşılaştırma Bulguları</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div className="text-xs p-2 bg-sentiment-positive/10 rounded border-l-2 border-sentiment-positive">
              <span className="font-medium">En Yüksek Kalite:</span> Instagram görsel içeriklerle %94.7 etkileşim
            </div>
            <div className="text-xs p-2 bg-primary/10 rounded border-l-2 border-primary">
              <span className="font-medium">En Hızlı Büyüme:</span> NSosyal %28 haftalık artış
            </div>
            <div className="text-xs p-2 bg-accent/10 rounded border-l-2 border-accent">
              <span className="font-medium">En Geniş Erişim:</span> X (Twitter) 127.5K toplam gönderi
            </div>
            <div className="text-xs p-2 bg-muted/20 rounded border-l-2 border-muted">
              <span className="font-medium">Çapraz Platform:</span> Kullanıcıların %73'ü birden fazla platform kullanıyor
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NationalSocialMediaComparison;