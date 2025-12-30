# TruyenDoc

A modern, SEO-optimized Next.js application built with React 19, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** Next.js 16.1.1 (App Router)
- **React:** 19.2.3 with React Compiler
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (configured)
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
1. **Configure Supabase:**
   - Set up your Supabase project
   - Add credentials to `.env.local`
   - Define database schema in `src/types/database.types.ts`

2. **Update Site Config:**
   - Edit `src/config/site.ts` with your site details
   - Update SEO defaults in `src/lib/utils/seo.ts`

3. **Create UI Components:**
   - Add components to `src/components/ui/`
   - Build theme toggle component
   - Create layout components (header, footer)

4. **Build Features:**
   - Create feature directories in `src/app/`
   - Use `generateSEO()` for each page
   - Implement authentication flows

5. **Database & Auth:**
   - Create Supabase tables
   - Set up authentication
   - Define Row Level Security policies

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

---

Built with ❤️ using the latest web technologies


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
