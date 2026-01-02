import { apiClient } from '../client';

export const reportsApi = {
  // Query 1: All unique publications
  getAllPublications: async () => {
    const response = await apiClient.get('/api/reports/all-publications');
    return response;
  },

  // Query 2: User borrowed publications
  getUserBorrowings: async (email: string, labId?: number) => {
    const params = labId ? `?lab_id=${labId}` : '';
    const response = await apiClient.get(`/api/reports/user-borrowings/${email}${params}`);
    return response;
  },

  // Query 3: Lab collection value
  getLabValue: async (labId: number) => {
    const response = await apiClient.get(`/api/reports/lab-value/${labId}`);
    return response;
  },

  // Query 4: Can user borrow publication
  canBorrow: async (publicationId: number, email?: string) => {
    const response = await apiClient.post('/api/reports/can-borrow', {
      publication_id: publicationId,
      email,
    });
    return response;
  },

  // Query 5: Find current borrowers
  getCurrentBorrowers: async (publicationId: number) => {
    const response = await apiClient.get(`/api/reports/current-borrowers?publication_id=${publicationId}`);
    return response;
  },

  // Query 6: Publications by category and price
  getByCategoryPrice: async (category: string, maxPrice: number) => {
    const response = await apiClient.get(
      `/api/reports/by-category-price?category=${encodeURIComponent(category)}&max_price=${maxPrice}`
    );
    return response;
  },

  // Query 7: Publications by author after year
  getByAuthorYear: async (author: string, year: number) => {
    const response = await apiClient.get(
      `/api/reports/by-author-year?author=${encodeURIComponent(author)}&year=${year}`
    );
    return response;
  },

  // Query 8: Publisher books chronological
  getPublisherChronology: async (publisher: string) => {
    const response = await apiClient.get(
      `/api/reports/publisher-chronology?publisher=${encodeURIComponent(publisher)}`
    );
    return response;
  },

  // Query 9: Lost books report
  getLostBooks: async () => {
    const response = await apiClient.get('/api/reports/lost-books');
    return response;
  },

  // Additional: Overdue borrowings
  getOverdueBorrowings: async () => {
    const response = await apiClient.get('/api/reports/overdue-borrowings');
    return response;
  },
};
