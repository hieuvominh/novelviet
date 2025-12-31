# Admin CMS Row Level Security Guide

## Overview

This guide covers the RLS implementation for the Admin CMS with role-based access control.

## Security Model

### Access Levels

| User Type | Access |
|-----------|--------|
| **Anonymous** | ❌ No access (all public data fetched server-side with service role) |
| **Editor** | ✅ SELECT, INSERT, UPDATE on all content tables |
| **Admin** | ✅ Full CRUD on all tables |

### Tables Protected by RLS

- ✅ `novels`
- ✅ `chapters`
- ✅ `authors`
- ✅ `genres`
- ✅ `novel_genres`
- ✅ `profiles`

---

## 1. Client-Side Mutations (Editor/Admin)

### Setup Authenticated Client

```typescript
// lib/supabase/admin-client.ts
import { createClient } from '@/lib/supabase/client';

export async function getAdminClient() {
  const supabase = createClient();
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  
  // Verify user has admin/editor role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return supabase;
}
```

### INSERT Novel (Editor/Admin)

```typescript
// Editor or Admin can insert
const supabase = await getAdminClient();

const { data, error } = await supabase
  .from('novels')
  .insert({
    title: 'New Novel Title',
    slug: 'new-novel-slug',
    author_id: 'uuid-here',
    status: 'draft',
    is_published: false,
    description: 'Novel description...'
  })
  .select()
  .single();

if (error) {
  console.error('Error inserting novel:', error);
  throw error;
}

return data;
```

### UPDATE Novel (Editor/Admin)

```typescript
// Editor or Admin can update
const supabase = await getAdminClient();

const { data, error } = await supabase
  .from('novels')
  .update({
    title: 'Updated Title',
    status: 'ongoing',
    is_published: true
  })
  .eq('id', novelId)
  .select()
  .single();

if (error) {
  console.error('Error updating novel:', error);
  throw error;
}

return data;
```

### DELETE Novel (Admin Only)

```typescript
// Only Admin can delete
const supabase = await getAdminClient();

const { error } = await supabase
  .from('novels')
  .delete()
  .eq('id', novelId);

if (error) {
  // Will fail with RLS error if user is not admin
  console.error('Error deleting novel:', error);
  throw error;
}
```

### INSERT Chapter (Editor/Admin)

```typescript
const supabase = await getAdminClient();

const { data, error } = await supabase
  .from('chapters')
  .insert({
    novel_id: novelId,
    chapter_number: 1,
    title: 'Chapter 1: Beginning',
    slug: 'chuong-1',
    content: 'Chapter content...',
    word_count: 2500,
    is_published: false
  })
  .select()
  .single();

if (error) throw error;
return data;
```

### UPDATE Chapter (Editor/Admin)

```typescript
const supabase = await getAdminClient();

const { data, error } = await supabase
  .from('chapters')
  .update({
    content: 'Updated content...',
    word_count: 3000,
    is_published: true,
    published_at: new Date().toISOString()
  })
  .eq('id', chapterId)
  .select()
  .single();

if (error) throw error;
return data;
```

### Bulk Operations with Transactions

```typescript
const supabase = await getAdminClient();

// Insert author and novel in transaction
const { data: author, error: authorError } = await supabase
  .from('authors')
  .insert({
    name: 'Author Name',
    slug: 'author-slug',
    bio: 'Author bio...'
  })
  .select()
  .single();

if (authorError) throw authorError;

const { data: novel, error: novelError } = await supabase
  .from('novels')
  .insert({
    title: 'Novel Title',
    slug: 'novel-slug',
    author_id: author.id,
    status: 'draft',
    is_published: false
  })
  .select()
  .single();

if (novelError) throw novelError;

// Add genres
const { error: genresError } = await supabase
  .from('novel_genres')
  .insert([
    { novel_id: novel.id, genre_id: 'genre-uuid-1' },
    { novel_id: novel.id, genre_id: 'genre-uuid-2' }
  ]);

if (genresError) throw genresError;
```

---

## 2. Server-Side Public Queries (Service Role)

### Setup Service Role Client

```typescript
// lib/supabase/service.ts
import { createClient } from '@supabase/supabase-js';

// NEVER expose service role key to client
export function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
```

### Fetch Published Novels (Public)

