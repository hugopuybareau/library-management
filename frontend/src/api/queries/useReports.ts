import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../endpoints/reports';

export function useAllPublications() {
  return useQuery({
    queryKey: ['reports', 'all-publications'],
    queryFn: reportsApi.getAllPublications,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserBorrowings(email: string, labId?: number) {
  return useQuery({
    queryKey: ['reports', 'user-borrowings', email, labId],
    queryFn: () => reportsApi.getUserBorrowings(email, labId),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!email,
  });
}

export function useLabValue(labId: number) {
  return useQuery({
    queryKey: ['reports', 'lab-value', labId],
    queryFn: () => reportsApi.getLabValue(labId),
    staleTime: 5 * 60 * 1000,
    enabled: !!labId,
  });
}

export function useCurrentBorrowers(publicationId: number) {
  return useQuery({
    queryKey: ['reports', 'current-borrowers', publicationId],
    queryFn: () => reportsApi.getCurrentBorrowers(publicationId),
    staleTime: 1 * 60 * 1000,
    enabled: !!publicationId,
  });
}

export function useByCategoryPrice(category: string, maxPrice: number) {
  return useQuery({
    queryKey: ['reports', 'by-category-price', category, maxPrice],
    queryFn: () => reportsApi.getByCategoryPrice(category, maxPrice),
    staleTime: 5 * 60 * 1000,
    enabled: !!category && maxPrice > 0,
  });
}

export function useByAuthorYear(author: string, year: number) {
  return useQuery({
    queryKey: ['reports', 'by-author-year', author, year],
    queryFn: () => reportsApi.getByAuthorYear(author, year),
    staleTime: 5 * 60 * 1000,
    enabled: !!author && year > 0,
  });
}

export function usePublisherChronology(publisher: string) {
  return useQuery({
    queryKey: ['reports', 'publisher-chronology', publisher],
    queryFn: () => reportsApi.getPublisherChronology(publisher),
    staleTime: 5 * 60 * 1000,
    enabled: !!publisher,
  });
}

export function useLostBooks() {
  return useQuery({
    queryKey: ['reports', 'lost-books'],
    queryFn: reportsApi.getLostBooks,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOverdueBorrowings() {
  return useQuery({
    queryKey: ['reports', 'overdue-borrowings'],
    queryFn: reportsApi.getOverdueBorrowings,
    staleTime: 1 * 60 * 1000,
  });
}
