# 📚 Database Design Documentation - Vietnamese Novel Platform

## Table of Contents
1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Explanations](#table-explanations)
4. [Anti-Duplicate Strategy](#anti-duplicate-strategy)
5. [View Count Optimization](#view-count-optimization)
6. [Index Strategy](#index-strategy)
7. [SEO Implementation](#seo-implementation)
8. [Security (RLS)](#security-rls)
9. [Maintenance Tasks](#maintenance-tasks)
10. [Usage Examples](#usage-examples)

---

## Overview

This database is designed for a **Vietnamese online novel platform** with these priorities:
- ✅ **SEO-first**: Every novel & chapter has unique slugs for Google indexing
- ✅ **Anti-duplicate**: Prevent duplicate novels/chapters from crawlers
- ✅ **High-performance**: Optimized for high read traffic, low write amplification
- ✅ **Scalable view counting**: Efficient trending/ranking without database bottlenecks
- ✅ **Future-proof**: Easy to add comments later
- ✅ **Secure**: RLS policies for public/authenticated/admin access

---

## Entity Relationship Diagram

```
┌─────────────┐
│   authors   │──┐
└─────────────┘  │
                 │ 1:N
                 ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│   genres    │──│ novel_genres │──│   novels    │
└─────────────┘  └──────────────┘  └─────────────┘
       │                                    │
       │ M:N                                │ 1:N
       └────────────────────────────────────┘
                                             │
                                             ▼
                                     ┌─────────────┐
                                     │  chapters   │
                                     └─────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
            ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
            │ chapter_views│        │  bookmarks   │        │   ratings    │
            └──────────────┘        └──────────────┘        └──────────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │ reading_progress │
                                    └──────────────────┘
```

---

## Table Explanations

### 1. **authors**
Stores author information with Vietnamese character support.

**Key Fields:**
- `name`: Display name (with Vietnamese accents)
- `slug`: URL-safe identifier (auto-generated from name)
- `normalized_name`: Lowercase, no accents (for duplicate detection)
- `bio`, `avatar_url`: Optional metadata

**Why this design:**
- Separate `slug` and `normalized_name` for dual purposes: SEO URLs and duplicate detection
- Vietnamese text normalization prevents "Nguyễn Văn A" and "nguyen van a" duplicates

---

### 2. **genres**
Hierarchical genre/category system.

**Key Fields:**
- `name`: English name (e.g., "Fantasy")
- `name_vi`: Vietnamese translation (e.g., "Huyền Huyễn")
- `slug`: URL-safe identifier
- `parent_id`: For nested genres (e.g., "Fantasy" > "Xuanhuan")

**Why this design:**
- Supports bilingual content (Vietnamese primary, English optional)
- Hierarchical for advanced categorization
- Each genre has SEO metadata for landing pages

---

### 3. **novels**
Main content table with comprehensive metadata.

**Key Fields:**
- `title`, `slug`: SEO-optimized identifiers
- `normalized_title`: Duplicate detection
- `source_url`: Original crawl source (NULL for manual)
- `source_type`: ENUM ('crawled', 'manual', 'imported')
- `status`: ENUM ('draft', 'ongoing', 'completed', 'hiatus', 'dropped')

**Denormalized Statistics (for performance):**
- `total_chapters`, `total_words`: Updated via triggers
- `view_count_total/weekly/daily`: Separate counters for trending
- `rating_average`, `rating_count`: Aggregated ratings
- `bookmark_count`: User favorites

**SEO Fields:**
- `meta_title`, `meta_description`, `meta_keywords`: Per-novel SEO
- `alternative_titles`: For search and schema.org

**Why this design:**
- **Denormalization**: Pre-computed stats avoid expensive JOINs on every page load
- **Multiple view counters**: Enable daily/weekly/all-time trending without complex queries
- **source_url UNIQUE constraint**: Prevents duplicate crawls from same source
- **normalized_title + trigram index**: Fuzzy duplicate detection (catches "Novel ABC" vs "Novel ABC!")

---

### 4. **novel_genres** (Join Table)
Many-to-many relationship between novels and genres.

**Why this design:**
- Novels can belong to multiple genres (e.g., "Fantasy + Romance")
- Simple composite primary key (novel_id, genre_id)
- Indexed for fast filtering (e.g., "all Fantasy novels")

---

### 5. **chapters**
Individual chapters with full anti-duplicate protection.

**Key Fields:**
- `novel_id`: Parent novel
- `chapter_number`: Ordering (1, 2, 3...)
- `slug`: URL-safe identifier (auto-generated: "chuong-1-ten-chuong")
- `normalized_title`: Duplicate detection
- `content_hash`: SHA256 of normalized content
- `source_url`: Original crawl source

**Unique Constraints:**
- `(novel_id, slug)`: No duplicate slugs per novel
- `(novel_id, chapter_number)`: No duplicate numbers per novel

**Why this design:**
- **content_hash**: Detects identical content even with different titles (crawler variations)
- **Unique constraints**: Database-level duplicate prevention
- **Per-novel slug uniqueness**: Allows "chuong-1" in different novels
- **word_count**: Auto-calculated via trigger for Vietnamese text

---

### 6. **chapter_views** (High-Performance View Tracking)
⚡ **The most important table for performance optimization**

**Key Fields:**
- `chapter_id`, `novel_id`: What was viewed (novel_id denormalized)
- `user_id`: Optional (NULL for anonymous)
- `session_id`: Browser session identifier
- `ip_hash`: Hashed IP (GDPR-compliant, for abuse prevention)
- `view_date`: Partitioning hint

**Deduplication Strategy:**
- Unique index on `(chapter_id, session_id, hour)` prevents double-counting within 1 hour

**Why this design:**
- **Separate table**: Avoids UPDATE on `chapters` table for every view (write amplification)
- **Batch aggregation**: Views are batched and aggregated periodically (every 5-15 min)
- **Denormalized novel_id**: Speeds up novel-level view queries
- **Date-based partitioning**: Old data can be archived/deleted easily
- **Session-based deduplication**: Balances accuracy and performance

**Performance Math:**
- ❌ **Bad**: UPDATE chapters SET view_count = view_count + 1 → 10,000 views = 10,000 writes
- ✅ **Good**: INSERT into chapter_views → Batch aggregate every 15 min → 10,000 views = 10,000 inserts + 1 batch update

---

### 7. **bookmarks**
User-saved novels (favorites/library).

**Key Fields:**
- `user_id`, `novel_id`: User-novel relationship
- Unique constraint prevents duplicate bookmarks

**Why this design:**
- Simple join table
- Triggers update `novels.bookmark_count` automatically
- RLS ensures users only see their own bookmarks

---

### 8. **reading_progress**
Tracks where user stopped reading.

**Key Fields:**
- `user_id`, `novel_id`, `chapter_id`: Current position
- `progress_percentage`: How far in chapter (0-100%)
- `scroll_position`: Exact pixel position (for resume)

**Unique constraint:** One progress per user per novel

**Why this design:**
- Enables "Continue Reading" feature
- Single record per novel (updated on chapter change)
- RLS ensures privacy

---

### 9. **ratings**
User ratings with 1-5 stars.

**Key Fields:**
- `user_id`, `novel_id`: Who rated what
- `rating`: Integer 1-5
- `review_text`: Optional (for future comments)
- Unique constraint: One rating per user per novel

**Why this design:**
- Triggers update `novels.rating_average` and `novels.rating_count` automatically
- `review_text` prepares for comment system (no migration needed later)
- Index on `(novel_id, rating)` enables rating histograms

---

### 10. **novel_statistics** (Materialized View)
Pre-computed stats for homepage/trending pages.

**Why this exists:**
- Complex aggregations (COUNT chapters, SUM word_count) are expensive
- Materialized view = cached query results
- Refresh periodically (e.g., every 5-30 minutes via cron)

**When to use:**
- Homepage trending lists
- Search results with stats
- Any page showing multiple novels with stats

---

## Anti-Duplicate Strategy

### Problem
Crawlers may fetch the same novel/chapter from:
- Different URLs (e.g., mirror sites)
- Different formats (e.g., "Chương 1: Bắt Đầu" vs "chuong 1 bat dau")

### Solution: Multi-Layer Defense

#### Layer 1: Unique Constraints (Database-level)
```sql
-- Novels
UNIQUE (source_url)           -- Same source = duplicate
UNIQUE (slug)                 -- Same slug = duplicate

-- Chapters
UNIQUE (novel_id, slug)       -- Same chapter number per novel
UNIQUE (novel_id, chapter_number)
```

#### Layer 2: Normalized Text Matching
```sql
-- Before INSERT, check if normalized title exists
SELECT * FROM novels 
WHERE normalized_title = normalize_text('New Novel Title')
AND author_id = ?;

-- normalize_text() function:
-- - Removes Vietnamese accents
-- - Lowercase
-- - Removes special characters
-- - Trims whitespace
```

**Example:**
- "Đấu Phá Thương Khung" → "dau pha thuong khung"
- "dau pha thuong khung" → "dau pha thuong khung" ✅ Match!

#### Layer 3: Fuzzy Matching (Trigram Similarity)
```sql
-- Find similar titles using pg_trgm extension
SELECT title, similarity(normalized_title, 'dau pha thuong') AS sim
FROM novels
WHERE normalized_title % 'dau pha thuong'  -- % operator = similar
ORDER BY sim DESC
LIMIT 5;
```

**Use case:** Catches typos like "Đấu Phá" vs "Đấu Po"

#### Layer 4: Content Hash (Chapters)
```sql
-- SHA256 of normalized content
content_hash = SHA256(normalize_text(chapter_content))

-- Before INSERT, check:
SELECT * FROM chapters
WHERE novel_id = ?
AND content_hash = ?;
```

**Why this works:**
- Even if title differs ("Chương 1" vs "Chapter 1"), content is identical
- Hash comparison is fast (indexed)

### Implementation Checklist

**Before inserting a novel from crawler:**
1. Check `source_url` exists
2. Check normalized_title with exact match
3. If not found, check trigram similarity > 0.8
4. If still not found, safe to insert

**Before inserting a chapter:**
1. Check `(novel_id, chapter_number)` exists
2. Check `(novel_id, content_hash)` exists
3. If not found, safe to insert

---

## View Count Optimization

### The Problem
High-traffic novel sites have views → 1,000,000s per day.

**Naive approach (❌ Bad):**
```sql
-- Every page view executes:
UPDATE chapters SET view_count = view_count + 1 WHERE id = ?;
UPDATE novels SET view_count_total = view_count_total + 1 WHERE id = ?;
```

**Issues:**
- 1 million views = 2 million UPDATE statements
- Locks on novels/chapters tables
- Slow under load
- Expensive indexes to maintain

### Our Solution: Batch Aggregation

#### Architecture
```
User visits chapter
       ↓
INSERT into chapter_views (lightweight)
       ↓
[Every 5-15 minutes]
       ↓
Cron job: aggregate_chapter_views()
       ↓
UPDATE novels/chapters with batched counts
```

#### Benefits
- ✅ **No locks on hot tables**: Inserts are fast and non-blocking
- ✅ **Batch updates**: 1,000,000 views → 1 batch update per table
- ✅ **Deduplication**: Session-based prevents refresh spam
- ✅ **Scalable**: Can move to Redis for even better performance

#### Implementation

**Step 1: Record view (client-side)**
```typescript
// On chapter page load
await supabase.rpc('record_chapter_view', {
  p_chapter_id: chapterId,
  p_novel_id: novelId,
  p_session_id: sessionStorage.getItem('session_id'),
  p_ip_hash: hashIP(userIP), // Backend-generated
});
```

**Step 2: Aggregate (cron job)**
```sql
-- Run every 5-15 minutes via pg_cron or external scheduler
SELECT aggregate_chapter_views();
```

**Step 3: Reset periodic counts (scheduled)**
```sql
-- Daily at midnight (UTC)
SELECT reset_daily_view_counts();

-- Weekly on Monday
SELECT reset_weekly_view_counts();
```

**Step 4: Cleanup old data**
```sql
-- Weekly: Delete views older than 30 days
SELECT cleanup_old_chapter_views();
```

### Trending Queries (Optimized)

**Daily trending:**
```sql
SELECT * FROM novels
WHERE is_published = true
ORDER BY view_count_daily DESC, rating_average DESC
LIMIT 20;
-- Uses: idx_novels_trending_daily (composite index)
```

**Weekly trending:**
```sql
SELECT * FROM novels
WHERE is_published = true
ORDER BY view_count_weekly DESC, rating_average DESC
LIMIT 20;
-- Uses: idx_novels_trending_weekly
```

**All-time popular:**
```sql
SELECT * FROM novels
WHERE is_published = true
ORDER BY view_count_total DESC, rating_average DESC
LIMIT 20;
-- Uses: idx_novels_trending_alltime
```

---

## Index Strategy

### Performance Indexes

#### Novels Table
```sql
-- SEO & Routing
idx_novels_slug (slug)                           -- Lookup by URL

-- Filtering
idx_novels_author_id (author_id)                 -- Author's novels
idx_novels_status (status)                       -- Filter by status
idx_novels_is_published (is_published)           -- Published only

-- Sorting (Composite Indexes)
idx_novels_trending_daily (view_count_daily DESC, rating_average DESC)
idx_novels_trending_weekly (view_count_weekly DESC, rating_average DESC)
idx_novels_trending_alltime (view_count_total DESC, rating_average DESC)
idx_novels_top_rated (rating_average DESC, rating_count DESC)
idx_novels_latest (last_chapter_at DESC NULLS LAST)
```

**Why composite indexes?**
- Trending pages often sort by views + rating
- Single index covers `ORDER BY view_count DESC, rating DESC`
- Much faster than separate indexes

#### Chapters Table
```sql
-- Routing
idx_chapters_slug (novel_id, slug)               -- Lookup chapter by URL

-- Sorting
idx_chapters_chapter_number (novel_id, chapter_number)  -- Chapter list
idx_chapters_published_at (novel_id, published_at DESC) -- Latest chapters
```

#### Anti-Duplicate Indexes
```sql
-- Exact match
idx_novels_normalized_title (normalized_title)
idx_novels_source_url (source_url) WHERE source_url IS NOT NULL

-- Fuzzy match (trigram)
idx_novels_normalized_title_trgm (normalized_title gin_trgm_ops)

-- Content hash
idx_chapters_content_hash (novel_id, content_hash)
```

### Index Maintenance

**Check unused indexes:**
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Rebuild bloated indexes (periodic):**
```sql
REINDEX INDEX CONCURRENTLY idx_novels_trending_daily;
```

---

## SEO Implementation

### URL Structure

**Novel pages:**
```
https://yoursite.com/truyen/{novel_slug}
Example: https://yoursite.com/truyen/dau-pha-thuong-khung
```

**Chapter pages:**
```
https://yoursite.com/truyen/{novel_slug}/{chapter_slug}
Example: https://yoursite.com/truyen/dau-pha-thuong-khung/chuong-1-thieu-nien
```

### Metadata Generation

**Novel page:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { data: novel } = await supabase
    .from('novels')
    .select('*')
    .eq('slug', params.slug)
    .single();

  return {
    title: novel.meta_title || novel.title,
    description: novel.meta_description,
    keywords: novel.meta_keywords,
    openGraph: {
      title: novel.title,
      description: novel.description,
      images: [novel.cover_url],
      type: 'book',
    },
    alternates: {
      canonical: `/truyen/${novel.slug}`,
    },
  };
}
```

### Schema.org Structured Data

**Novel (Book schema):**
```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Book",
  "name": novel.title,
  "author": {
    "@type": "Person",
    "name": author.name,
    "url": `/tac-gia/${author.slug}`
  },
  "genre": genres.map(g => g.name),
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": novel.rating_average,
    "ratingCount": novel.rating_count,
    "bestRating": 5,
    "worstRating": 1
  },
  "numberOfPages": novel.total_chapters,
  "inLanguage": "vi",
  "description": novel.description,
  "image": novel.cover_url,
  "url": `${siteUrl}/truyen/${novel.slug}`
};
```

### Sitemap Generation

**Dynamic sitemap (Next.js):**
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: novels } = await supabase
    .from('novels')
    .select('slug, updated_at')
    .eq('is_published', true)
    .limit(10000);

  return novels.map(novel => ({
    url: `https://yoursite.com/truyen/${novel.slug}`,
    lastModified: novel.updated_at,
    changeFrequency: 'daily',
    priority: 0.8,
  }));
}
```

---

## Security (RLS)

### Access Levels

| Role | Authors | Novels | Chapters | Bookmarks | Ratings | Views |
|------|---------|--------|----------|-----------|---------|-------|
| **Anonymous** | Read | Read published | Read published | ❌ | Read | Write |
| **Authenticated** | Read | Read published | Read published | Full CRUD (own) | Full CRUD (own) | Write |
| **Admin** | Full CRUD | Full CRUD | Full CRUD | Read all | Full CRUD | Read all |

### Admin Setup

**Method 1: User Metadata (Simpler)**
```sql
-- After creating admin user in Supabase Dashboard
UPDATE auth.users SET
    raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@yourdomain.com';
```

**Check in queries:**
```sql
-- is_admin() function checks JWT:
-- auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
```

**Method 2: Custom user_roles Table (More Flexible)**
```sql
CREATE TABLE user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO user_roles (user_id, role)
VALUES ('admin-uuid', 'admin');
```

### Testing RLS

```sql
-- Test as anonymous
SET ROLE anon;
SELECT * FROM novels; -- Should only see published

-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub = 'test-user-uuid';
SELECT * FROM bookmarks; -- Should only see own bookmarks

-- Reset
RESET ROLE;
```

---

## Maintenance Tasks

### Scheduled Jobs (pg_cron or external)

**Every 5-15 minutes:**
```sql
SELECT aggregate_chapter_views();
```

**Daily (Midnight UTC):**
```sql
SELECT reset_daily_view_counts();
SELECT cleanup_old_chapter_views();
```

**Weekly (Monday 00:00 UTC):**
```sql
SELECT reset_weekly_view_counts();
```

**Every 15-30 minutes:**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY novel_statistics;
```

### Monitoring Queries

**Check table sizes:**
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Check view aggregation lag:**
```sql
SELECT 
    COUNT(*) AS pending_views,
    MIN(viewed_at) AS oldest_view,
    MAX(viewed_at) AS newest_view
FROM chapter_views
WHERE viewed_at >= NOW() - INTERVAL '15 minutes';
```

**Check slow queries:**
```sql
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Usage Examples

### Insert Novel with Anti-Duplicate Check

```typescript
// Check for duplicates first
const normalizedTitle = await supabase.rpc('normalize_text', { text_input: title });

const { data: existing } = await supabase
  .from('novels')
  .select('id, title')
  .eq('normalized_title', normalizedTitle)
  .eq('author_id', authorId)
  .single();

if (existing) {
  console.log('Duplicate found:', existing.title);
  return;
}

// Safe to insert
const { data: novel } = await supabase
  .from('novels')
  .insert({
    title,
    description,
    author_id: authorId,
    source_url: crawlUrl,
    source_type: 'crawled',
  })
  .select()
  .single();
// slug, normalized_title auto-generated via trigger
```

### Insert Chapter with Hash Check

```typescript
const contentHash = await supabase.rpc('compute_content_hash', { content });

const { data: duplicate } = await supabase
  .from('chapters')
  .select('id, title')
  .eq('novel_id', novelId)
  .eq('content_hash', contentHash)
  .single();

if (duplicate) {
  console.log('Duplicate chapter content:', duplicate.title);
  return;
}

const { data: chapter } = await supabase
  .from('chapters')
  .insert({
    novel_id: novelId,
    title: chapterTitle,
    chapter_number: nextNumber,
    content,
  })
  .select()
  .single();
// slug, content_hash, word_count auto-generated
```

### Record Chapter View

```typescript
const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
sessionStorage.setItem('session_id', sessionId);

const { data: recorded } = await supabase.rpc('record_chapter_view', {
  p_chapter_id: chapterId,
  p_novel_id: novelId,
  p_user_id: user?.id || null,
  p_session_id: sessionId,
});

// Returns true if view recorded, false if duplicate within hour
```

### Get Trending Novels

```typescript
const { data: trending } = await supabase
  .from('novels')
  .select(`
    *,
    authors(name, slug),
    novel_genres(genres(name, slug))
  `)
  .eq('is_published', true)
  .order('view_count_daily', { ascending: false })
  .order('rating_average', { ascending: false })
  .limit(20);
// Uses idx_novels_trending_daily
```

### User Bookmark Novel

```typescript
const { data } = await supabase
  .from('bookmarks')
  .insert({
    user_id: user.id,
    novel_id: novelId,
  })
  .select()
  .single();

// Trigger automatically updates novels.bookmark_count
```

### Update Reading Progress

```typescript
const { data } = await supabase
  .from('reading_progress')
  .upsert({
    user_id: user.id,
    novel_id: novelId,
    chapter_id: currentChapterId,
    progress_percentage: 45,
    scroll_position: 1200,
  }, {
    onConflict: 'user_id, novel_id'
  })
  .select()
  .single();
```

---

## Summary

This database design provides:

✅ **SEO-optimized**: Slugs, metadata, sitemap-ready
✅ **Anti-duplicate**: Multi-layer protection (constraints, normalized text, fuzzy match, content hash)
✅ **High-performance**: Denormalized stats, composite indexes, batch view aggregation
✅ **Scalable**: Handles millions of views without write amplification
✅ **Secure**: RLS policies for all access levels
✅ **Future-proof**: Ready for comments (review_text field exists)
✅ **Vietnamese-optimized**: Character normalization, accent handling

**Next Steps:**
1. Run migrations in Supabase
2. Set up admin role
3. Create scheduled jobs for aggregation
4. Implement crawler with duplicate checks
5. Build frontend with SEO best practices

---

**Total Tables:** 9 core + 1 materialized view
**Total Functions:** 15+
**Total Indexes:** 30+
**Total RLS Policies:** 40+
