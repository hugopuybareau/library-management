// Backend response types - match exact backend structure

export interface BackendUser {
  email: string;
  name: string;
  phone?: string;
  registration_date?: string;
  active: boolean;
}

export interface BackendLab {
  id_lab: number;
  name: string;
  department?: string;
}

export interface BackendPublication {
  id_publication: number;
  title: string;
  year_publication: number;
  publication_type: 'book' | 'periodic' | 'thesis' | 'scientific_report';
  edition?: string;
  publisher_name?: string;
  authors?: string; // Comma-separated string from backend
  isbn?: string;
  volume_number?: number;
  identification_number?: string;
  report_type?: string;
}

export interface BackendPublicationDetail extends BackendPublication {
  authors: Array<{ name: string; email?: string }>;
  categories?: string[];
  keywords?: string[];
  copies?: Array<{
    id_copy: number;
    lab_name: string;
    status: 'on_rack' | 'issued_to' | 'lost' | 'to_be_bought';
    purchase_price?: number;
    currency?: string;
  }>;
}

export interface BackendBorrowing {
  id_borrowing: number;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  email: string;
  user_name: string;
  title: string;
  lab_name: string;
  id_copy?: number;
  id_publication?: number;
}

export interface BackendProposal {
  id_proposal: number;
  email: string;
  submitted_by_name?: string;
  title: string;
  publication_type: string;
  details: {
    authors?: string;
    publisher?: string;
    year?: number;
    estimated_price?: number;
    currency?: string;
    justification?: string;
  };
  date_proposal: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface BackendStats {
  total_publications?: number;
  total_copies?: number;
  total_users?: number;
  total_borrowings?: number;
  active_borrowings?: number;
  overdue_borrowings?: number;
  total_labs?: number;
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  publications?: T[];
  borrowings?: T[];
  [key: string]: any;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}
