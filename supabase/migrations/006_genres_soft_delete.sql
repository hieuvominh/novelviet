-- Migration 006: Add soft-delete, normalized name, and delete protection for genres

-- Enable unaccent extension for normalized comparisons
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add deleted_at column to genres
ALTER TABLE IF EXISTS genres
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Add normalized_name to support case-insensitive + accent-insensitive uniqueness
ALTER TABLE IF EXISTS genres
  ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(200);

-- Create function to populate normalized_name
CREATE OR REPLACE FUNCTION public.genres_set_normalized_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_name := lower(unaccent(coalesce(NEW.name, '')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set normalized_name on insert/update
DROP TRIGGER IF EXISTS trg_genres_normalized_name ON genres;
CREATE TRIGGER trg_genres_normalized_name
BEFORE INSERT OR UPDATE ON genres
FOR EACH ROW
EXECUTE PROCEDURE public.genres_set_normalized_name();

-- Create unique index on normalized_name for non-deleted genres
CREATE UNIQUE INDEX IF NOT EXISTS idx_genres_normalized_name_unique ON genres (normalized_name) WHERE deleted_at IS NULL;

-- Ensure slug uniqueness remains enforced globally (leave existing constraint). If you prefer to allow reusing slugs of deleted genres, drop unique constraint and create partial unique index instead.
-- Prevent hard DELETEs on genres by raising an exception in a trigger
CREATE OR REPLACE FUNCTION public.prevent_genre_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard delete of genres is not allowed. Use soft delete (set deleted_at) instead.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_delete_genre ON genres;
CREATE TRIGGER trg_prevent_delete_genre
BEFORE DELETE ON genres
FOR EACH ROW
EXECUTE PROCEDURE public.prevent_genre_delete();

-- Adjust novel_genres foreign key to RESTRICT deletes on genre (protect relations). This will fail if constraint name differs; use conditional drop if exists.
-- Attempt to drop existing foreign key constraint on genre_id
ALTER TABLE IF EXISTS novel_genres DROP CONSTRAINT IF EXISTS novel_genres_genre_id_fkey;
-- Add explicit named constraint with RESTRICT (no cascade)
ALTER TABLE IF EXISTS novel_genres ADD CONSTRAINT fk_novel_genres_genre_id FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE RESTRICT;

-- Optional: index to speed up queries that exclude deleted genres
CREATE INDEX IF NOT EXISTS idx_genres_not_deleted ON genres (id) WHERE deleted_at IS NULL;

-- Note: After applying this migration, existing application code that queries genres should use "WHERE deleted_at IS NULL" (or client code should use .is('deleted_at', null)).
