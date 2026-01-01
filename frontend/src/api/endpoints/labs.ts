import { apiClient } from '../client';

export const labsApi = {
  getLabs: async () => {
    const response = await apiClient.get('/api/labs');
    return response;
  },
};
