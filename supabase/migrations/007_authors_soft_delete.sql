-- Migration 007: Make authors first-class with soft-delete, normalized name, and delete protection

-- Enable unaccent extension (idempotent)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add deleted_at column to authors
ALTER TABLE IF EXISTS authors
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Add normalized_name to support case-insensitive + accent-insensitive uniqueness
ALTER TABLE IF EXISTS authors
  ADD COLUMN IF NOT EXISTS normalized_name VARCHAR(255);

-- Create function to populate normalized_name for authors
CREATE OR REPLACE FUNCTION public.authors_set_normalized_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_name := lower(unaccent(coalesce(NEW.name, '')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set normalized_name on insert/update for authors
DROP TRIGGER IF EXISTS trg_authors_normalized_name ON authors;
CREATE TRIGGER trg_authors_normalized_name
BEFORE INSERT OR UPDATE ON authors
FOR EACH ROW
EXECUTE PROCEDURE public.authors_set_normalized_name();

-- Create unique index on normalized_name for non-deleted authors
CREATE UNIQUE INDEX IF NOT EXISTS idx_authors_normalized_name_unique ON authors (normalized_name) WHERE deleted_at IS NULL;

-- Prevent hard DELETEs on authors by raising an exception in a trigger
CREATE OR REPLACE FUNCTION public.prevent_author_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard delete of authors is not allowed. Use soft delete (set deleted_at) instead.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_delete_author ON authors;
CREATE TRIGGER trg_prevent_delete_author
BEFORE DELETE ON authors
FOR EACH ROW
EXECUTE PROCEDURE public.prevent_author_delete();

-- Adjust novels.author_id foreign key to RESTRICT deletes on author (protect relations)
ALTER TABLE IF EXISTS novels DROP CONSTRAINT IF EXISTS novels_author_id_fkey;
ALTER TABLE IF EXISTS novels ADD CONSTRAINT fk_novels_author_id FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE RESTRICT;

-- Optional: index to speed up queries that exclude deleted authors
CREATE INDEX IF NOT EXISTS idx_authors_not_deleted ON authors (id) WHERE deleted_at IS NULL;

-- Note: After applying this migration, application code that queries authors should use WHERE deleted_at IS NULL (or .is('deleted_at', null) in Supabase client).
