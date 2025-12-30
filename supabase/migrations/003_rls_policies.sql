-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Security layer following Supabase best practices
-- Public: Read published content
-- Authenticated: Create bookmarks, progress, ratings
-- Admin: Full CRUD access
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: is_admin
-- ============================================================================
-- Check if current user has admin role
-- Assumes you'll add a 'role' column or use Supabase custom claims
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has admin role in auth.users metadata
    -- Adjust based on your auth setup
    RETURN (
        SELECT COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
            false
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: Check from a custom user_roles table
-- CREATE OR REPLACE FUNCTION is_admin()
-- RETURNS BOOLEAN AS $$
-- BEGIN
--     RETURN EXISTS(
--         SELECT 1 FROM user_roles
--         WHERE user_id = auth.uid()
--         AND role = 'admin'
--     );
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTHORS - RLS POLICIES
-- ============================================================================

-- Public can read all authors
CREATE POLICY "Authors are viewable by everyone"
    ON authors FOR SELECT
    USING (true);

-- Only admins can insert/update/delete authors
CREATE POLICY "Admins can insert authors"
    ON authors FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update authors"
    ON authors FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete authors"
    ON authors FOR DELETE
    USING (is_admin());

-- ============================================================================
-- GENRES - RLS POLICIES
-- ============================================================================

-- Public can read all genres
CREATE POLICY "Genres are viewable by everyone"
    ON genres FOR SELECT
    USING (true);

-- Only admins can manage genres
CREATE POLICY "Admins can insert genres"
    ON genres FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update genres"
    ON genres FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete genres"
    ON genres FOR DELETE
    USING (is_admin());

-- ============================================================================
-- NOVELS - RLS POLICIES
-- ============================================================================

-- Public can read published novels
CREATE POLICY "Published novels are viewable by everyone"
    ON novels FOR SELECT
    USING (is_published = true);

-- Admins can read all novels (including drafts)
CREATE POLICY "Admins can view all novels"
    ON novels FOR SELECT
    USING (is_admin());

-- Only admins can manage novels
CREATE POLICY "Admins can insert novels"
    ON novels FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update novels"
    ON novels FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete novels"
    ON novels FOR DELETE
    USING (is_admin());

-- ============================================================================
-- NOVEL_GENRES - RLS POLICIES
-- ============================================================================

-- Public can read novel-genre associations for published novels
CREATE POLICY "Novel genres are viewable for published novels"
    ON novel_genres FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM novels
            WHERE novels.id = novel_genres.novel_id
            AND novels.is_published = true
        )
    );

-- Admins can view all associations
CREATE POLICY "Admins can view all novel genres"
    ON novel_genres FOR SELECT
    USING (is_admin());

-- Only admins can manage novel-genre associations
CREATE POLICY "Admins can insert novel genres"
    ON novel_genres FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete novel genres"
    ON novel_genres FOR DELETE
    USING (is_admin());

-- ============================================================================
-- CHAPTERS - RLS POLICIES
-- ============================================================================

-- Public can read published chapters of published novels
CREATE POLICY "Published chapters are viewable by everyone"
    ON chapters FOR SELECT
    USING (
        is_published = true
        AND EXISTS (
            SELECT 1 FROM novels
            WHERE novels.id = chapters.novel_id
            AND novels.is_published = true
        )
    );

-- Admins can read all chapters
CREATE POLICY "Admins can view all chapters"
    ON chapters FOR SELECT
    USING (is_admin());

-- Only admins can manage chapters
CREATE POLICY "Admins can insert chapters"
    ON chapters FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update chapters"
    ON chapters FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete chapters"
    ON chapters FOR DELETE
    USING (is_admin());

-- ============================================================================
-- CHAPTER_VIEWS - RLS POLICIES
-- ============================================================================

-- Anyone can insert chapter views (for tracking)
CREATE POLICY "Anyone can record chapter views"
    ON chapter_views FOR INSERT
    WITH CHECK (true);

-- Users can only read their own views
CREATE POLICY "Users can view their own chapter views"
    ON chapter_views FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );

