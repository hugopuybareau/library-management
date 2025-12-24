import { apiClient } from '../client';
import type { BackendProposal } from '../types';

export const proposalsApi = {
  getProposals: async () => {
    const response: BackendProposal[] = await apiClient.get('/api/proposals');
    return response;
  },

  createProposal: async (data: {
    title: string;
    authors: string;
    publication_type: string;
    publisher?: string;
    year: number;
    estimated_price?: number;
    currency?: string;
    justification: string;
  }) => {
    const response = await apiClient.post('/api/proposals', data);
    return response;
  },

  updateProposal: async (id: number, status: string, comments?: string) => {
    const response = await apiClient.put(`/api/proposals/${id}`, { status, comments });
    return response;
  },
};
