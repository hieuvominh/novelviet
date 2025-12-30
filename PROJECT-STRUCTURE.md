# Project Structure - TruyenDoc

## Complete Folder Structure

```
truyendoc/
├── .git/                           # Git repository
├── .next/                          # Next.js build output (gitignored)
├── node_modules/                   # Dependencies (gitignored)
├── public/                         # Static assets
│   ├── favicon.ico
│   ├── next.svg
│   └── vercel.svg
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx             # Root layout with theme & SEO
│   │   ├── page.tsx               # Home page
│   │   ├── loading.tsx            # Global loading state
│   │   ├── error.tsx              # Global error boundary
│   │   ├── not-found.tsx          # 404 page
│   │   ├── robots.ts              # robots.txt generation
│   │   ├── sitemap.ts             # sitemap.xml generation
│   │   ├── globals.css            # Global Tailwind styles
│   │   └── favicon.ico            # Favicon
│   ├── components/
│   │   ├── providers/
│   │   │   └── theme-provider.tsx # Theme context provider
│   │   ├── ui/                    # (Empty - ready for UI components)
│   │   └── README.md              # Component guidelines
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   ├── server.ts          # Server Supabase client
│   │   │   └── middleware.ts      # Middleware Supabase client
│   │   ├── utils/
│   │   │   ├── index.ts           # Common utilities (cn, formatDate, etc.)
│   │   │   └── seo.ts             # SEO metadata generator
│   │   └── README.md              # Lib documentation
│   ├── hooks/
│   │   └── use-theme.ts           # Theme hook
│   ├── types/
│   │   ├── database.types.ts      # Supabase database types (template)
│   │   ├── supabase.ts            # Supabase-related types
│   │   └── index.ts               # Common types
│   ├── config/
│   │   └── site.ts                # Site metadata configuration
│   └── middleware.ts              # Next.js middleware (auth refresh)
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment (gitignored)
├── .gitignore                      # Git ignore rules
├── eslint.config.mjs              # ESLint configuration
├── next-env.d.ts                  # Next.js TypeScript declarations
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies & scripts
├── package-lock.json              # Dependency lock file
├── postcss.config.mjs             # PostCSS configuration
├── README.md                      # Project documentation
└── tsconfig.json                  # TypeScript configuration
```

---

## Key Configuration Files

### 1. **next.config.ts**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,  // React 19 Compiler enabled
};

export default nextConfig;
```

**Purpose:** Enables React Compiler for automatic optimization

---

### 2. **tsconfig.json**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // Path alias for imports
    }
  }
}
```

**Purpose:** TypeScript configuration with path aliases for cleaner imports

---

### 3. **tailwind.config.ts** (Implicit - Tailwind CSS v4)
Tailwind v4 uses CSS-based configuration via `@import "tailwindcss"` in globals.css

**Purpose:** Latest Tailwind CSS with automatic dark mode support

---

### 4. **.env.example**
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Purpose:** Template for environment variables

---

### 5. **src/middleware.ts**
```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request);  // Supabase auth refresh
}

export const config = {
  matcher: [/* Routes to apply middleware */],
};
```

**Purpose:** Refreshes Supabase auth sessions on every request

---

## Core Files Explained

### **src/app/layout.tsx**
- Root layout with ThemeProvider
- SEO metadata using generateSEO()
- Font optimization (Geist Sans & Geist Mono)
- suppressHydrationWarning for theme
- Global styles import

### **src/components/providers/theme-provider.tsx**
- Client component for theme management
- Handles: 'light', 'dark', 'system' modes
- localStorage persistence
- System preference detection
- No flash on page load

### **src/lib/supabase/***
- **client.ts** - For Client Components (`'use client'`)
- **server.ts** - For Server Components, Server Actions, Route Handlers
- **middleware.ts** - For Next.js Middleware (auth refresh)

### **src/lib/utils/seo.ts**
- generateSEO() function
- Returns Next.js Metadata object
- Includes OpenGraph, Twitter cards
- Robots meta tags
- Favicon configuration

### **src/config/site.ts**
- Centralized site metadata
- Site name, description, URLs
- Social media links
- OG image path

---

## Architectural Decisions

### ✅ **Why src/ Directory?**
- Separates source code from configuration
- Cleaner root directory
- Easier navigation
- Industry best practice

### ✅ **Why Three Supabase Clients?**
- **Browser Client:** For client-side interactions (user actions)
- **Server Client:** For server-side data fetching (optimal performance)
- **Middleware Client:** For auth session management (security)

