-- Conference IQ: Row-Level Security (RLS) Policies
-- Created: 2024-11-27

-- ============================================
-- ENABLE ROW-LEVEL SECURITY
-- ============================================

ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CONFERENCES POLICIES
-- ============================================

-- Public read access
CREATE POLICY "Conferences are viewable by everyone"
    ON conferences
    FOR SELECT
    USING (true);

-- Admin write access (users with admin role in user_metadata)
CREATE POLICY "Admins can insert conferences"
    ON conferences
    FOR INSERT
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can update conferences"
    ON conferences
    FOR UPDATE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    )
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can delete conferences"
    ON conferences
    FOR DELETE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

-- ============================================
-- SPEAKERS POLICIES
-- ============================================

-- Public read access
CREATE POLICY "Speakers are viewable by everyone"
    ON speakers
    FOR SELECT
    USING (true);

-- Admin write access
CREATE POLICY "Admins can insert speakers"
    ON speakers
    FOR INSERT
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can update speakers"
    ON speakers
    FOR UPDATE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    )
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can delete speakers"
    ON speakers
    FOR DELETE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

-- ============================================
-- EXHIBITORS POLICIES
-- ============================================

-- Public read access
CREATE POLICY "Exhibitors are viewable by everyone"
    ON exhibitors
    FOR SELECT
    USING (true);

-- Admin write access
CREATE POLICY "Admins can insert exhibitors"
    ON exhibitors
    FOR INSERT
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can update exhibitors"
    ON exhibitors
    FOR UPDATE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    )
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can delete exhibitors"
    ON exhibitors
    FOR DELETE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

-- ============================================
-- BOOKMARKS POLICIES
-- ============================================

-- Users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
    ON bookmarks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
    ON bookmarks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
    ON bookmarks
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- CRAWL LOGS POLICIES
-- ============================================

-- Admin only access
CREATE POLICY "Admins can view crawl logs"
    ON crawl_logs
    FOR SELECT
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can insert crawl logs"
    ON crawl_logs
    FOR INSERT
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can update crawl logs"
    ON crawl_logs
    FOR UPDATE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    )
    WITH CHECK (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

CREATE POLICY "Admins can delete crawl logs"
    ON crawl_logs
    FOR DELETE
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    );

