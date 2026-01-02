-- Migration: 007_create_genres.sql
-- Create genres taxonomy table with soft-delete and constraints

-- Ensure pgcrypto extension is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.genres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  deleted_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- If the table already exists (older deployments), ensure expected columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'genres' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE public.genres ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'genres' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.genres ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'genres' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.genres ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END;
$$;

-- Case-insensitive unique constraint for name
CREATE UNIQUE INDEX IF NOT EXISTS genres_name_ci_unique ON public.genres (lower(name));
-- Unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS genres_slug_unique ON public.genres (slug);
-- Index to speed up queries filtering by deleted_at
CREATE INDEX IF NOT EXISTS genres_deleted_at_idx ON public.genres (deleted_at);

-- Trigger to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_timestamp ON public.genres;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.genres
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Notes:
-- - Enforce case-insensitive uniqueness of `name` via index on lower(name).
-- - Do NOT hard-delete genres; application must set `deleted_at` instead of deleting rows.
-- - After running this migration, update application-level queries to filter `deleted_at IS NULL` when listing genres.