```typescript
// app/api/novels/route.ts
import { getServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = getServiceClient();
  
  // Bypasses RLS - can read all data
  const { data, error } = await supabase
    .from('novels')
    .select(`
      id,
      title,
      slug,
      description,
      cover_url,
      status,
      view_count_total,
      rating_average,
      authors (
        id,
        name,
        slug
      )
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(20);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ novels: data });
}
```

### Fetch Single Novel with Chapters (Public)

```typescript
// app/api/novels/[slug]/route.ts
import { getServiceClient } from '@/lib/supabase/service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getServiceClient();
  
  // Get novel
  const { data: novel, error: novelError } = await supabase
    .from('novels')
    .select(`
      id,
      title,
      slug,
      description,
      cover_url,
      status,
      total_chapters,
      view_count_total,
      rating_average,
      authors (
        id,
        name,
        slug,
        bio
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
    
  if (novelError) {
    return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
  }
  
  // Get chapters
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('id, chapter_number, title, slug, is_published, created_at')
    .eq('novel_id', novel.id)
    .eq('is_published', true)
    .order('chapter_number', { ascending: true });
    
  if (chaptersError) {
    return NextResponse.json({ error: chaptersError.message }, { status: 500 });
  }
  
  return NextResponse.json({
    novel: {
      ...novel,
      chapters
    }
  });
}
```

### Server-Side Component (Direct Query)

```typescript
// app/truyen/[slug]/page.tsx
import { getServiceClient } from '@/lib/supabase/service';

export default async function NovelPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getServiceClient();
  
  const { data: novel } = await supabase
    .from('novels')
    .select(`
      *,
      authors (*),
      genres:novel_genres(
        genres (*)
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
    
  if (!novel) {
    notFound();
  }
  
  return (
    <div>
      <h1>{novel.title}</h1>
      <p>by {novel.authors.name}</p>
    </div>
  );
}
```

---

## 3. Testing RLS Policies

### Test Editor Permissions

```sql
-- Set session to simulate editor user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'editor-user-uuid';

-- Should succeed: SELECT
SELECT * FROM novels;

-- Should succeed: INSERT
INSERT INTO novels (title, slug, author_id, status, is_published)
VALUES ('Test Novel', 'test-slug', 'author-uuid', 'draft', false);

-- Should succeed: UPDATE
UPDATE novels SET title = 'Updated' WHERE id = 'novel-uuid';

-- Should fail: DELETE (only admin can delete)
DELETE FROM novels WHERE id = 'novel-uuid';
-- ERROR: new row violates row-level security policy
```

### Test Admin Permissions

```sql
-- Set session to simulate admin user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'admin-user-uuid';

-- Should succeed: All operations
SELECT * FROM novels;
INSERT INTO novels (...) VALUES (...);
UPDATE novels SET ... WHERE ...;
DELETE FROM novels WHERE id = 'novel-uuid'; -- ✅ Success
```

### Test Anonymous User

```sql
-- Reset session
RESET ROLE;

-- Should return 0 rows (RLS blocks access)
SELECT * FROM novels;

-- Should fail: INSERT
INSERT INTO novels (...) VALUES (...);
-- ERROR: new row violates row-level security policy
```

---

## 4. Role Management

### Create Admin User

```typescript
// lib/admin/create-admin.ts
import { getServiceClient } from '@/lib/supabase/service';

export async function createAdminUser(email: string, password: string) {
  const supabase = getServiceClient();
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (authError) throw authError;
  
  // Create profile with admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'admin'
    });
    
  if (profileError) throw profileError;
  
  return authData.user;
}
```

### Create Editor User

```typescript
export async function createEditorUser(email: string, password: string) {
  const supabase = getServiceClient();
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  
  if (authError) throw authError;
  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'editor'
    });
    
  if (profileError) throw profileError;
  
  return authData.user;
}
```

### Check User Role

```typescript
export async function getUserRole(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error) return null;
  return data.role as 'admin' | 'editor';
}
```

---

## 5. Security Best Practices

### ✅ DO

- Use service role for all public-facing queries
- Verify user role on every admin action
- Use typed Supabase client with RLS
- Test RLS policies thoroughly
- Keep service role key secret (never in client code)
- Use EXISTS subqueries in RLS policies
- Create indexes on `profiles.role` for performance

### ❌ DON'T

- Don't expose service role key to client
- Don't create anon policies on admin tables
- Don't use `auth.role()` (use `public.profiles.role`)
- Don't bypass RLS unless necessary
- Don't store sensitive data without encryption
- Don't trust client-side role checks alone

---

## 6. Common Issues

### Issue: "new row violates row-level security policy"

**Cause**: User doesn't have required role or not authenticated

**Solution**:
```typescript
// Check authentication and role
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Not authenticated');

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (!profile || !['admin', 'editor'].includes(profile.role)) {
  throw new Error('Insufficient permissions');
}
```

### Issue: Service role queries not working

**Cause**: Using wrong Supabase client

**Solution**:
```typescript
// Use service role client for server-side public queries
import { getServiceClient } from '@/lib/supabase/service';
const supabase = getServiceClient(); // ✅ Correct

// Don't use regular client for public data
import { createClient } from '@/lib/supabase/client';
const supabase = createClient(); // ❌ Wrong (RLS applies)
```

### Issue: Editor can't delete but should be able to

**Solution**: Change policy or clarify requirements. Current design: only admins can delete.

---

## 7. Performance Optimization

### Index for RLS Queries

```sql
-- Speed up role checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Speed up common queries
CREATE INDEX IF NOT EXISTS idx_novels_published ON novels(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_novel ON chapters(novel_id, chapter_number);
```

### Use Helper Functions

```sql
-- Cached role check function
CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

---

## Summary

- ✅ RLS enabled on all admin tables
- ✅ No anonymous access to admin data
- ✅ Role-based policies (Editor: CUD, Admin: CRUD)
- ✅ Service role for public queries
- ✅ Helper functions for role checks
- ✅ Comprehensive examples provided
