# Lib Directory

## Structure
- `supabase/` - Supabase client configurations
  - `client.ts` - Browser client
  - `server.ts` - Server client
  - `middleware.ts` - Middleware client
- `utils/` - Utility functions
  - `index.ts` - Common utilities (cn, formatDate, etc.)
  - `seo.ts` - SEO metadata generation

## Usage
Import utilities using path aliases:
```typescript
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
```
