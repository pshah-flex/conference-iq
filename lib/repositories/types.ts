// Repository types and interfaces

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ConferenceFilters {
  industry?: string[];
  city?: string;
  country?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  searchQuery?: string;
}

export interface RepositoryError {
  message: string;
  code?: string;
  details?: unknown;
}

export type RepositoryResult<T> = 
  | { data: T; error: null }
  | { data: null; error: RepositoryError };