### ✅ **Why Path Aliases (@/)?**
- Cleaner imports: `@/lib/utils` vs `../../lib/utils`
- Easier refactoring when moving files
- Better IDE autocomplete

### ✅ **Why Theme Provider?**
- SSR compatible (no flash on load)
- System preference detection
- Persistent user choice
- No external dependencies (like next-themes)

### ✅ **Why generateSEO Utility?**
- DRY principle (Don't Repeat Yourself)
- Consistent metadata across pages
- Easy to update SEO defaults
- Type-safe metadata generation

### ✅ **Why robots.ts & sitemap.ts?**
- Dynamic generation (can include DB content later)
- Automatic updates
- SEO best practices
- Type-safe configuration

---

## File Organization Best Practices

### **Components**
```
src/components/
├── providers/    # Context providers
├── ui/          # Reusable UI (buttons, inputs)
├── layouts/     # Layout components (header, footer) [create when needed]
└── features/    # Feature-specific components [create when needed]
```

### **Lib**
```
src/lib/
├── supabase/    # Database clients
├── utils/       # Utility functions
└── api/         # API utilities [create when needed]
```

### **Types**
```
src/types/
├── database.types.ts  # Generated from Supabase
├── supabase.ts        # Supabase-related types
└── index.ts           # Common/shared types
```

### **App Router**
```
src/app/
├── (auth)/          # Auth pages [create when needed]
│   ├── login/
│   └── register/
├── (marketing)/     # Marketing pages [create when needed]
│   ├── about/
│   └── contact/
└── (dashboard)/     # Protected pages [create when needed]
    └── profile/
```

---

## Environment Variables

### **NEXT_PUBLIC_*** Variables
- Exposed to browser
- Used in client components
- Can be read in `process.env.NEXT_PUBLIC_*`

### **Secret Variables** (don't use NEXT_PUBLIC_ prefix)
- Server-only
- Not exposed to browser
- For API keys, database passwords

### **Current Variables**
1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key (safe for browser)
3. `NEXT_PUBLIC_SITE_URL` - Your site URL (for SEO, redirects)

---

## Next Steps

### 1. **Configure Supabase**
- Create project at supabase.com
- Copy URL & anon key to `.env.local`
- Generate types: `npx supabase gen types typescript --project-id "your-project-ref" > src/types/database.types.ts`

### 2. **Create UI Components**
```bash
# Example structure to create:
src/components/ui/
├── button.tsx
├── input.tsx
├── card.tsx
└── theme-toggle.tsx  # Use useTheme() hook
```

### 3. **Build Layouts**
```bash
src/components/layouts/
├── header.tsx
├── footer.tsx
└── sidebar.tsx
```

### 4. **Create Pages**
- Use App Router: `src/app/your-page/page.tsx`
- Add metadata with `generateSEO()`
- Server Components by default
- Use `'use client'` when needed

### 5. **Setup Authentication**
- Use Supabase Auth
- Create login/register pages
- Protect routes in middleware
- Add user context provider

---

## Import Examples

### ✅ Good (Using Path Aliases)
```typescript
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { useTheme } from '@/hooks/use-theme';
import { siteConfig } from '@/config/site';
```

### ❌ Bad (Relative Paths)
```typescript
import { cn } from '../../lib/utils';
import { createClient } from '../../../lib/supabase/server';
```

---

## Available Scripts

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

---

## Technology Stack Summary

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 16.1.1 |
| React | React | 19.2.3 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Backend | Supabase | Latest |
| Linting | ESLint | ^9 |
| Compiler | React Compiler | 1.0.0 |

---

## SEO Features Implemented

✅ Dynamic metadata generation
✅ OpenGraph tags
✅ Twitter card tags
✅ Robots.txt (dynamic)
✅ Sitemap.xml (dynamic)
✅ Structured data ready
✅ Semantic HTML
✅ Meta descriptions
✅ Canonical URLs support

---

## Performance Features

✅ React 19 Compiler (automatic optimization)
✅ Next.js App Router (server components)
✅ Image optimization (next/image)
✅ Font optimization (next/font)
✅ Static generation ready
✅ Incremental Static Regeneration ready
✅ Tailwind CSS (utility-first, optimized)

---

## Accessibility Features

✅ Semantic HTML structure
✅ `lang` attribute on HTML
✅ Dark/light mode (system preference)
✅ Proper heading hierarchy
✅ Loading states
✅ Error boundaries
✅ 404 page

---

## Security Features

✅ TypeScript (type safety)
✅ Environment variables
✅ Supabase RLS ready
✅ CORS configured via middleware
✅ Auth session refresh
✅ Secure cookie handling

---

**Project initialized successfully! 🎉**