-- Admins can view all chapter views (for analytics)
CREATE POLICY "Admins can view all chapter views"
    ON chapter_views FOR SELECT
    USING (is_admin());

-- No one can update chapter views
-- No one can delete chapter views (except via scheduled cleanup function)

-- ============================================================================
-- BOOKMARKS - RLS POLICIES
-- ============================================================================

-- Authenticated users can read their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
    ON bookmarks FOR SELECT
    USING (auth.uid() = user_id);

-- Authenticated users can create their own bookmarks
CREATE POLICY "Users can create their own bookmarks"
    ON bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
    ON bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can view all bookmarks
CREATE POLICY "Admins can view all bookmarks"
    ON bookmarks FOR SELECT
    USING (is_admin());

-- ============================================================================
-- READING_PROGRESS - RLS POLICIES
-- ============================================================================

-- Authenticated users can read their own progress
CREATE POLICY "Users can view their own reading progress"
    ON reading_progress FOR SELECT
    USING (auth.uid() = user_id);

-- Authenticated users can create/update their own progress
CREATE POLICY "Users can insert their own reading progress"
    ON reading_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress"
    ON reading_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own progress
CREATE POLICY "Users can delete their own reading progress"
    ON reading_progress FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can view all progress (for analytics)
CREATE POLICY "Admins can view all reading progress"
    ON reading_progress FOR SELECT
    USING (is_admin());

-- ============================================================================
-- RATINGS - RLS POLICIES
-- ============================================================================

-- Everyone can read ratings (for displaying reviews)
CREATE POLICY "Ratings are viewable by everyone"
    ON ratings FOR SELECT
    USING (true);

-- Authenticated users can create their own ratings
CREATE POLICY "Users can create their own ratings"
    ON ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own ratings
CREATE POLICY "Users can update their own ratings"
    ON ratings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
    ON ratings FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can manage all ratings (moderation)
CREATE POLICY "Admins can update any rating"
    ON ratings FOR UPDATE
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete any rating"
    ON ratings FOR DELETE
    USING (is_admin());

-- ============================================================================
-- MATERIALIZED VIEW ACCESS
-- ============================================================================
-- Materialized views don't support RLS, but we can create a security definer function

CREATE OR REPLACE FUNCTION get_novel_statistics(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    novel_id UUID,
    title VARCHAR,
    slug VARCHAR,
    author_id UUID,
    status novel_status,
    chapter_count BIGINT,
    total_words BIGINT,
    view_count_total BIGINT,
    view_count_weekly BIGINT,
    view_count_daily BIGINT,
    rating_average DECIMAL,
    rating_count BIGINT,
    bookmark_count BIGINT,
    last_chapter_published_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM novel_statistics
    ORDER BY view_count_daily DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_novel_statistics TO authenticated, anon;

-- ============================================================================
-- SECURITY BEST PRACTICES
-- ============================================================================

-- Revoke default public schema privileges (Supabase best practice)
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant necessary table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON bookmarks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON reading_progress TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ratings TO authenticated;
GRANT INSERT ON chapter_views TO anon, authenticated;

-- Grant sequence usage for serial columns
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- ADMIN ROLE SETUP
-- ============================================================================
-- Example of how to set admin role for a user
-- Run this after creating admin user via Supabase Auth
-- ============================================================================

-- Method 1: Using user_metadata (simpler)
-- UPDATE auth.users SET
--     raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@example.com';

-- Method 2: Using custom table (more flexible)
-- CREATE TABLE user_roles (
--     user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--     role VARCHAR(50) NOT NULL DEFAULT 'user',
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- 
-- ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view their own role"
--     ON user_roles FOR SELECT
--     USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Admins can manage all roles"
--     ON user_roles FOR ALL
--     USING (is_admin());
-- 
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('admin-user-uuid-here', 'admin');

-- ============================================================================
-- TESTING RLS POLICIES
-- ============================================================================
-- Test as anonymous user:
-- SET ROLE anon;
-- SELECT * FROM novels; -- Should only see published novels
-- 
-- Test as authenticated user:
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub = 'user-uuid-here';
-- SELECT * FROM bookmarks; -- Should only see own bookmarks
-- 
-- Reset:
-- RESET ROLE;
