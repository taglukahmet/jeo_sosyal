import React, { useState } from 'react';
import { ArrowLeft, Plus, X, BarChart3, TrendingUp, Hash, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useProvinces, useComparativeData } from '@/hooks/useBackendData';
import { Province, CityData } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Header from '@/components/Header';

import { getSentimentColor } from '@/utils/sentimentUtils';
import { COMPARISON_LIMITS } from '@/utils/constants';

const Comparison = () => {
  const navigate = useNavigate();
  const { data: provinces = [], isLoading: provincesLoading, error: provincesError } = useProvinces();
  const [selectedProvinces, setSelectedProvinces] = useState<Province[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch comparative data when we have selected provinces
  const provinceIds = selectedProvinces.map(p => p.id);
  const { data: comparisonData, isLoading: comparisonLoading, error: comparisonError } = useComparativeData(provinceIds);


  const filteredProvinces = provinces.filter(province =>
    province.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedProvinces.find(selected => selected.id === province.id)
  );

  const handleProvinceSelect = (province: Province) => {
    if (selectedProvinces.length < COMPARISON_LIMITS.MAX_CITIES) {
      setSelectedProvinces(prev => [...prev, province]);
      setSearchTerm('');
    }
  };

  const handleProvinceRemove = (provinceId: string) => {
    setSelectedProvinces(prev => prev.filter(p => p.id !== provinceId));
    if (selectedProvinces.length <= 1) {
      setShowResults(false);
    }
  };

  const handleCompare = () => {
    if (selectedProvinces.length >= COMPARISON_LIMITS.MIN_CITIES) {
      setShowResults(true);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--accent)/0.8)'];
  const SENTIMENT_COLORS = {
    positive: 'hsl(var(--sentiment-positive))',
    neutral: 'hsl(var(--primary)/0.8)',
    negative: 'hsl(var(--sentiment-negative))'
  };

  if (provincesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground animate-pulse">Loading province list...</p>
      </div>
    );
  }

  if (provincesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-destructive">Could not load province data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-xl font-bold text-primary">Karşılaştır</h1>
        </div>
      </header>

      <div className="container pt-8 pb-8">
        {!showResults ? (
          /* Selection Interface */
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Karşılaştırma Başlat
                </CardTitle>
                <CardDescription>
                  Analiz etmek için 2-3 şehir seçin ve detaylı karşılaştırma görüntüleyin
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Selected Cities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seçili Şehirler ({selectedProvinces.length}/3)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedProvinces.map((province, index) => (
                  <Card key={province.id} className="relative">
                    <CardHeader className="pb-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => handleProvinceRemove(province.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <CardTitle className="text-lg">{province.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{province.region}</Badge>
                        <Badge variant="outline" style={{ color: COLORS[index % COLORS.length] }}>
                          #{index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-accent">{province.mainHashtag}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{province.inclination}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add City Card */}
                {selectedProvinces.length < 3 && (
                  <Card className="border-dashed">
                    <CardContent className="flex items-center justify-center h-full min-h-[120px]">
                      <div className="text-center">
                        <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Şehir Ekle</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* City Search */}
            {selectedProvinces.length < 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Şehir Seç</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="text"
                    placeholder="Şehir adı yazın..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-input"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredProvinces.slice(0, 10).map((province) => (
                      <div
                        key={province.id}
                        onClick={() => handleProvinceSelect(province)}
                        className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{province.name}</h4>
                            <p className="text-sm text-muted-foreground">{province.region}</p>
                          </div>
                          <Badge variant="secondary">{province.mainHashtag}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compare Button */}
            {selectedProvinces.length >= 2 && (
              <div className="text-center">
                <Button
                  onClick={handleCompare}
                  size="lg"
                  className="px-8 py-3 text-lg"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Karşılaştır ({selectedProvinces.length} şehir)
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Results Interface */
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-primary">Karşılaştırma Sonuçları</h2>
                <p className="text-muted-foreground">
                  {selectedProvinces.map(p => p.name).join(' vs ')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowResults(false)}
              >
                Yeni Karşılaştırma
              </Button>
            </div>

            {comparisonLoading && (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Veriler yükleniyor...</p>
              </div>
            )}

            {comparisonError && (
              <Card className="border-destructive">
                <CardContent className="py-6">
                  <p className="text-destructive text-center">
                    Veriler yüklenirken hata oluştu. Lütfen tekrar deneyin.
                  </p>
                </CardContent>
              </Card>
            )}

            {comparisonData && !comparisonLoading && (
              <div className="grid gap-8">
                {/* Sentiment Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Duygu Analizi Karşılaştırması</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                           <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              color: 'hsl(var(--popover-foreground))'
                            }}
                          />
                          <Bar dataKey="sentiment.positive" fill={SENTIMENT_COLORS.positive} name="Pozitif" />
                          <Bar dataKey="sentiment.neutral" fill={SENTIMENT_COLORS.neutral} name="Nötr" />
                          <Bar dataKey="sentiment.negative" fill={SENTIMENT_COLORS.negative} name="Negatif" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual City Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {comparisonData.map((cityData: CityData, index: number) => (
                    <Card key={cityData.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {cityData.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Top Topics */}
                        <div>
                          <h4 className="font-semibold mb-2">En Popüler Konular</h4>
                          <div className="space-y-1">
                            {cityData.topics?.slice(0, 3).map((topic, topicIndex) => (
                              <div key={topic.text} className="flex items-center justify-between text-sm">
                                <span>#{topicIndex + 1} {topic.text}</span>
                                <Badge variant="secondary">{topic.value}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hashtags */}
                        <div>
                          <h4 className="font-semibold mb-2">Trend Hashtagler</h4>
                          <div className="flex flex-wrap gap-1">
                            {cityData.hashtags?.slice(0, 3).map((hashtag) => (
                              <Badge key={hashtag} variant="outline" className="text-xs">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Weekly Trend Mini Chart */}
                        <div>
                          <h4 className="font-semibold mb-2">Haftalık Trend</h4>
                          <div className="h-20">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={cityData.weeklyTrend}>
                                <Line 
                                  type="monotone" 
                                  dataKey="volume" 
                                  stroke={COLORS[index % COLORS.length]} 
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparison;