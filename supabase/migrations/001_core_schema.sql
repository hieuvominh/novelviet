-- ============================================================================
-- SUPABASE DATABASE SCHEMA FOR VIETNAMESE NOVEL PLATFORM
-- ============================================================================
-- Description: Production-ready schema with SEO optimization, anti-duplicate,
--              efficient view counting, and future-proof design
-- Version: 1.0
-- Date: 2025-12-30
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- Novel status enum
CREATE TYPE novel_status AS ENUM ('draft', 'ongoing', 'completed', 'hiatus', 'dropped');

-- Content source type
CREATE TYPE content_source AS ENUM ('crawled', 'manual', 'imported');

-- ============================================================================
-- TABLE: authors
-- ============================================================================
-- Stores author information with anti-duplicate measures
-- ============================================================================

CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    
    -- Anti-duplicate fields
    normalized_name VARCHAR(255) NOT NULL, -- Lowercased, no accents for duplicate detection
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT authors_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Index for duplicate detection
CREATE INDEX idx_authors_normalized_name ON authors(normalized_name);
CREATE INDEX idx_authors_slug ON authors(slug);

-- ============================================================================
-- TABLE: genres
-- ============================================================================
-- Genre/category taxonomy for novels
-- ============================================================================

CREATE TABLE IF NOT EXISTS genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_vi VARCHAR(100), -- Vietnamese translation
    description TEXT,
    parent_id UUID REFERENCES genres(id) ON DELETE SET NULL, -- For hierarchical genres
    
    -- SEO fields
    meta_description TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_genres_slug ON genres(slug);
CREATE INDEX idx_genres_parent_id ON genres(parent_id);

-- ============================================================================
-- TABLE: novels
-- ============================================================================
-- Main table for storing novels with SEO optimization
-- ============================================================================

CREATE TABLE IF NOT EXISTS novels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    alternative_titles TEXT[], -- Array of alternative titles
    description TEXT NOT NULL,
    cover_url TEXT,
    
    -- Author relationship
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    
    -- Status
    status novel_status DEFAULT 'ongoing',
    
    -- Anti-duplicate fields
    normalized_title VARCHAR(500) NOT NULL, -- For duplicate detection
    source_url TEXT UNIQUE, -- Original crawl URL (NULL for manual entry)
    source_type content_source DEFAULT 'manual',
    
    -- Statistics (denormalized for performance)
    total_chapters INTEGER DEFAULT 0,
    total_words BIGINT DEFAULT 0,
    view_count_total BIGINT DEFAULT 0, -- All-time views
    view_count_weekly BIGINT DEFAULT 0, -- Reset weekly
    view_count_daily BIGINT DEFAULT 0, -- Reset daily
    rating_average DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
    rating_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    
    -- SEO fields
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Publishing
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_chapter_at TIMESTAMPTZ, -- Last chapter published time
    
    -- Constraints
    CONSTRAINT novels_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT novels_description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Performance indexes
CREATE INDEX idx_novels_slug ON novels(slug);
CREATE INDEX idx_novels_author_id ON novels(author_id);
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_is_published ON novels(is_published);
CREATE INDEX idx_novels_published_at ON novels(published_at DESC) WHERE is_published = true;

-- Anti-duplicate indexes
CREATE INDEX idx_novels_normalized_title ON novels(normalized_title);
CREATE INDEX idx_novels_source_url ON novels(source_url) WHERE source_url IS NOT NULL;
CREATE INDEX idx_novels_normalized_title_trgm ON novels USING gin(normalized_title gin_trgm_ops); -- Fuzzy search

-- Ranking indexes (composite for trending queries)
CREATE INDEX idx_novels_trending_daily ON novels(view_count_daily DESC, rating_average DESC) 
    WHERE is_published = true;
CREATE INDEX idx_novels_trending_weekly ON novels(view_count_weekly DESC, rating_average DESC) 
    WHERE is_published = true;
CREATE INDEX idx_novels_trending_alltime ON novels(view_count_total DESC, rating_average DESC) 
    WHERE is_published = true;
CREATE INDEX idx_novels_top_rated ON novels(rating_average DESC, rating_count DESC) 
    WHERE is_published = true AND rating_count > 0;
CREATE INDEX idx_novels_latest ON novels(last_chapter_at DESC NULLS LAST) 
    WHERE is_published = true;

-- ============================================================================
-- TABLE: novel_genres (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS novel_genres (
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (novel_id, genre_id)
);

CREATE INDEX idx_novel_genres_novel_id ON novel_genres(novel_id);
CREATE INDEX idx_novel_genres_genre_id ON novel_genres(genre_id);

-- ============================================================================
-- TABLE: chapters
-- ============================================================================
-- Individual chapters with SEO optimization
-- ============================================================================

CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    
    -- Basic info
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL, -- Unique within novel
    chapter_number INTEGER NOT NULL, -- Ordering within novel
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    
    -- Anti-duplicate
    normalized_title VARCHAR(500) NOT NULL,
    source_url TEXT, -- Original crawl URL
    content_hash TEXT, -- SHA256 of normalized content for duplicate detection
    
    -- Publishing
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    
    -- View counting (aggregated from chapter_views)
    view_count BIGINT DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chapters_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT chapters_content_not_empty CHECK (LENGTH(TRIM(content)) > 0),
    CONSTRAINT chapters_unique_slug_per_novel UNIQUE (novel_id, slug),
    CONSTRAINT chapters_unique_number_per_novel UNIQUE (novel_id, chapter_number)
);

