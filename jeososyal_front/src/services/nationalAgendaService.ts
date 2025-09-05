import api from './api';

// TODO: Backend endpoints for national agenda data
export const nationalAgendaService = {
  // Get national sentiment and trending data
  getNationalData: async (): Promise<any> => {
    const response = await api.get('/national-agenda/');
    return response.data;
  },

  // Get weekly national trends
  getWeeklyTrends: async (): Promise<any> => {
    const response = await api.get('/national-agenda/weekly-trends/');
    return response.data;
  },

  // Get regional performance data
  getRegionalPerformance: async (): Promise<any> => {
    const response = await api.get('/national-agenda/regional-performance/');
    return response.data;
  },

  // Get national insights and key findings
  getNationalInsights: async (): Promise<any> => {
    const response = await api.get('/national-agenda/insights/');
    return response.data;
  },

  // Get national social media platform comparison
  getNationalPlatformComparison: async (): Promise<any> => {
    const response = await api.get('/national-agenda/platform-comparison/');
    return response.data;
  },
};