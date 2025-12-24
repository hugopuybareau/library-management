import { apiClient } from '../client';
import { transformUser } from '../transformers';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response;
  },

  logout: async () => {
    await apiClient.post('/api/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    const { user, labs, role } = response;
    return transformUser(user, labs, role);
  },
};
