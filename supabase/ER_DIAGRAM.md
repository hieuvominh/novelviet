```mermaid
erDiagram
    authors ||--o{ novels : "writes"
    novels ||--o{ chapters : "contains"
    novels ||--o{ novel_genres : "has"
    genres ||--o{ novel_genres : "categorizes"
    genres ||--o{ genres : "parent_child"
    
    novels ||--o{ bookmarks : "bookmarked_by"
    novels ||--o{ ratings : "rated_by"
    novels ||--o{ reading_progress : "tracked_by"
    novels ||--o{ chapter_views : "viewed"
    chapters ||--o{ chapter_views : "viewed"
    chapters ||--o{ reading_progress : "current_position"
    
    users ||--o{ bookmarks : "creates"
    users ||--o{ ratings : "creates"
    users ||--o{ reading_progress : "creates"
    users ||--o{ chapter_views : "creates"

    authors {
        uuid id PK
        varchar name
        varchar slug UK
        text bio
        text avatar_url
        varchar normalized_name "for duplicate detection"
        timestamptz created_at
        timestamptz updated_at
    }

    genres {
        uuid id PK
        varchar name UK
        varchar slug UK
        varchar name_vi "Vietnamese translation"
        text description
        uuid parent_id FK "hierarchical"
        text meta_description
        timestamptz created_at
        timestamptz updated_at
    }

    novels {
        uuid id PK
        varchar title
        varchar slug UK "SEO-friendly URL"
        text_array alternative_titles
        text description
        text cover_url
        uuid author_id FK
        enum status "draft|ongoing|completed|hiatus|dropped"
        varchar normalized_title "duplicate detection"
        text source_url UK "crawler source"
        enum source_type "crawled|manual|imported"
        int total_chapters "denormalized"
        bigint total_words "denormalized"
        bigint view_count_total "all-time views"
        bigint view_count_weekly "reset weekly"
        bigint view_count_daily "reset daily"
        decimal rating_average "0.00-5.00"
        int rating_count "denormalized"
        int bookmark_count "denormalized"
        varchar meta_title "SEO"
        text meta_description "SEO"
        text_array meta_keywords "SEO"
        boolean is_published
        timestamptz published_at
        timestamptz created_at
        timestamptz updated_at
        timestamptz last_chapter_at
    }

    novel_genres {
        uuid novel_id PK,FK
        uuid genre_id PK,FK
        timestamptz created_at
    }

    chapters {
        uuid id PK
        uuid novel_id FK
        varchar title
        varchar slug "unique per novel"
        int chapter_number "unique per novel"
        text content
        int word_count "auto-calculated"
        varchar normalized_title "duplicate detection"
        text source_url "crawler source"
        text content_hash "SHA256 for duplicate detection"
        boolean is_published
        timestamptz published_at
        bigint view_count "aggregated from chapter_views"
        timestamptz created_at
        timestamptz updated_at
    }

    chapter_views {
        bigserial id PK
        uuid chapter_id FK
        uuid novel_id FK "denormalized for performance"
        uuid user_id FK "nullable for anonymous"
        timestamptz viewed_at
        text session_id "deduplication"
        text ip_hash "GDPR-compliant"
        date view_date "partitioning hint"
    }

    bookmarks {
        uuid id PK
        uuid user_id FK
        uuid novel_id FK
        timestamptz created_at
    }

    reading_progress {
        uuid id PK
        uuid user_id FK
        uuid novel_id FK
        uuid chapter_id FK "current chapter"
        int progress_percentage "0-100"
        int scroll_position "pixel position"
        timestamptz created_at
        timestamptz updated_at
    }

    ratings {
        uuid id PK
        uuid user_id FK
        uuid novel_id FK
        int rating "1-5 stars"
        text review_text "optional, for future comments"
        timestamptz created_at
        timestamptz updated_at
    }

    users {
        uuid id PK
        text email
        jsonb raw_user_meta_data "contains role: admin"
    }
```

# Entity Relationship Diagram

## Core Content Entities
- **authors** → **novels** (1:N)
- **novels** → **chapters** (1:N)
- **genres** ↔ **novels** (M:N via novel_genres)

## User Interaction Entities
- **users** → **bookmarks** (1:N)
- **users** → **ratings** (1:N)
- **users** → **reading_progress** (1:N)
- **users** → **chapter_views** (1:N)

## Key Relationships

### 1. Hierarchical Genres
```
genres.parent_id → genres.id (self-referencing)
Example: Fantasy → Xuanhuan → Dongxuan
```

### 2. Denormalized View Tracking
```
chapter_views (raw data, high volume)
        ↓ (aggregated periodically)
chapters.view_count
novels.view_count_daily/weekly/total
```

### 3. Auto-updated Aggregates
```
ratings → trigger → novels.rating_average, rating_count
bookmarks → trigger → novels.bookmark_count
chapters → trigger → novels.total_chapters, total_words
```

## Index Strategy

### SEO Routing Indexes
```sql
novels.slug (UNIQUE)
chapters(novel_id, slug) (UNIQUE)
authors.slug (UNIQUE)
genres.slug (UNIQUE)
```

### Trending/Ranking Indexes (Composite)
```sql
novels(view_count_daily DESC, rating_average DESC)
novels(view_count_weekly DESC, rating_average DESC)
novels(view_count_total DESC, rating_average DESC)
novels(rating_average DESC, rating_count DESC)
```

### Anti-Duplicate Indexes
```sql
novels.normalized_title (exact match)
novels.normalized_title gin_trgm_ops (fuzzy match)
novels.source_url (UNIQUE WHERE NOT NULL)
chapters(novel_id, content_hash) (duplicate content)
```

### Performance Indexes
```sql
novels.author_id (author's novels)
novels(is_published, published_at DESC) (latest published)
chapters(novel_id, chapter_number) (chapter list)
chapter_views(chapter_id, viewed_at DESC) (view history)
```

## Security Model (RLS)

### Anonymous Users
- ✅ Read published novels/chapters
- ✅ Insert chapter_views (tracking)
- ❌ No bookmarks/ratings/progress

### Authenticated Users
- ✅ Everything anonymous can do
- ✅ Create/update/delete own bookmarks
- ✅ Create/update/delete own ratings
- ✅ Create/update/delete own reading_progress
- ❌ Cannot modify others' data

### Admin Users
- ✅ Full CRUD on all content tables
- ✅ Read all user interaction data
- ✅ Identified via JWT: raw_user_meta_data->>'role' = 'admin'

## Performance Characteristics

### Fast Operations (< 10ms)
- Novel/chapter lookup by slug
- User's bookmarks list
- User's reading progress
- Trending novels (using composite indexes)

### Batched Operations (runs periodically)
- View count aggregation (every 10-15 min)
- Rating average updates (on change via trigger)
- Materialized view refresh (every 15-30 min)

### Maintenance Operations (scheduled)
- Daily view count reset (daily at 00:00)
- Weekly view count reset (Monday 00:00)
- Old view cleanup (daily at 02:00)
