import { apiClient } from '../client';

export const usersApi = {
  getUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response;
  },
};
