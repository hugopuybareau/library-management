import { create } from 'zustand';

// These types are exported for use in transformers and components
export interface Publication {
  id: string;
  title: string;
  type: 'book' | 'periodic' | 'thesis' | 'report';
  authors: string[];
  publisher?: string;
  year: number;
  isbn?: string;
  issn?: string;
  keywords: string[];
  categories: string[];
  copies: {
    labId: string;
    labName: string;
    status: 'on_rack' | 'borrowed' | 'lost';
    copyId: string;
  }[];
  description?: string;
  language?: string;
}

export interface Borrowing {
  id: string;
  publicationId: string;
  publicationTitle: string;
  copyId: string;
  labName: string;
  userEmail: string;
  userName: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'overdue';
}

// Library store now only manages client-side UI state
// Data fetching is handled by React Query
interface LibraryState {
  searchQuery: string;
  filters: {
    type: string[];
    lab: string[];
    availability: string[];
    year: { min?: number; max?: number };
  };
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<LibraryState['filters']>) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  type: [],
  lab: [],
  availability: [],
  year: {},
};

export const useLibraryStore = create<LibraryState>()((set) => ({
  searchQuery: '',
  filters: defaultFilters,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: defaultFilters, searchQuery: '' }),
}));
