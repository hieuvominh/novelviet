# TruyenDoc

A modern, SEO-optimized Next.js application built with React 19, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **React:** 19.2.3 with React Compiler
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Database:** PostgreSQL with pg_cron, pg_trgm extensions
- **Linting:** ESLint

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with SEO & theme
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── providers/         # Context providers (Theme, etc.)
│   ├── ui/               # Reusable UI components
│   └── README.md         # Component guidelines
├── lib/                   # Core utilities
│   ├── supabase/         # Supabase clients (server, client, middleware)
│   ├── utils/            # Utility functions (cn, seo, etc.)
│   └── README.md         # Lib documentation
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
│   ├── database.types.ts # Supabase database types
│   ├── supabase.ts       # Supabase-related types
│   └── index.ts          # Common types
├── config/               # App configuration
│   └── site.ts          # Site metadata config
└── middleware.ts         # Next.js middleware (Supabase auth)
```

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🎨 Features

### ✅ Already Configured
- **React 19 & React Compiler** - Latest React features with automatic optimization
- **Next.js App Router** - Modern routing with layouts and server components
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Utility-first CSS with dark mode support
- **SEO Optimization** - Metadata generation utilities
- **Dark/Light Mode** - Theme system with system preference detection
- **Supabase Integration** - Server & client configurations ready
- **Path Aliases** - `@/*` imports configured
- **ESLint** - Code quality and consistency

### 📦 Supabase Setup
Three client configurations are ready:
- **Browser Client** (`@/lib/supabase/client`) - For Client Components
- **Server Client** (`@/lib/supabase/server`) - For Server Components & Actions
- **Middleware** (`@/lib/supabase/middleware`) - Auth session management

### 🌙 Theme System
Dark/light mode is configured without UI components:
```tsx
'use client';
import { useTheme } from '@/hooks/use-theme';

export function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // theme: 'light' | 'dark' | 'system'
  // resolvedTheme: 'light' | 'dark'
}
```

### 🔍 SEO Configuration
Use the `generateSEO` utility for page metadata:
```tsx
import { generateSEO } from '@/lib/utils/seo';

export const metadata = generateSEO({
  title: 'Page Title',
  description: 'Page description',
  url: '/page-path',
});
```

## 🏗️ Architecture Decisions

### 1. **src/ Directory Structure**
- Separates source code from config files
- Cleaner root directory
- Better organization for scaling

### 2. **Server & Client Separation**
- Dedicated Supabase clients for different contexts
- Follows Next.js 13+ best practices
- Optimizes performance and security

### 3. **Path Aliases**
- `@/*` maps to `src/*`
- Cleaner imports
- Easier refactoring

### 4. **Type Safety**
- Comprehensive TypeScript types
- Supabase database types structure
- Type-safe metadata generation

### 5. **SEO-First Approach**
- Centralized metadata configuration
- OpenGraph & Twitter cards ready
- Robots.txt directives included

### 6. **Theme System**
- Server-side rendering compatible
- System preference detection
- LocalStorage persistence
- No flash on load (suppressHydrationWarning)

### 7. **Utility Functions**
- Class merging with `cn()` (clsx + tailwind-merge)
- Common formatting functions
- Reusable across the app

### 8. **Middleware Configuration**
- Supabase auth session refresh
- Protects routes (commented examples)
- Cookie management

## 📝 Configuration Files

### Key Files Created
- `.env.example` - Environment variables template
- `.env.local` - Local environment (gitignored)
- `src/middleware.ts` - Auth & routing middleware
- `src/config/site.ts` - Site-wide configuration
- `src/lib/utils/seo.ts` - SEO metadata generator
- `src/components/providers/theme-provider.tsx` - Theme management

### Next.js Configuration
- **React Compiler:** Enabled (`reactCompiler: true`)
- **Tailwind CSS v4:** Latest version with PostCSS
- **ESLint:** Configured with Next.js defaults

## 🚦 Next Steps

### Recommended Order:
1. **Setup Database:**
   - Review `supabase/DATABASE_DESIGN.md` for complete schema documentation
   - Follow `supabase/SETUP_GUIDE.md` to apply migrations
   - Run migrations in order: `001_core_schema.sql` → `002_functions_triggers.sql` → `003_rls_policies.sql` → `004_scheduled_jobs.sql`
   - Configure admin user as documented in setup guide

2. **Configure Environment:**
   - Set up your Supabase project credentials in `.env.local`
   - Database types are already generated in `src/types/database.types.ts`
   - Update `src/config/site.ts` with your site details

3. **Build Features:**
   - Create novel listing page with SEO-optimized slugs
   - Implement chapter reading pages
   - Add search with trigram fuzzy matching
   - Build admin CMS using RLS policies
   - Implement view counting (automatic via triggers)

4. **Implement Crawler:**
   - Use anti-duplicate functions from migration 002
   - Check `normalize_text()` before inserting novels
   - Verify `content_hash` to detect duplicate chapters
   - Follow crawling examples in DATABASE_DESIGN.md

5. **Performance Optimization:**
   - Monitor materialized view refresh (novel_statistics)
   - Review scheduled job performance in 004_scheduled_jobs.sql
   - Optimize indexes based on query patterns

## 📊 Database Architecture

The application uses a comprehensive PostgreSQL schema designed for:
- **SEO-first approach:** Slug-based routing with anti-collision
- **High performance:** Optimized view counting with batch aggregation
- **Anti-duplicate:** 4-layer duplicate detection (constraints, normalized text, fuzzy match, content hash)
- **Security:** Row Level Security with 3-tier access (anonymous, authenticated, admin)

### Key Tables:
- `authors` - Author profiles with SEO slugs
- `novels` - Novel metadata with denormalized statistics
- `chapters` - Chapter content with automatic slug generation
- `genres` - Hierarchical genre taxonomy
- `chapter_views` - High-volume view tracking (batched)
- `bookmarks`, `reading_progress`, `ratings` - User interactions

See `supabase/README.md` for complete database documentation and `supabase/ER_DIAGRAM.md` for visual schema.

## 🧪 Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Project Documentation](./supabase/README.md) - Database design overview
- [Setup Guide](./supabase/SETUP_GUIDE.md) - Step-by-step implementation
- [ER Diagram](./supabase/ER_DIAGRAM.md) - Visual schema reference

## 🗂️ Documentation

- **Database Design:** See `supabase/DATABASE_DESIGN.md` for comprehensive schema documentation (6,500+ words)
- **Setup Guide:** Follow `supabase/SETUP_GUIDE.md` for step-by-step migration instructions
- **ER Diagram:** Visual reference in `supabase/ER_DIAGRAM.md`
- **Project Structure:** Details in `PROJECT-STRUCTURE.md`

---

Built with ❤️ for Vietnamese novel readers


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
