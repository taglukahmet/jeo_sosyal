import React from 'react';
import { X, TrendingUp, Globe, Hash, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import NationalSocialMediaComparison from './NationalSocialMediaComparison';
import { useNationalData, useRegionalPerformance, useWeeklyTrends } from '@/hooks/useBackendData';

// TODO: Backend Integration - National agenda and trends
// API Endpoints needed:
// 1. GET /api/national/agenda - Top trending topics nationwide
// 2. GET /api/national/sentiment - Country-wide sentiment analysis
// 3. WebSocket /ws/national - Real-time national trend updates

interface NationalData {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topTopics: Array<{ name: string; mentions: number; trend: number }>;
  nationalHashtags: string[];
}

interface NationalAgendaPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const SENTIMENT_COLORS = {
  positive: 'hsl(var(--sentiment-positive))',
  neutral: 'hsl(var(--primary)/0.8)',
  negative: 'hsl(var(--sentiment-negative))'
};

const nationaLdata: NationalData = {
  sentiment: { positive: 64, neutral: 26, negative: 10 },
  topTopics: [
    { name: '#SıfırAtık', mentions: 12500, trend: 15 },
    { name: '#YeşilŞehir', mentions: 9800, trend: 8 },
    { name: '#TemizHava', mentions: 8200, trend: -3 },
    { name: '#SürdürülebilirTurizm', mentions: 6900, trend: 22 },
    { name: '#EnerjiVerimliliği', mentions: 5400, trend: 11 }
  ],
  nationalHashtags: [
    '#ÇevreKoruması', 
    '#İklimDeğişikliği', 
    '#YenilenebilirEnerji', 
    '#GeriDönüşüm', 
    '#YeşilTeknoloji'
  ]
};

const regionSData = [
  { region: 'Marmara', percentage: 35, trend: '+5%' },
  { region: 'Akdeniz', percentage: 18, trend: '+12%' },
  { region: 'İç Anadolu', percentage: 15, trend: '+3%' },
  { region: 'Ege', percentage: 12, trend: '-8%' },
]

// Weekly trend data
const weeklyData = [
  { day: 'Pzt', volume: 3200 },
  { day: 'Sal', volume: 4100 },
  { day: 'Çar', volume: 5500 },
  { day: 'Per', volume: 4800 },
  { day: 'Cum', volume: 6200 },
  { day: 'Cmt', volume: 3800 },
  { day: 'Paz', volume: 2900 }
];

export const NationalAgendaPanel: React.FC<NationalAgendaPanelProps> = ({
  isVisible,
  onClose
}) => {
  if (!isVisible) return null;

  const { data: nationaldata, isLoading: nationalLoading} = useNationalData();
  const { data: nationalTrends, isLoading: trendsLoading} = useWeeklyTrends();
  const { data: regionalData, isLoading: regionalLoading} = useRegionalPerformance();

  const weeklyTrends = nationalTrends || weeklyData
  const nationalData = nationaldata || nationaLdata
  const regionalPerformance = regionalData || regionSData

  const sentimentData = [
    { name: 'Pozitif', value: nationalData.sentiment.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Nötr', value: nationalData.sentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negatif', value: nationalData.sentiment.negative, color: SENTIMENT_COLORS.negative }
  ];

  return (
    <>
      <NationalSocialMediaComparison isVisible={isVisible} />
      <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[28rem] glass-panel panel-shadow slide-in-right z-40 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Ulusal Gündem
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">2.8M</div>
                <div className="text-xs text-muted-foreground">Aktif Kullanıcı</div>
                <div className="text-xs text-sentiment-positive mt-1">↗ %12 artış</div>
              </CardContent>
            </Card>
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">127M+</div>
                <div className="text-xs text-muted-foreground">Toplam Etkileşim</div>
                <div className="text-xs text-sentiment-positive mt-1">↗ %18 artış</div>
              </CardContent>
            </Card>
          </div>

          {/* National Sentiment */}
          <Card className="bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ulusal Duygu Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  {sentimentData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top National Topics */}
          <Card className="bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                En Popüler Konular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nationalData.topTopics.map((topic, index) => (
                  <div key={topic.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="font-medium text-accent">{topic.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {topic.mentions.toLocaleString()}
                        </div>
                        <div className={`text-xs font-medium ${
                          topic.trend > 0 ? 'text-sentiment-positive' : 
                          topic.trend < 0 ? 'text-sentiment-negative' : 
                          'text-sentiment-neutral'
                        }`}>
                          {topic.trend > 0 ? '+' : ''}{topic.trend}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top National Hashtags */}
          <Card className="bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hash className="h-5 w-5 text-primary" />
                Ulusal Hashtagler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nationalData.nationalHashtags.map((hashtag, index) => (
                  <div key={hashtag} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="font-medium text-accent">{hashtag}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend Chart */}
          <Card className="bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Haftalık Trend Analizi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Regional Insights */}
          <Card className="bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Bölgesel Performans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {regionalPerformance.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 pl-1 hover:bg-background/50 rounded transition-colors">
                    <div className="font-medium text-foreground">{item.region}</div>
                    <div className="flex items-center space-x-7">
                      <div className="w-16 bg-background rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                      </div>
                      <div className="text-sm font-medium text-foreground w-8">{item.percentage}%</div>
                      <div className={`text-xs font-medium text-sentiment-${"+" === item.trend.slice(0,1) ? 'positive': "-" === item.trend.slice(0,1) ? 'negative' : 'neutral'} w-8`}>{item.trend}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card className="bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Önemli Bulgular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-sentiment-positive/10 rounded-lg border-l-4 border-sentiment-positive">
                  <div className="font-medium text-foreground mb-1">En Yüksek Katılım</div>
                  <div className="text-sm text-muted-foreground">Sıfır Atık projesi %78 olumlu tepki ile en çok destek gören çevre politikası.</div>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                  <div className="font-medium text-foreground mb-1">Hızlı Büyüme</div>
                  <div className="text-sm text-muted-foreground">İklim değişikliği konusu %29 büyüme ile en hızlı yükselen konu başlığı.</div>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg border-l-4 border-accent">
                  <div className="font-medium text-foreground mb-1">Bölgesel Lider</div>
                  <div className="text-sm text-muted-foreground">Marmara Bölgesi %35 pay ile çevre politikalarında en aktif bölge.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default NationalAgendaPanel;