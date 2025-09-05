import api from './api';
import { Province, CityData, FilterCriteria, HashtagFilterRequest, HashtagFilterResponse } from '@/types';

// TODO: Backend endpoints - update these to match your backend API
export const provinceService = {
  // Get all provinces with their current data
  getAllProvinces: async (): Promise<Province[]> => {
    const response = await api.get('/provinces/');
    return response.data;
  },

  // Get detailed data for a specific province/city
  getProvinceData: async (provinceId: string): Promise<CityData> => {
    const response = await api.get(`/provinces/${provinceId}/data/`);
    return response.data;
  },

  // Get filtered province data based on criteria
  getFilteredProvinces: async (criteria: FilterCriteria): Promise<Province[]> => {
    const response = await api.post('/provinces/filter/', criteria);
    return response.data;
  },

  // Get comparative data for multiple provinces
  getComparativeData: async (provinceIds: string[]): Promise<CityData[]> => {
    const response = await api.post('/provinces/compare/', { provinceIds });
    return response.data;
  },

  // Get real-time updates for a province
  getRealtimeUpdates: async (provinceId: string): Promise<any> => {
    const response = await api.get(`/provinces/${provinceId}/realtime/`);
    return response.data;
  },

  // Get hashtag-based scoring from backend
  getHashtagScores: async (hashtags: string[]): Promise<HashtagFilterResponse> => {
    const request: HashtagFilterRequest = { hashtags };
    console.log('Sending hashtag request:', request);
    const response = await api.post('/provinces/hashtag-scores/', request);
    console.log('Received response:', response.data);
    return response.data;
  },
};