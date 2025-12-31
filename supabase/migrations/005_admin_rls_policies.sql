-- =====================================================
-- ADMIN CMS ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- 
-- Security Model:
-- - Anonymous users: NO access (use service role server-side)
-- - Authenticated users: Role-based access via public.profiles
-- - EDITOR: SELECT, INSERT, UPDATE
-- - ADMIN: Full CRUD
--
-- NOTE: profiles table is created in 004_profiles_table.sql
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON ALL CONTENT TABLES
-- =====================================================

ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. HELPER FUNCTION FOR ROLE CHECKS
-- =====================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is editor or admin
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. NOVELS TABLE POLICIES
-- =====================================================

-- SELECT: Editor + Admin
CREATE POLICY "Editors and admins can read all novels"
  ON public.novels
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- INSERT: Editor + Admin
CREATE POLICY "Editors and admins can insert novels"
  ON public.novels
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- UPDATE: Editor + Admin
CREATE POLICY "Editors and admins can update novels"
  ON public.novels
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- DELETE: Admin only
CREATE POLICY "Only admins can delete novels"
  ON public.novels
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 4. CHAPTERS TABLE POLICIES
-- =====================================================

-- SELECT: Editor + Admin
CREATE POLICY "Editors and admins can read all chapters"
  ON public.chapters
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- INSERT: Editor + Admin
CREATE POLICY "Editors and admins can insert chapters"
  ON public.chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- UPDATE: Editor + Admin
CREATE POLICY "Editors and admins can update chapters"
  ON public.chapters
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- DELETE: Admin only
CREATE POLICY "Only admins can delete chapters"
  ON public.chapters
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 5. AUTHORS TABLE POLICIES
-- =====================================================

-- SELECT: Editor + Admin
CREATE POLICY "Editors and admins can read all authors"
  ON public.authors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- INSERT: Editor + Admin
CREATE POLICY "Editors and admins can insert authors"
  ON public.authors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- UPDATE: Editor + Admin
CREATE POLICY "Editors and admins can update authors"
  ON public.authors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- DELETE: Admin only
CREATE POLICY "Only admins can delete authors"
  ON public.authors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 6. GENRES TABLE POLICIES
-- =====================================================

-- SELECT: Editor + Admin
CREATE POLICY "Editors and admins can read all genres"
  ON public.genres
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- INSERT: Editor + Admin
CREATE POLICY "Editors and admins can insert genres"
  ON public.genres
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- UPDATE: Editor + Admin
CREATE POLICY "Editors and admins can update genres"
  ON public.genres
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- DELETE: Admin only
CREATE POLICY "Only admins can delete genres"
  ON public.genres
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 7. NOVEL_GENRES JUNCTION TABLE POLICIES
-- =====================================================

ALTER TABLE public.novel_genres ENABLE ROW LEVEL SECURITY;

-- SELECT: Editor + Admin
CREATE POLICY "Editors and admins can read novel_genres"
  ON public.novel_genres
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- INSERT: Editor + Admin
CREATE POLICY "Editors and admins can insert novel_genres"
  ON public.novel_genres
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'editor')
    )
  );

-- DELETE: Admin only
CREATE POLICY "Only admins can delete novel_genres"
  ON public.novel_genres
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- =====================================================
-- 8. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant usage on tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.novels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.genres TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.novel_genres TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- =====================================================
-- 9. TESTING QUERIES
-- =====================================================

-- Create test admin user (run this manually after creating auth user)
-- INSERT INTO public.profiles (id, role)
-- VALUES ('YOUR_AUTH_USER_ID_HERE', 'admin');

-- Create test editor user (run this manually after creating auth user)
-- INSERT INTO public.profiles (id, role)
-- VALUES ('YOUR_AUTH_USER_ID_HERE', 'editor');

-- Test queries:
-- SELECT public.is_admin(); -- Should return true for admin
-- SELECT public.is_editor_or_admin(); -- Should return true for both