-- Performance indexes
CREATE INDEX idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX idx_chapters_slug ON chapters(novel_id, slug);
CREATE INDEX idx_chapters_chapter_number ON chapters(novel_id, chapter_number);
CREATE INDEX idx_chapters_is_published ON chapters(is_published);
CREATE INDEX idx_chapters_published_at ON chapters(novel_id, published_at DESC) 
    WHERE is_published = true;

-- Anti-duplicate indexes
CREATE INDEX idx_chapters_content_hash ON chapters(novel_id, content_hash) 
    WHERE content_hash IS NOT NULL;
CREATE INDEX idx_chapters_source_url ON chapters(source_url) 
    WHERE source_url IS NOT NULL;

-- ============================================================================
-- TABLE: chapter_views (Optimized View Tracking)
-- ============================================================================
-- Separate table for high-volume view tracking to avoid write amplification
-- Strategy: Batch inserts, periodic aggregation
-- ============================================================================

CREATE TABLE IF NOT EXISTS chapter_views (
    id BIGSERIAL PRIMARY KEY,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE, -- Denormalized for performance
    
    -- Optional user tracking (NULL for anonymous)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- View metadata
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    session_id TEXT, -- For deduplication within session
    ip_hash TEXT, -- Hashed IP for abuse prevention (GDPR-compliant)
    
    -- Partitioning hint
    view_date DATE DEFAULT CURRENT_DATE
);

-- Partition by date for efficient querying and cleanup
CREATE INDEX idx_chapter_views_chapter_id ON chapter_views(chapter_id, viewed_at DESC);
CREATE INDEX idx_chapter_views_novel_id ON chapter_views(novel_id, viewed_at DESC);
CREATE INDEX idx_chapter_views_view_date ON chapter_views(view_date);
CREATE INDEX idx_chapter_views_user_id ON chapter_views(user_id) WHERE user_id IS NOT NULL;

-- Unique session constraint (prevent double-counting within 1 hour)
-- Use UTC conversion to make the function immutable
CREATE UNIQUE INDEX idx_chapter_views_dedup ON chapter_views(
    chapter_id, 
    session_id, 
    DATE_TRUNC('hour', (viewed_at AT TIME ZONE 'UTC'))
) WHERE session_id IS NOT NULL;

-- ============================================================================
-- TABLE: bookmarks
-- ============================================================================
-- User bookmarks/favorites
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT bookmarks_unique_user_novel UNIQUE (user_id, novel_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id, created_at DESC);
CREATE INDEX idx_bookmarks_novel_id ON bookmarks(novel_id);

-- ============================================================================
-- TABLE: reading_progress
-- ============================================================================
-- Track user reading progress per novel
-- ============================================================================

CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    scroll_position INTEGER DEFAULT 0, -- Last scroll position in chapter
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT reading_progress_unique_user_novel UNIQUE (user_id, novel_id)
);

CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id, updated_at DESC);
CREATE INDEX idx_reading_progress_novel_id ON reading_progress(novel_id);

-- ============================================================================
-- TABLE: ratings
-- ============================================================================
-- User ratings for novels (1-5 stars)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    novel_id UUID NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    
    -- Rating value
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Optional review text (for future comments feature)
    review_text TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT ratings_unique_user_novel UNIQUE (user_id, novel_id)
);

CREATE INDEX idx_ratings_user_id ON ratings(user_id, created_at DESC);
CREATE INDEX idx_ratings_novel_id ON ratings(novel_id);
CREATE INDEX idx_ratings_rating ON ratings(novel_id, rating); -- For histogram queries

-- ============================================================================
-- COMMENTS PREPARATION (Future-proofing)
-- ============================================================================
-- Schema ready to add comments without major migration
-- Polymorphic design: comments can belong to novels OR chapters
-- ============================================================================

-- When ready to implement, create:
-- CREATE TABLE comments (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--     
--     -- Polymorphic association
--     commentable_type VARCHAR(50) NOT NULL, -- 'novel' or 'chapter'
--     commentable_id UUID NOT NULL, -- novel_id or chapter_id
--     
--     -- Comment content
--     content TEXT NOT NULL,
--     
--     -- Nested comments (replies)
--     parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
--     
--     -- Moderation
--     is_approved BOOLEAN DEFAULT true,
--     is_deleted BOOLEAN DEFAULT false,
--     
--     -- Metadata
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_at TIMESTAMPTZ DEFAULT NOW(),
--     
--     CONSTRAINT comments_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
-- );

-- ============================================================================
-- MATERIALIZED VIEW: novel_statistics
-- ============================================================================
-- Pre-computed stats for faster queries (refresh periodically)
-- ============================================================================

CREATE MATERIALIZED VIEW novel_statistics AS
SELECT 
    n.id AS novel_id,
    n.title,
    n.slug,
    n.author_id,
    n.status,
    COUNT(DISTINCT c.id) AS chapter_count,
    SUM(c.word_count) AS total_words,
    n.view_count_total,
    n.view_count_weekly,
    n.view_count_daily,
    n.rating_average,
    n.rating_count,
    n.bookmark_count,
    MAX(c.published_at) AS last_chapter_published_at
FROM novels n
LEFT JOIN chapters c ON n.id = c.novel_id AND c.is_published = true
WHERE n.is_published = true
GROUP BY n.id;

CREATE UNIQUE INDEX idx_novel_statistics_novel_id ON novel_statistics(novel_id);
CREATE INDEX idx_novel_statistics_trending_daily ON novel_statistics(view_count_daily DESC, rating_average DESC);
CREATE INDEX idx_novel_statistics_trending_weekly ON novel_statistics(view_count_weekly DESC, rating_average DESC);

-- Refresh command (run via scheduled job):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY novel_statistics;
