import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { provinceService } from '@/services/provinceService';
import { socialMediaService } from '@/services/socialMediaService';
import { nationalAgendaService } from '@/services/nationalAgendaService';
import { FilterCriteria } from '@/types';

// TODO: Custom hooks for backend data fetching

// Hook for fetching all provinces
export const useProvinces = () => {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: provinceService.getAllProvinces,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching specific province data
export const useProvinceData = (provinceId: string | null) => {
  return useQuery({
    queryKey: ['provinceData', provinceId],
    queryFn: () => {
      if (!provinceId) return null;
      console.log('Fetching province data for ID:', provinceId);
      return provinceService.getProvinceData(provinceId);
    },
    enabled: !!provinceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for filtering provinces
export const useFilterProvinces = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (criteria: FilterCriteria) => provinceService.getFilteredProvinces(criteria),
    onSuccess: (data) => {
      queryClient.setQueryData(['filteredProvinces'], data);
    },
  });
};

// Add this new hook for handling the filter action
export const useHashtagScoresMutation = () => {
  return useMutation({
    // The mutation function will call your existing service
    mutationFn: (hashtags: string[]) => provinceService.getHashtagScores(hashtags),
  });
};

// Hook for comparative data
export const useComparativeData = (provinceIds: string[]) => {
  return useQuery({
    queryKey: ['comparativeData', provinceIds],
    queryFn: () => provinceService.getComparativeData(provinceIds),
    enabled: provinceIds.length > 0,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Hook for social media data
export const useSocialMediaData = (cityID: string | null) => {
  return useQuery({
    queryKey: ['socialMediaData', cityID],
    queryFn: () => {
      if (!cityID) return null;
      console.log('Fetching social media data for city ID:', cityID);
      return socialMediaService.getCitySocialMediaData(cityID);
    },
    enabled: !!cityID,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook for national agenda data
export const useNationalData = () => {
  return useQuery({
    queryKey: ['nationalData'],
    queryFn: nationalAgendaService.getNationalData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWeeklyTrends = () => {
  return useQuery({
    queryKey: ['nationalTrends'],
    queryFn: nationalAgendaService.getWeeklyTrends,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRegionalPerformance = () => {
  return useQuery({
    queryKey: ['regionalPerformance'],
    queryFn: nationalAgendaService.getRegionalPerformance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for national platform comparison
export const useNationalPlatformComparison = () => {
  return useQuery({
    queryKey: ['nationalPlatformComparison'],
    queryFn: nationalAgendaService.getNationalPlatformComparison,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};