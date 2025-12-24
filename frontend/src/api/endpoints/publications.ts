import { apiClient } from '../client';
import { transformPublication, transformPublicationDetail } from '../transformers';
import type { BackendPublication, BackendPublicationDetail } from '../types';

export const publicationsApi = {
  getPublications: async (params: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: string;
    lab_id?: number;
    available?: boolean;
  } = {}) => {
    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/publications${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(endpoint);

    return {
      publications: (response.publications || []).map((p: BackendPublication) =>
        transformPublication(p)
      ),
      pagination: response.pagination,
    };
  },

  getById: async (id: number) => {
    const response: BackendPublicationDetail = await apiClient.get(`/api/publications/${id}`);
    return transformPublicationDetail(response);
  },
};
