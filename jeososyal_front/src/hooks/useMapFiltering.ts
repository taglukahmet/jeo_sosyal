import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Province, ProvinceScore } from '@/types';
import { getSentimentType } from '@/utils/sentimentUtils';
import { provinceService } from '@/services/provinceService';

interface FilterCriteria {
  hashtags: string[];
  sentiment: string[];
  regions: string[];
}

interface FilterMatchResult {
  score: number;
  type: 'high' | 'medium' | 'low' | 'none';
  isVisible: boolean;
}

export const useMapFiltering = (provinces: Province[], hashtagScores: ProvinceScore[], activeFilters?: FilterCriteria) => {

  const getFilterMatchIntensity = (
    province: Province, 
    filters: FilterCriteria, 
    backendScores: Map<string, number>
  ): FilterMatchResult => {
    let isVisible = true;
    let score = 0;
    let type: 'high' | 'medium' | 'low' | 'none' = 'none';

    // Frontend limiters: sentiment and region
    if (filters.regions.length > 0 && !filters.regions.includes(province.region)) {
      isVisible = false;
    }

    if (filters.sentiment.length > 0) {
      const dominantSentiment = getSentimentType(province.inclination);
      if (!filters.sentiment.includes(dominantSentiment)) {
        isVisible = false;
      }
    }

    // Hashtag scoring from backend
    if (filters.hashtags.length > 0) {
      const backendScore = backendScores.get(province.id);
      if (backendScore !== undefined && backendScore > 0) {
        score = backendScore;
        if (score >= 1.2) type = 'high';
        else if (score >= 0.8) type = 'medium';
        else if (score >= 0.4) type = 'low';
      } else {
        isVisible = false;
      }
    } else if (isVisible) {
      // No hashtag filters, but passes other limiters
      score = 1.5;
      type = 'high';
    }

    return { score, type, isVisible };
  };

  const filterMatchResults = useMemo(() => {
    if (!activeFilters || (activeFilters.hashtags.length === 0 && activeFilters.sentiment.length === 0 && activeFilters.regions.length === 0)) {
      return new Map<string, FilterMatchResult>();
    }

    const results = new Map<string, FilterMatchResult>();
    // Safe access to hashtag scores with proper null checking
    const scoreMap = new Map(
      hashtagScores?.map(s => [s.provinceId, s.score]) || []
    );

    provinces.forEach(province => {
      const matchResult = getFilterMatchIntensity(province, activeFilters, scoreMap);
      results.set(province.id, matchResult);
    });

    return results;
  }, [provinces, activeFilters, hashtagScores]);

  return {
    filterMatchResults,
    getFilterMatch: (provinceId: string) => filterMatchResults.get(provinceId) || { score: 0, type: 'none' as const, isVisible: false }
  };
};