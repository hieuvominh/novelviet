# 🚀 Deployment Checklist

## Before First Run

### 1. Install Dependencies
```bash
npm install @tailwindcss/typography
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Migrations
Run in Supabase SQL Editor (in order):
- [ ] `001_core_schema.sql`
- [ ] `002_functions_triggers.sql`
- [ ] `003_rls_policies.sql`
- [ ] `004_scheduled_jobs.sql`

### 4. Add Sample Data (Testing)
```sql
-- Insert test author
INSERT INTO authors (name, slug, normalized_name) 
VALUES ('Thiên Tàm Thổ Đậu', 'thien-tam-tho-dau', 'thien tam tho dau');

-- Insert test genre
INSERT INTO genres (name, slug) 
VALUES ('Tiên Hiệp', 'tien-hiep');

-- Insert test novel
INSERT INTO novels (title, slug, normalized_title, description, author_id, status, is_published)
VALUES (
  'Đấu Phá Thương Khung',
  'dau-pha-thuong-khung',
  'dau pha thuong khung',
  'Đây là câu chuyện về một thiên tài tu luyện...',
  (SELECT id FROM authors WHERE slug = 'thien-tam-tho-dau'),
  'ongoing',
  true
);

-- Insert test chapter
INSERT INTO chapters (
  novel_id,
  title,
  slug,
  chapter_number,
  content,
  normalized_title,
  is_published
) VALUES (
  (SELECT id FROM novels WHERE slug = 'dau-pha-thuong-khung'),
  'Thiên Tài Nhỏ',
  'thien-tai-nho',
  1,
  'Nội dung chương 1...',
  'thien tai nho',
  true
);
```

### 5. Build Test
```bash
npm run build
```

Fix any TypeScript errors if they appear.

---

## Testing Checklist

### Homepage (`/`)
- [ ] Hot novels section loads
- [ ] Trending weekly section loads
- [ ] Latest updated section loads
- [ ] Completed novels section loads
- [ ] All sections show 12 novels (or fewer if limited data)
- [ ] Novel cards display correctly
- [ ] Images load with placeholder fallback
- [ ] Links work

### Novel Detail Page (`/truyen/[slug]`)
- [ ] Cover image displays
- [ ] Title and author show correctly
- [ ] Status badge appears with correct color
- [ ] Genre tags are clickable
- [ ] Stats grid shows all metrics
- [ ] Description renders properly
- [ ] Chapter list displays with pagination
- [ ] Breadcrumbs work
- [ ] "Đọc từ đầu" button links to first chapter

### Chapter Reading Page (`/truyen/[slug]/chuong-[chapterNumber]`)
- [ ] Chapter content displays correctly
- [ ] Previous/Next navigation works
- [ ] Font size controls adjust text
- [ ] View counting triggers after 3 seconds
- [ ] Reading progress saves to localStorage
- [ ] Breadcrumbs work
- [ ] Back to novel link works
- [ ] Content is readable on mobile

### General
- [ ] Theme toggle switches dark/light mode
- [ ] Header navigation works
- [ ] Footer links present
- [ ] Mobile menu button appears on mobile
- [ ] All pages are responsive
- [ ] No console errors
- [ ] No TypeScript errors

---

## SEO Verification

### Metadata Check
Visit each page and check HTML source (`Ctrl+U`):
- [ ] Homepage has title and description
- [ ] Novel pages have unique titles
- [ ] Chapter pages have unique titles
- [ ] All pages have canonical URLs
- [ ] OpenGraph tags present
- [ ] Schema.org JSON-LD present

### Google Search Console (After Deployment)
- [ ] Submit sitemap
- [ ] Request indexing for key pages
- [ ] Check mobile usability
- [ ] Verify Core Web Vitals

---

## Performance Testing

### Lighthouse Audit
Run in Chrome DevTools:
- [ ] Performance score > 90
- [ ] Accessibility score = 100
- [ ] Best Practices score > 90
- [ ] SEO score = 100

### Load Testing
- [ ] Homepage loads < 2s
- [ ] Novel detail loads < 2s
- [ ] Chapter loads < 1.5s
- [ ] Images lazy-load properly
- [ ] No layout shift on load

---

## Production Deployment

### Before Deploy
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Enable Supabase RLS policies
- [ ] Configure admin user in Supabase
- [ ] Set up pg_cron for view aggregation
- [ ] Test scheduled jobs

### Deploy to Vercel
```bash
# Connect to Vercel
vercel

# Deploy
vercel --prod
```

### Post-Deploy
- [ ] Test all routes on production
- [ ] Verify database connection works
- [ ] Check view counting works
- [ ] Test on mobile devices
- [ ] Submit sitemap to Google
- [ ] Set up monitoring (Vercel Analytics)

---

## Monitoring

### What to Monitor
- [ ] Error rates (Vercel dashboard)
- [ ] Response times
- [ ] Database query performance
- [ ] View counting accuracy
- [ ] Core Web Vitals

### Regular Maintenance
- [ ] Review slow queries (weekly)
- [ ] Check scheduled job logs (weekly)
- [ ] Cleanup old chapter_views (automated via cron)
- [ ] Update dependencies (monthly)
- [ ] SEO performance review (monthly)

---

## Known Issues to Fix

### High Priority
1. [ ] Install `@tailwindcss/typography` plugin
2. [ ] Implement bookmark toggle functionality
3. [ ] Add reading progress sync for authenticated users
4. [ ] Test with large dataset (1000+ novels)

### Medium Priority
5. [ ] Add loading states for all pages
6. [ ] Implement error boundaries
7. [ ] Add 404 page customization
8. [ ] Create sitemap.xml generator

### Low Priority
9. [ ] Add keyboard shortcuts for chapter navigation
10. [ ] Implement reading mode (hide header/footer)
11. [ ] Add print styles
12. [ ] Optimize images further (WebP, AVIF)

---

## Support & Resources

### Documentation
- **FRONTEND_IMPLEMENTATION.md** - Full implementation guide
- **IMPLEMENTATION_SUMMARY.md** - Quick overview
- **supabase/DATABASE_DESIGN.md** - Database documentation
- **supabase/SETUP_GUIDE.md** - Database setup

### Quick Commands
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### Getting Help
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Tailwind Docs: https://tailwindcss.com/docs

---

**Last Updated:** 2025-12-30
**Status:** ✅ Core implementation complete, ready for testing
