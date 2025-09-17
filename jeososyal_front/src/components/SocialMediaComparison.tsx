import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Twitter, Instagram, Globe2 } from 'lucide-react';
import { useSocialMediaData } from '@/hooks/useBackendData';
import { TbSquareRoundedLetterN } from 'react-icons/tb';


// TODO: Backend Integration - Social media comparison data
// API Endpoint: GET /api/cities/{cityId}/social-media
// Real-time social media metrics from multiple platforms

interface SocialMediaData {
  platform: string;
  icon: React.ReactNode;
  impact: number;
  posts: number;
  mainHashtag: string;
  topTopic: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface SocialMediaComparisonProps {
  cityID?: string;
  cityName?: string;
}

const SENTIMENT_COLORS = {
  positive: 'hsl(var(--sentiment-positive))',
  neutral: 'hsl(var(--primary)/0.8)',
  negative: 'hsl(var(--sentiment-negative))'
};

export const SocialMediaComparison: React.FC<SocialMediaComparisonProps> = ({cityID, cityName}) => {
  // TODO: Backend integration - Fetch real social media data for the city
  // const { data: backendSocialData, isLoading } = useSocialMediaData(cityName || null);
  const {data: citySocial, isLoading: cityLoading} = useSocialMediaData(cityID)
  const citySocialComparison = !cityLoading && citySocial
  
  const socialMediaData: SocialMediaData[] = citySocialComparison || [
    {
      platform: 'X (Twitter)',
      icon: <Twitter className="w-4 h-4" />,
      impact: 45,
      posts: 2847,
      mainHashtag: '#SıfırAtık',
      topTopic: '#SıfırAtık',
      sentiment: { positive: 62, neutral: 28, negative: 10 }
    },
    {
      platform: 'NSosyal',
      icon: <Globe2 className="w-4 h-4" />,
      impact: 35,
      posts: 1523,
      mainHashtag: '#SıfırAtık',
      topTopic: '#YeşilŞehir',
      sentiment: { positive: 71, neutral: 22, negative: 7 }
    },
    {
      platform: 'Instagram',
      icon: <Instagram className="w-4 h-4" />,
      impact: 20,
      posts: 892,
      mainHashtag: '#SıfırAtık',
      topTopic: '#DoğaDostu',
      sentiment: { positive: 80, neutral: 15, negative: 5 }
    }
  ];

  // Use backend data if available, fallback to mock data
  // const displaySocialData = backendSocialData || socialMediaData;
  const displaySocialData = socialMediaData;

  const impactData = displaySocialData.map(item => ({
    platform: item.platform.split(' ')[0],
    impact: item.impact
  }));

  return (
    <div className="fixed right-[28rem] top-12 h-full w-80 glass-panel panel-shadow z-45 overflow-y-auto">
      <div className="p-4 space-y-4 mb-10">
        {/* Header */}
        <div className="pb-2 border-b border-border/50">
          <h3 className="text-lg font-semibold text-primary">
            Platform Karşılaştırması
          </h3>
          {cityName && (
            <p className="text-sm text-muted-foreground">{cityName}</p>
          )}
        </div>

        {/* Impact Overview */}
        <Card className="bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Etki Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData}>
                  <XAxis dataKey="platform" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Bar dataKey="impact" fill="hsl(var(--primary))" radius={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Details */}
        <div className="space-y-3">
          {displaySocialData.map((platform, index) => (
            <Card key={index} className="bg-card/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {(socialMediaData == citySocial)?
                    (platform.icon === "twitter" ? <Twitter className="w-4 h-4" /> :
                     platform.icon === "next" ? <TbSquareRoundedLetterN className="w-4 h-4" /> :
                     <Instagram className="w-4 h-4" />
                    ):platform.icon}
                  <span className="font-medium text-sm">{platform.platform}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Gönderi</span>
                    <span className="font-medium">{platform.posts.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Etkileşim</span>
                    <span className="font-medium text-primary">{platform.mainHashtag}</span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Popüler</span>
                    <span className="font-medium text-primary">{platform.topTopic}</span>
                  </div>

                  {/* Mini sentiment chart */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Duygu</span>
                    <div className="flex gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: SENTIMENT_COLORS.positive }}
                        title={`${platform.sentiment.positive}%`}
                      />
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: SENTIMENT_COLORS.neutral }}
                        title={`${platform.sentiment.neutral}%`}
                      />
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: SENTIMENT_COLORS.negative }}
                        title={`${platform.sentiment.negative}%`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Insights */}
        <Card className="bg-card/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Önemli Bulgular</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div className="text-xs p-2 bg-sentiment-positive/10 rounded border-l-2 border-sentiment-positive">
              <span className="font-medium">En Yüksek Etkileşim:</span> Instagram %92
            </div>
            <div className="text-xs p-2 bg-primary/10 rounded border-l-2 border-primary">
              <span className="font-medium">En Çok Gönderi:</span> X (Twitter) 2.8K
            </div>
            <div className="text-xs p-2 bg-accent/10 rounded border-l-2 border-accent">
              <span className="font-medium">En Pozitif:</span> Instagram %80
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialMediaComparison;