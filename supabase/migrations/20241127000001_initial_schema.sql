-- Conference IQ: Initial Database Schema
-- Created: 2024-11-27

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Conferences table
CREATE TABLE IF NOT EXISTS conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    start_date DATE,
    end_date DATE,
    city TEXT,
    country TEXT,
    industry TEXT[],
    attendance_estimate INTEGER,
    agenda_url TEXT,
    pricing_url TEXT,
    organizer_name TEXT,
    organizer_email TEXT,
    organizer_phone TEXT,
    fields_populated_count INTEGER DEFAULT 0,
    total_fields_count INTEGER DEFAULT 15, -- Total expected fields
    last_crawled_at TIMESTAMP WITH TIME ZONE,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Speakers table
CREATE TABLE IF NOT EXISTS speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    company TEXT,
    company_industry TEXT, -- nullable, manual override only
    company_size_bucket TEXT CHECK (company_size_bucket IN ('startup', 'mid', 'enterprise', 'unknown')) DEFAULT 'unknown',
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exhibitors table
CREATE TABLE IF NOT EXISTS exhibitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    exhibitor_tier_raw TEXT,
    exhibitor_tier_normalized TEXT CHECK (exhibitor_tier_normalized IN ('platinum', 'gold', 'silver', 'bronze', 'standard', 'unknown')),
    estimated_cost NUMERIC, -- nullable, only explicit costs, no estimates
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, conference_id)
);

-- Crawl logs table
CREATE TABLE IF NOT EXISTS crawl_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    data_extracted JSONB,
    error_message TEXT,
    crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Conferences indexes
CREATE INDEX IF NOT EXISTS idx_conferences_url ON conferences(url);
CREATE INDEX IF NOT EXISTS idx_conferences_industry ON conferences USING GIN(industry);
CREATE INDEX IF NOT EXISTS idx_conferences_start_date ON conferences(start_date);
CREATE INDEX IF NOT EXISTS idx_conferences_created_at ON conferences(created_at);

-- Speakers indexes
CREATE INDEX IF NOT EXISTS idx_speakers_conference_id ON speakers(conference_id);
CREATE INDEX IF NOT EXISTS idx_speakers_company ON speakers(company);
CREATE INDEX IF NOT EXISTS idx_speakers_name ON speakers(name);

-- Exhibitors indexes
CREATE INDEX IF NOT EXISTS idx_exhibitors_conference_id ON exhibitors(conference_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_company_name ON exhibitors(company_name);
CREATE INDEX IF NOT EXISTS idx_exhibitors_tier ON exhibitors(exhibitor_tier_normalized);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_conference_id ON bookmarks(conference_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_conference ON bookmarks(user_id, conference_id);

-- Crawl logs indexes
CREATE INDEX IF NOT EXISTS idx_crawl_logs_conference_id ON crawl_logs(conference_id);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_status ON crawl_logs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_crawled_at ON crawl_logs(crawled_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_conferences_updated_at
    BEFORE UPDATE ON conferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speakers_updated_at
    BEFORE UPDATE ON speakers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibitors_updated_at
    BEFORE UPDATE ON exhibitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate fields_populated_count for conferences
CREATE OR REPLACE FUNCTION calculate_conference_completeness()
RETURNS TRIGGER AS $$
DECLARE
    populated_count INTEGER := 0;
BEGIN
    -- Count non-null fields
    IF NEW.name IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.url IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.start_date IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.end_date IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.city IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.country IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.industry IS NOT NULL AND array_length(NEW.industry, 1) > 0 THEN populated_count := populated_count + 1; END IF;
    IF NEW.attendance_estimate IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.agenda_url IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.pricing_url IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.organizer_name IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.organizer_email IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    IF NEW.organizer_phone IS NOT NULL THEN populated_count := populated_count + 1; END IF;
    
    NEW.fields_populated_count := populated_count;
    NEW.total_fields_count := 15; -- Total expected fields
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate completeness
CREATE TRIGGER calculate_conference_completeness_trigger
    BEFORE INSERT OR UPDATE ON conferences
    FOR EACH ROW
    EXECUTE FUNCTION calculate_conference_completeness();

