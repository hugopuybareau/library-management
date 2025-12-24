import { apiClient } from '../client';
import type { BackendStats } from '../types';

export const statsApi = {
  getStats: async (): Promise<BackendStats> => {
    const response = await apiClient.get('/api/stats');
    return response;
  },
};
