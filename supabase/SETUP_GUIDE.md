# 🚀 Supabase Database Setup Guide

## Step-by-Step Setup Instructions

### 1. Prerequisites

- ✅ Supabase project created at [supabase.com](https://supabase.com)
- ✅ Project URL and anon key added to `.env.local`
- ✅ Supabase CLI installed (optional): `npm install -g supabase`

---

### 2. Run Migrations

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project → **SQL Editor**
2. Execute migrations **in order**:

**Migration 1: Core Schema**
```
📁 supabase/migrations/001_core_schema.sql
```
- Copy entire file content
- Paste into SQL Editor
- Click **Run**

**Migration 2: Functions & Triggers**
```
📁 supabase/migrations/002_functions_triggers.sql
```
- Copy entire file content
- Paste into SQL Editor
- Click **Run**

**Migration 3: RLS Policies**
```
📁 supabase/migrations/003_rls_policies.sql
```
- Copy entire file content
- Paste into SQL Editor
- Click **Run**

**Migration 4: Scheduled Jobs** (Optional - requires Supabase Pro)
```
📁 supabase/migrations/004_scheduled_jobs.sql
```
- Skip if not on Pro plan
- Use alternative external scheduler (see below)

#### Option B: Using Supabase CLI

```bash
# Link to remote project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push
```

---

### 3. Set Up Admin User

**After creating your first user via Supabase Auth Dashboard:**

```sql
-- Method 1: Using user metadata (Recommended)
UPDATE auth.users SET
    raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin-email@example.com';
```

**Verify admin role:**
```sql
SELECT 
    email, 
    raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'your-admin-email@example.com';
```

---

### 4. Configure Scheduled Jobs

#### Option A: Using Supabase pg_cron (Pro Plan)

Already configured in `004_scheduled_jobs.sql`. Verify jobs are running:

```sql
-- Check scheduled jobs
SELECT * FROM cron.job;

-- Check job history
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

#### Option B: Using External Scheduler (Free Plan Compatible)

**Create API routes in your Next.js app:**

**File: `app/api/cron/aggregate-views/route.ts`**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('aggregate_chapter_views');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, timestamp: new Date().toISOString() });
}
```

**File: `app/api/cron/reset-daily/route.ts`**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('reset_daily_view_counts');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
```

**File: `app/api/cron/cleanup/route.ts`**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: deleted, error } = await supabase.rpc('cleanup_old_chapter_views');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, deleted_rows: deleted });
}
```

**Add to `.env.local`:**
```env
CRON_SECRET=your-random-secret-key-here
```

**Configure Vercel Cron (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/aggregate-views",
      "schedule": "*/10 * * * *"
    },
    {
      "path": "/api/cron/reset-daily",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Or use GitHub Actions (.github/workflows/cron.yml):**
```yaml
name: Scheduled Tasks
on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
    - cron: '0 0 * * *'     # Daily at midnight
    - cron: '0 2 * * *'     # Daily at 2 AM

jobs:
  aggregate_views:
    runs-on: ubuntu-latest
    if: github.event.schedule == '*/10 * * * *'
    steps:
      - name: Aggregate Views
        run: |
          curl -X GET https://yoursite.com/api/cron/aggregate-views \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  reset_daily:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 0 * * *'
    steps:
      - name: Reset Daily Counts
        run: |
          curl -X GET https://yoursite.com/api/cron/reset-daily \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  cleanup:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 2 * * *'
    steps:
      - name: Cleanup Old Views
        run: |
          curl -X GET https://yoursite.com/api/cron/cleanup \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

### 5. Seed Sample Data (Optional)

**Create test data for development:**

```sql
-- Insert sample author
INSERT INTO authors (name, bio) VALUES
('Thiên Tằm Thổ Đậu', 'Famous author of Battle Through the Heavens'),
('Đường Gia Tam Thiếu', 'Author of Soul Land series');

-- Get author IDs
SELECT id, name FROM authors;

-- Insert sample genres
INSERT INTO genres (name, name_vi, description) VALUES
('Fantasy', 'Huyền Huyễn', 'Fantasy novels with magic and adventure'),
('Cultivation', 'Tu Tiên', 'Eastern cultivation novels'),
('Romance', 'Ngôn Tình', 'Romantic stories');

-- Get genre IDs
SELECT id, name FROM genres;

-- Insert sample novel (replace author_id with actual UUID)
INSERT INTO novels (
    title, 
    description, 
    author_id,
    status,
    is_published
) VALUES (
    'Đấu Phá Thương Khung',
    'Câu chuyện về Tiêu Viêm trên con đường tu luyện từ phế vật trở thành cao thủ.',
    'author-uuid-here', -- Replace with actual author ID
    'completed',
    true
);

-- Get novel ID
SELECT id, title FROM novels;

-- Link novel to genres (replace IDs)
INSERT INTO novel_genres (novel_id, genre_id) VALUES
('novel-uuid-here', 'genre-uuid-here');

-- Insert sample chapters (replace novel_id)
INSERT INTO chapters (
    novel_id,
    title,
    chapter_number,
    content,
    is_published
) VALUES
('novel-uuid-here', 'Thiên Tài Chuyển Thành Phế Vật', 1, 'Nội dung chương 1...', true),
('novel-uuid-here', 'Gặp Dược Lão', 2, 'Nội dung chương 2...', true),
('novel-uuid-here', 'Giới Thiệu Đấu Khí', 3, 'Nội dung chương 3...', true);
```

---

### 6. Verify Setup

**Test queries:**

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- authors, genres, novels, novel_genres, chapters, chapter_views,
-- bookmarks, reading_progress, ratings

-- Check functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Test slug generation
SELECT slugify('Đấu Phá Thương Khung');
-- Expected: dau-pha-thuong-khung

-- Test normalize function
SELECT normalize_text('Thiên Tằm Thổ Đậu');
-- Expected: thien tam tho dau

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
-- All should have rowsecurity = true

-- Test view recording
SELECT record_chapter_view(
    'chapter-uuid-here'::uuid,
    'novel-uuid-here'::uuid,
    NULL,
    'test-session-123',
    NULL
);
-- Should return true
```

---

### 7. Update TypeScript Types

The types are already configured in `src/types/database.types.ts`. To regenerate:

```bash
npx supabase gen types typescript --project-id "your-project-ref" > src/types/database.types.ts
```

---

### 8. Configure Environment Variables

Ensure `.env.local` has:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cron Secret (for scheduled jobs)
CRON_SECRET=generate-random-secret-here
```

---

## Maintenance Checklist

### Daily Tasks (Automated)
- ✅ Aggregate chapter views
- ✅ Reset daily view counts (midnight)
- ✅ Cleanup old chapter_views (2 AM)

### Weekly Tasks (Automated)
- ✅ Reset weekly view counts (Monday)

### Monthly Tasks (Manual)
- 🔍 Review database size and performance
- 🔍 Check slow queries
- 🔍 Verify indexes are being used
- 🔍 Archive old data if needed

### Monitoring Queries

**Check table sizes:**
```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

**Check pending view aggregations:**
```sql
SELECT 
    COUNT(*) AS pending_views,
    MIN(viewed_at) AS oldest_view
FROM chapter_views
WHERE viewed_at >= NOW() - INTERVAL '15 minutes';
```

**Check slow queries:**
```sql
SELECT
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Troubleshooting

### Issue: RLS blocking admin operations

**Solution:**
```sql
-- Verify admin role is set
SELECT raw_user_meta_data->>'role' FROM auth.users WHERE email = 'admin@example.com';

-- If NULL, set it:
UPDATE auth.users SET
    raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

### Issue: Slugs not generating

**Solution:**
```sql
-- Check if triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Manually generate slug if needed:
UPDATE novels SET slug = generate_unique_slug(title, 'novels', id) WHERE slug IS NULL;
```

### Issue: View counts not updating

**Solution:**
```sql
-- Manually run aggregation
SELECT aggregate_chapter_views();

-- Check if cron job is running (if using pg_cron)
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

---

## Next Steps

1. ✅ Migrations applied
2. ✅ Admin user configured
3. ✅ Scheduled jobs set up
4. ✅ Sample data inserted (optional)
5. 🔜 Build crawler to populate novels/chapters
6. 🔜 Implement frontend with anti-duplicate checks
7. 🔜 Set up monitoring and alerts

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Documentation](./DATABASE_DESIGN.md)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**Setup complete! Your database is ready for development.** 🎉
