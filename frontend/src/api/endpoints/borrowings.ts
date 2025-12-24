import { apiClient } from '../client';
import { transformBorrowing } from '../transformers';
import type { BackendBorrowing } from '../types';

export const borrowingsApi = {
  getBorrowings: async () => {
    const response: BackendBorrowing[] = await apiClient.get('/api/borrowings');
    return response.map(transformBorrowing);
  },

  createBorrowing: async (publicationId: number, labId: number) => {
    const response = await apiClient.post('/api/borrowings', {
      publication_id: publicationId,
      lab_id: labId,
    });
    return response;
  },

  returnBorrowing: async (borrowingId: number) => {
    const response = await apiClient.put(`/api/borrowings/${borrowingId}/return`);
    return response;
  },
};
