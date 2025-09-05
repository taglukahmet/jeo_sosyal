import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import TurkeyMap from '@/components/MaplibreMap';
import CityDetailPanel from '@/components/CityDetailPanel';
import NationalAgendaPanel from '@/components/NationalAgendaPanel';
import ComparisonView from '@/components/ComparisonView';
import FilterInterface from '@/components/FilterInterface';
import { Province, CityData, FilterCriteria } from '@/types';
import { useProvinces, useProvinceData, useFilterProvinces, useComparativeData, useHashtagScoresMutation } from '@/hooks/useBackendData';

// TODO: Backend Integration - This component will need several API connections:
// 1. Real-time province data updates: GET /api/provinces
// 2. User authentication for personalized filters: POST /api/auth/login  
// 3. Analytics tracking for user interactions: POST /api/analytics/track
// 4. Save user preferences: POST /api/user/preferences

// TODO: Backend Integration - Replace with API call to generate real city data
// This should fetch data from: GET /api/cities/{provinceId}/analytics
// Include real-time sentiment analysis and trending topics from social media
const generateCityData = (province: Province): CityData => ({
  id: province.id,
  name: province.name,
  sentiment: province.sentiment,
  topics: [
    { text: 'çevre koruma', value: 85 },
    { text: 'sürdürülebilir gelişim', value: 72 },
    { text: 'yeşil teknoloji', value: 65 },
    { text: 'temiz enerji', value: 58 },
    { text: 'iklim değişikliği', value: 45 },
    { text: 'geri dönüşüm', value: 38 },
    { text: 'doğa dostu', value: 32 },
    { text: 'karbon ayak izi', value: 28 },
    { text: 'yeşil şehir', value: 25 }
  ],
  hashtags: [
    province.mainHashtag,
    '#ÇevreKoruması',
    '#YeşilŞehir',
    '#TemizEnerji',
    '#SürdürülebilirŞehir'
  ],
  weeklyTrend: [
    { day: 'Pzt', volume: Math.floor(Math.random() * 1000) + 500 },
    { day: 'Sal', volume: Math.floor(Math.random() * 1000) + 600 },
    { day: 'Çar', volume: Math.floor(Math.random() * 1000) + 750 },
    { day: 'Per', volume: Math.floor(Math.random() * 1000) + 800 },
    { day: 'Cum', volume: Math.floor(Math.random() * 1000) + 900 },
    { day: 'Cmt', volume: Math.floor(Math.random() * 1000) + 650 },
    { day: 'Paz', volume: Math.floor(Math.random() * 1000) + 550 }
  ]
});

