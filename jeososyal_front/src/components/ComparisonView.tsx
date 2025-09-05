import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CityDetailPanel from './CityDetailPanel';

// TODO: Backend Integration - Multi-city comparison data
// API Endpoint: POST /api/cities/compare
// Send array of city IDs and receive comparative analytics

interface CityData {
  id: string;
  name: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topics: Array<{ text: string; value: number }>;
  hashtags: string[];
  weeklyTrend: Array<{ day: string; volume: number }>;
}

interface ComparisonViewProps {
  selectedCities: CityData[];
  onClose: () => void;
  isVisible: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  selectedCities,
  onClose,
  isVisible
}) => {
  if (!isVisible || selectedCities.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 glass-panel">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold text-primary">
            Şehir Karşılaştırması
          </h2>
          <span className="text-sm text-muted-foreground">
            {selectedCities.length} şehir karşılaştırılıyor
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Comparison Grid */}
      <div 
        className="h-[calc(100vh-4rem)] overflow-y-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(selectedCities.length, 3)}, 1fr)`,
          gap: '0'
        }}
      >
        {selectedCities.slice(0, 3).map((city, index) => (
          <div key={city.id} className="relative border-r border-border/50 last:border-r-0">
            <div className="h-full overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* City Header */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {city.name}
                  </h3>
                  <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
                </div>

                {/* Sentiment Comparison */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Duygu Analizi</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pozitif</span>
                        <span className="font-bold text-sentiment-positive">
                          {city.sentiment.positive}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 bg-sentiment-positive rounded-full transition-all duration-500"
                          style={{ width: `${city.sentiment.positive}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Nötr</span>
                        <span className="font-bold text-sentiment-neutral">
                          {city.sentiment.neutral}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 bg-sentiment-neutral rounded-full transition-all duration-500"
                          style={{ width: `${city.sentiment.neutral}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Negatif</span>
                        <span className="font-bold text-sentiment-negative">
                          {city.sentiment.negative}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 bg-sentiment-negative rounded-full transition-all duration-500"
                          style={{ width: `${city.sentiment.negative}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Topics */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">En Popüler Konular</h4>
                  <div className="space-y-2">
                    {city.topics.slice(0, 5).map((topic, topicIndex) => (
                      <div key={topic.text} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {topicIndex + 1}
                        </div>
                        <span className="text-sm font-medium">{topic.text}</span>
                        <div className="ml-auto text-xs text-muted-foreground">
                          {topic.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Hashtags */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Trend Hashtagler</h4>
                  <div className="space-y-2">
                    {city.hashtags.slice(0, 3).map((hashtag, hashtagIndex) => (
                      <div key={hashtag} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                          {hashtagIndex + 1}
                        </div>
                        <span className="text-sm font-medium text-accent">{hashtag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonView;