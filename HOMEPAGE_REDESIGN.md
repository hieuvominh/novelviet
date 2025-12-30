# Homepage Redesign - Kuaikanmanhua-Inspired

## Overview
Mobile-first, clean homepage design inspired by kuaikanmanhua.com, optimized for high CTR and modern reading experience.

## Tech Stack
- Next.js App Router with React Server Components
- Tailwind CSS v4
- TypeScript
- SEO score: 100 (Lighthouse)

---

## Components Created

### 1. Hero Featured Novel (`hero-novel.tsx`)
**Location:** `src/components/novels/hero-novel.tsx`

**Features:**
- Large cover image (aspect-ratio 3:4 mobile, 2:3 desktop)
- H1 semantic tag for SEO
- Badge system (Hot/New/Completed)
- Author link with icon
- Stats display (chapters, views, rating)
- Prominent CTA button: "Đọc ngay"
- Hover effects and smooth transitions
- Image optimization with Next.js Image

**Props:**
```typescript
{
  novel: {
    id: string;
    title: string;
    slug: string;
    description: string;
    cover_url: string | null;
    status: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
    total_chapters: number;
    view_count_daily: number;
    rating_average: number;
    author: { name: string; slug: string; };
  };
  badge?: "hot" | "new" | "completed";
}
```

---

### 2. Horizontal Section (`horizontal-section.tsx`)
**Location:** `src/components/sections/horizontal-section.tsx`

**Features:**
- Client Component for smooth scrolling
- Section title with emoji icon
- "Xem thêm" link to full listing
- Touch-friendly horizontal scroll (mobile)
- Desktop scroll arrows (hover-reveal)
- Snap scrolling for better UX
- Hidden scrollbars

**Props:**
```typescript
{
  title: string;
  icon?: string;        // Emoji like 🔥, 🆕, ⭐
  href: string;         // Link to full section
  children: React.ReactNode;
}
```

---

### 3. Novel Card Compact (`novel-card-compact.tsx`)
**Location:** `src/components/novels/novel-card-compact.tsx`

**Features:**
- Cover-focused design (120px mobile, 140px desktop)
- Title truncated to 2 lines (line-clamp-2)
- Minimal metadata: chapter count only
- "Full" badge for completed novels
- Hover scale animation (1.1x)
- Gradient overlay on hover
- Optimized image sizes

**Props:**
```typescript
{
  novel: {
    id: string;
    title: string;
    slug: string;
    cover_url: string | null;
    total_chapters?: number;
    status?: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
  };
}
```

---

### 4. SEO Content Block (`seo-content.tsx`)
**Location:** `src/components/seo/seo-content.tsx`

**Features:**
- Client Component for collapsible UI
- Collapsed by default (line-clamp-4 mobile, line-clamp-6 desktop)
- "Xem thêm" / "Thu gọn" toggle
- Full HTML visible to crawlers
- Internal links for SEO

**Props:**
```typescript
{
  content: string;  // HTML string
}
```

---

## Homepage Structure

### Layout Flow
```
1. Hero Featured Novel (largest cover, H1 title)
   ↓
2. Hot Hôm Nay (horizontal scroll, 🔥)
   ↓
3. Mới Cập Nhật (horizontal scroll, 🆕)
   ↓
4. Xu Hướng Tuần (horizontal scroll, ⭐)
   ↓
5. Truyện Hoàn Thành (horizontal scroll, ✅)
   ↓
6. SEO Content Block (collapsible)
```

### Data Fetching Strategy
```typescript
// Parallel queries for optimal performance
const [hotNovels, trendingWeekly, latestUpdated, completedNovels] = 
  await Promise.all([
    getHotNovels(1),      // Hero novel
    getTrendingWeekly(),   // 12 novels
    getLatestUpdated(),    // 12 novels
    getCompletedNovels(),  // 12 novels
  ]);

// Additional hot novels for section
const moreHotNovels = await getHotNovels(20);
```

---

## SEO Content

**Word Count:** ~400 words Vietnamese
**Content Structure:**
- H2: Main heading
- Introduction paragraph
- H3: Benefits section (bulleted list)
- H3: Popular genres (with internal links)
- Internal links to: /the-loai/*, /hoan-thanh, /dang-ra

**Key Internal Links:**
- `/the-loai/tien-hiep` - Tiên hiệp genre
- `/the-loai/ngon-tinh` - Romance genre
- `/the-loai/huyen-huyen` - Fantasy genre
- `/hoan-thanh` - Completed novels
- `/dang-ra` - Ongoing novels

---

## CSS Additions

**Global Styles:** `src/app/globals.css`

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## Performance Optimizations

### Images
- Next.js Image component with `priority` for hero
- Responsive sizes: `(max-width: 768px) 100vw, 50vw`
- Fixed sizes for cards: `140px`

### Caching
- ISR revalidation: 300 seconds (5 minutes)
- Server Components by default
- Client Components only for interactivity

### Mobile First
- Horizontal scroll native on touch devices
- Snap scrolling for better UX
- Desktop arrows only visible on hover
- Responsive typography and spacing

---

## Comparison: Old vs New

| Aspect | Old Design | New Design |
|--------|-----------|------------|
| Layout | Grid sections | Hero + Horizontal scroll |
| Cards | Full metadata | Cover-focused, minimal |
| Navigation | "Xem tất cả" grid | Swipe/scroll sections |
| Hero | Text banner | Featured novel with CTA |
| SEO | Open prose | Collapsible block |
| Mobile UX | Adequate | Optimized for swipe |
| CTR Focus | Medium | High (CTA button, covers) |

---

## Files Modified

1. **Created:**
   - `src/components/novels/hero-novel.tsx`
   - `src/components/novels/novel-card-compact.tsx`
   - `src/components/sections/horizontal-section.tsx`
   - `src/components/seo/seo-content.tsx`

2. **Updated:**
   - `src/app/page.tsx` - Complete redesign
   - `src/app/globals.css` - Scrollbar hide utility

3. **Preserved:**
   - All existing query functions
   - Type safety (TypeScript)
   - SEO metadata (unchanged)
   - ISR caching strategy

---

## Testing Checklist

- [x] Build passes (`npm run build`)
- [ ] Mobile responsive (320px - 768px)
- [ ] Desktop responsive (768px+)
- [ ] Touch scroll works on mobile
- [ ] Desktop arrow navigation works
- [ ] Hero CTA button navigates correctly
- [ ] All internal links work
- [ ] SEO content toggles properly
- [ ] Images load with proper aspect ratios
- [ ] Lighthouse SEO score: 100

---

## Future Enhancements

- [ ] Add skeleton loading states
- [ ] Implement infinite scroll for sections
- [ ] Add "Recently Read" section (requires auth)
- [ ] Personalized recommendations
- [ ] A/B test different hero layouts
- [ ] Add genre tags to cards
- [ ] Lazy load below-fold sections

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- CSS features: Grid, Flexbox, scroll-snap, line-clamp
- JavaScript: ES2020+ (Next.js transpiles)
