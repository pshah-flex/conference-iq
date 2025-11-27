// Core types for Conference IQ

export interface Conference {
  id: string;
  name: string;
  url: string;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  country: string | null;
  industry: string[] | null;
  attendance_estimate: number | null;
  agenda_url: string | null;
  pricing_url: string | null;
  organizer_name: string | null;
  organizer_email: string | null;
  organizer_phone: string | null;
  fields_populated_count: number;
  total_fields_count: number;
  last_crawled_at: string | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Speaker {
  id: string;
  conference_id: string;
  name: string;
  title: string | null;
  company: string | null;
  company_industry: string | null;
  company_size_bucket: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exhibitor {
  id: string;
  conference_id: string;
  company_name: string;
  exhibitor_tier_raw: string | null;
  exhibitor_tier_normalized: string | null;
  estimated_cost: number | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyIntelligence {
  company_name: string;
  exhibitor_history: {
    conference_id: string;
    conference_name: string;
    tier: string | null;
    cost: number | null;
  }[];
  speaker_history: {
    conference_id: string;
    conference_name: string;
    speaker_count: number;
  }[];
  total_spend: number | null; // Sum of explicit costs only
}

export interface Bookmark {
  id: string;
  user_id: string;
  conference_id: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}