const Index = () => {
  const navigate = useNavigate();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCityData, setSelectedCityData] = useState<CityData | null>(null);
  const [showNationalPanel, setShowNationalPanel] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedCitiesForComparison, setSelectedCitiesForComparison] = useState<CityData[]>([]);
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [showFilterInterface, setShowFilterInterface] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({ hashtags: [], sentiment: [], regions: [] });
  const hashtagScoresMutation = useHashtagScoresMutation();
  // TODO: Backend integration - React Query hooks for data fetching
  const { data: backendProvinces, isLoading: provincesLoading, error: provincesError } = useProvinces();
  const { data: backendCityData, isLoading: cityDataLoading } = useProvinceData(selectedProvince || null);
  const { data: comparativeData } = useComparativeData(selectedCitiesForComparison.map(city => city.id));
  const filterMutation = useFilterProvinces();

  const handleProvinceClick = useCallback((province: Province) => {
    console.log('Province clicked in Index:', province.name, 'ID:', province.id);
    
    if (comparisonMode) {
      // Set the selected province first to trigger data fetch
      setSelectedProvince(province.id);
      
      // Use backend data if available, fallback to generated data
      const cityData = backendCityData || generateCityData(province);
      
      if (selectedCitiesForComparison.find(city => city.id === province.id)) {
        // Remove from comparison if already selected
        setSelectedCitiesForComparison(prev => 
          prev.filter(city => city.id !== province.id)
        );
      } else if (selectedCitiesForComparison.length < 3) {
        // Add to comparison if not at limit
        setSelectedCitiesForComparison(prev => [...prev, cityData]);
      }
    } else {
      // Normal mode - show city detail panel
      console.log('Setting selected province ID:', province.id);
      setSelectedProvince(province.id);
      
      // Use backend data if available, fallback to generated data
      const cityData = backendCityData || generateCityData(province);
      setSelectedCityData(cityData);
    }
  }, [comparisonMode, selectedCitiesForComparison, backendCityData]);

  const handleCloseDetailPanel = useCallback(() => {
    setSelectedProvince(null);
    setSelectedCityData(null);
  }, []);

  const handleNationalAgendaClick = useCallback(() => {
    setShowNationalPanel(!showNationalPanel);
    // Close other panels
    setSelectedProvince(null);
    setSelectedCityData(null);
  }, [showNationalPanel]);

  const handleAboutClick = useCallback(() => {
    navigate('/about');
  }, [navigate]);

  const handleComparisonToggle = useCallback(() => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode) {
      // Entering comparison mode
      setSelectedCitiesForComparison([]);
      setSelectedProvince(null);
      setSelectedCityData(null);
      setShowNationalPanel(false);
    } else {
      // Exiting comparison mode
      if (selectedCitiesForComparison.length >= 2) {
        setShowComparisonView(true);
      }
      setSelectedCitiesForComparison([]);
    }
  }, [comparisonMode, selectedCitiesForComparison]);

  const handleCloseComparison = useCallback(() => {
    setShowComparisonView(false);
    setComparisonMode(false);
    setSelectedCitiesForComparison([]);
  }, []);

  const handleFilterToggle = useCallback(() => {
    setShowFilterInterface(!showFilterInterface);
  }, [showFilterInterface]);

  const handleFilterApply = useCallback((criteria: FilterCriteria) => {
    setActiveFilters(criteria);
    setShowFilterInterface(false);
    // Close other panels to focus on filtered results
    hashtagScoresMutation.mutate(criteria.hashtags);
    setShowFilterInterface(false);
    setSelectedProvince(null);
    setSelectedCityData(null);
    setShowNationalPanel(false);
  }, [hashtagScoresMutation]);

  // Click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    
    // Check if click is outside panels
    const isClickInsidePanel = target.closest('[data-panel]') || target.closest('[data-filter]');
    
    if (!isClickInsidePanel) {
      setSelectedProvince(null);
      setSelectedCityData(null);
      setShowNationalPanel(false);
      setShowFilterInterface(false);
    }
  }, []);

  // TODO: Backend integration - Update filteredProvinces when backend data is available
  React.useEffect(() => {
    if (backendProvinces && !provincesError) {
      // Use backend data if available, fallback to local data
      console.log('Using backend provinces data');
    }
  }, [backendProvinces, provincesError]);

  // TODO: Backend integration - Update cityData when backend data is available
  React.useEffect(() => {
    if (backendCityData) {
      setSelectedCityData(backendCityData);
    }
  }, [backendCityData]);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  if (provincesLoading) {
    return (
      <div className="min-h-screen dashboard-gradient flex items-center justify-center">
        <p className="text-2xl text-primary-foreground animate-pulse">
          Harita verileri yükleniyor...
        </p>
      </div>
    );
  }

  if (provincesError) {
    return (
      <div className="min-h-screen dashboard-gradient flex items-center justify-center">
        <p className="text-2xl text-red-400">
          Veri yüklenirken bir hata oluştu.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-gradient relative overflow-hidden">
      {/* Header */}
      <Header
        onNationalAgendaClick={handleNationalAgendaClick}
        onAboutClick={handleAboutClick}
        comparisonMode={comparisonMode}
        onComparisonToggle={handleComparisonToggle}
        showNationalPanel={showNationalPanel}
        onFilterToggle={handleFilterToggle}
      />

      {/* Main Content */}
      <main className="pt-16 h-screen">
        <div className={cn("h-full relative transition-all duration-300", {
          "blur-sm": (selectedCityData && !comparisonMode) || showNationalPanel
        })}>
          {/* Turkey Map */}
          <div className="h-full p-8 relative"> {/* Add relative positioning */}
            {/* ✅ SOLUTION: Add a loading overlay for the filtering action */}
            {hashtagScoresMutation.isPending && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                <p className="text-lg text-primary-foreground animate-pulse">Filtreler uygulanıyor...</p>
              </div>
            )}
            <TurkeyMap
              onProvinceClick={handleProvinceClick}
              selectedProvince={selectedProvince}
              comparisonMode={comparisonMode}
              selectedProvinces={selectedCitiesForComparison.map(city => city.id)}
              activeFilters={activeFilters}
              provinces={backendProvinces || []}
              // Pass the mutation's result and loading state down to the map
              hashtagScores={hashtagScoresMutation.data || []}
              isFiltering={hashtagScoresMutation.isPending}
            />
        </div>
          {/* Comparison Mode Instructions */}
          {comparisonMode && !showComparisonView && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 glass-panel rounded-lg px-6 py-4 panel-shadow">
              <p className="text-center text-primary font-medium mb-3">
                Karşılaştırmak için haritadan 2-3 şehir seçin ({selectedCitiesForComparison.length}/3)
              </p>
              
              {/* Selected Cities Display */}
              {selectedCitiesForComparison.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  {selectedCitiesForComparison.map((city) => (
                    <div key={city.id} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                      {city.name}
                    </div>
                  ))}
                </div>
              )}
              
              {selectedCitiesForComparison.length >= 2 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowComparisonView(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Karşılaştırmayı Görüntüle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Panels */}
      <div data-panel="true">
        {selectedCityData && !comparisonMode && (
          <CityDetailPanel
            cityData={selectedCityData}
            onClose={handleCloseDetailPanel}
            isVisible={!!selectedCityData}
          />
        )}

        <NationalAgendaPanel
          isVisible={showNationalPanel}
          onClose={() => setShowNationalPanel(false)}
        />

        <ComparisonView
          selectedCities={comparativeData}
          onClose={handleCloseComparison}
          isVisible={showComparisonView}
        />
      </div>

      <div data-filter="true">
        <FilterInterface
          isVisible={showFilterInterface}
          onClose={() => setShowFilterInterface(false)}
          onFilterApply={handleFilterApply}
        />
      </div>
    </div>
  );
};

export default Index;