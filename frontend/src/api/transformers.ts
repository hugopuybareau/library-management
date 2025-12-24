import type { Publication, Borrowing } from '@/stores/libraryStore';
import type {
  BackendPublication,
  BackendPublicationDetail,
  BackendBorrowing,
  BackendUser,
  BackendLab,
} from './types';

/**
 * Transform backend publication to frontend format
 */
export function transformPublication(backend: BackendPublication): Publication {
  // Map publication_type to frontend type
  const typeMap: Record<string, Publication['type']> = {
    book: 'book',
    periodic: 'periodic',
    thesis: 'thesis',
    scientific_report: 'report',
  };

  return {
    id: String(backend.id_publication),
    title: backend.title,
    type: typeMap[backend.publication_type] || 'book',
    authors: backend.authors ? backend.authors.split(', ').filter(Boolean) : [],
    publisher: backend.publisher_name,
    year: backend.year_publication,
    isbn: backend.isbn,
    issn: backend.publication_type === 'periodic' ? backend.identification_number : undefined,
    keywords: [], // Will be populated from detail view
    categories: [], // Will be populated from detail view
    copies: [], // Will be populated from detail view
    description: undefined,
    language: undefined,
  };
}

/**
 * Transform detailed backend publication to frontend format
 */
export function transformPublicationDetail(backend: BackendPublicationDetail): Publication {
  const base = transformPublication(backend);

  // Map backend status to frontend status
  const statusMap: Record<string, 'on_rack' | 'borrowed' | 'lost'> = {
    on_rack: 'on_rack',
    issued_to: 'borrowed',
    lost: 'lost',
    to_be_bought: 'on_rack', // Treat as on_rack for now
  };

  return {
    ...base,
    authors: Array.isArray(backend.authors)
      ? backend.authors.map((a) => (typeof a === 'string' ? a : a.name))
      : base.authors,
    categories: backend.categories || [],
    keywords: backend.keywords || [],
    copies: backend.copies
      ? backend.copies.map((copy) => ({
          labId: copy.lab_name, // Using lab name as ID since id_lab not returned
          labName: copy.lab_name,
          status: statusMap[copy.status] || 'on_rack',
          copyId: String(copy.id_copy),
        }))
      : [],
  };
}

/**
 * Transform backend borrowing to frontend format
 */
export function transformBorrowing(backend: BackendBorrowing): Borrowing {
  const today = new Date();
  const dueDate = new Date(backend.due_date);
  const isOverdue = !backend.return_date && dueDate < today;

  return {
    id: String(backend.id_borrowing),
    publicationId: backend.id_publication ? String(backend.id_publication) : '',
    publicationTitle: backend.title,
    copyId: backend.id_copy ? String(backend.id_copy) : '',
    labName: backend.lab_name,
    userEmail: backend.email,
    userName: backend.user_name,
    borrowDate: backend.borrow_date,
    dueDate: backend.due_date,
    returnDate: backend.return_date,
    status: backend.return_date ? 'returned' : isOverdue ? 'overdue' : 'active',
  };
}

/**
 * Transform backend user with labs to frontend User format
 */
export function transformUser(
  backend: BackendUser,
  labs: BackendLab[],
  role: string
): {
  email: string;
  name: string;
  role: 'admin' | 'lab_manager' | 'user';
  labAccess: string[];
} {
  return {
    email: backend.email,
    name: backend.name,
    role: (role as 'admin' | 'lab_manager' | 'user') || 'user',
    labAccess: labs.map((l) => l.name),
  };
}
