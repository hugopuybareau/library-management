import { create } from 'zustand';

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

interface LibraryState {
  publications: Publication[];
  borrowings: Borrowing[];
  isLoading: boolean;
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

// Mock data
const mockPublications: Publication[] = [
  {
    id: '1',
    title: 'Modern Operating Systems',
    type: 'book',
    authors: ['Andrew S. Tanenbaum', 'Herbert Bos'],
    publisher: 'Pearson Education',
    year: 2019,
    isbn: '978-0-13-505337-5',
    keywords: ['operating systems', 'computer science', 'systems programming'],
    categories: ['Computer Science', 'Systems'],
    copies: [
      { labId: 'LIRIS', labName: 'LIRIS', status: 'on_rack', copyId: 'LIR-001' },
      { labId: 'AMPERE', labName: 'AMPERE', status: 'borrowed', copyId: 'AMP-001' },
    ],
    description: 'A comprehensive guide to modern operating system design and implementation.',
    language: 'English',
  },
  {
    id: '2',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    type: 'book',
    authors: ['Robert C. Martin'],
    publisher: 'Prentice Hall',
    year: 2008,
    isbn: '978-0-13-235088-4',
    keywords: ['software engineering', 'clean code', 'best practices'],
    categories: ['Software Engineering', 'Programming'],
    copies: [
      { labId: 'LIRIS', labName: 'LIRIS', status: 'on_rack', copyId: 'LIR-002' },
      { labId: 'LTDS', labName: 'LTDS', status: 'on_rack', copyId: 'LTD-001' },
    ],
    description: 'Essential principles for writing clean, maintainable code.',
    language: 'English',
  },
  {
    id: '3',
    title: 'Machine Learning: A Probabilistic Perspective',
    type: 'book',
    authors: ['Kevin P. Murphy'],
    publisher: 'MIT Press',
    year: 2012,
    isbn: '978-0-262-01802-9',
    keywords: ['machine learning', 'AI', 'statistics', 'probability'],
    categories: ['Computer Science', 'AI/ML'],
    copies: [
      { labId: 'LIRIS', labName: 'LIRIS', status: 'borrowed', copyId: 'LIR-003' },
      { labId: 'ICJ', labName: 'ICJ', status: 'on_rack', copyId: 'ICJ-001' },
    ],
    description: 'A comprehensive introduction to machine learning using probabilistic models.',
    language: 'English',
  },
  {
    id: '4',
    title: 'Deep Reinforcement Learning for Robotics',
    type: 'thesis',
    authors: ['Marie Dupont'],
    year: 2023,
    keywords: ['reinforcement learning', 'robotics', 'deep learning'],
    categories: ['AI/ML', 'Robotics'],
    copies: [
      { labId: 'AMPERE', labName: 'AMPERE', status: 'on_rack', copyId: 'AMP-002' },
    ],
    description: 'PhD thesis on applying deep reinforcement learning to robotic control.',
    language: 'English',
  },
  {
    id: '5',
    title: 'IEEE Transactions on Pattern Analysis',
    type: 'periodic',
    authors: [],
    publisher: 'IEEE',
    year: 2024,
    issn: '0162-8828',
    keywords: ['pattern recognition', 'computer vision', 'machine learning'],
    categories: ['Computer Science', 'AI/ML'],
    copies: [
      { labId: 'LIRIS', labName: 'LIRIS', status: 'on_rack', copyId: 'LIR-004' },
    ],
    description: 'Monthly journal on pattern analysis and machine intelligence.',
    language: 'English',
  },
  {
    id: '6',
    title: 'Fluid Dynamics Simulation Report 2024',
    type: 'report',
    authors: ['Jean-Pierre Martin', 'Sophie Bernard'],
    year: 2024,
    keywords: ['fluid dynamics', 'CFD', 'simulation'],
    categories: ['Mechanical Engineering', 'Simulation'],
    copies: [
      { labId: 'LMFA', labName: 'LMFA', status: 'on_rack', copyId: 'LMF-001' },
    ],
    description: 'Annual report on computational fluid dynamics research at LMFA.',
    language: 'French',
  },
];

const mockBorrowings: Borrowing[] = [
  {
    id: 'b1',
    publicationId: '1',
    publicationTitle: 'Modern Operating Systems',
    copyId: 'AMP-001',
    labName: 'AMPERE',
    userEmail: 'user@ecl.fr',
    userName: 'Regular User',
    borrowDate: '2024-12-10',
    dueDate: '2024-12-24',
    status: 'active',
  },
  {
    id: 'b2',
    publicationId: '3',
    publicationTitle: 'Machine Learning: A Probabilistic Perspective',
    copyId: 'LIR-003',
    labName: 'LIRIS',
    userEmail: 'manager@ecl.fr',
    userName: 'Lab Manager',
    borrowDate: '2024-12-01',
    dueDate: '2024-12-15',
    status: 'overdue',
  },
];

const defaultFilters = {
  type: [],
  lab: [],
  availability: [],
  year: {},
};

export const useLibraryStore = create<LibraryState>()((set) => ({
  publications: mockPublications,
  borrowings: mockBorrowings,
  isLoading: false,
  searchQuery: '',
  filters: defaultFilters,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: defaultFilters, searchQuery: '' }),
}));
