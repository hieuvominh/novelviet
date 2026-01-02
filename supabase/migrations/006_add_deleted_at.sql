-- Migration: 006_add_deleted_at.sql
-- Adds soft-delete columns for novels and chapters and supporting indexes.

BEGIN;

-- Add deleted_at to novels
ALTER TABLE IF EXISTS public.novels
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Add deleted_at to chapters
ALTER TABLE IF EXISTS public.chapters
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Indexes to help queries that filter by deleted_at
CREATE INDEX IF NOT EXISTS idx_novels_deleted_at ON public.novels (deleted_at);
CREATE INDEX IF NOT EXISTS idx_chapters_deleted_at ON public.chapters (deleted_at);

COMMIT;

-- NOTES:
-- After applying this migration, update RLS policies and public queries to include
-- `deleted_at IS NULL` where appropriate (public read policies, published-chapters logic, etc.).
-- Example RLS tweak for published chapters (adjust policy name & syntax to match your DB):
--
-- CREATE OR REPLACE POLICY "Published chapters are viewable by everyone"
--   ON chapters FOR SELECT
--   USING (
--       is_published = true
--       AND deleted_at IS NULL
--       AND EXISTS (
--           SELECT 1 FROM novels
--           WHERE novels.id = chapters.novel_id
--           AND novels.is_published = true
--           AND novels.deleted_at IS NULL
--       )
--   );
--
-- Run this migration using your database migration tooling or via psql against the Supabase project.
