# Admin Auth Implementation Guide

## ✅ Implementation Complete

The Admin CMS now uses real Supabase authentication with role-based access control.

---

## 🔐 Authentication Flow

1. User visits `/admin/login`
2. Enters email + password
3. `signInWithPassword()` authenticates with Supabase Auth
4. System fetches `profiles` table to check role
5. If role is `admin` or `editor` → access granted
6. If role missing or invalid → sign out + show error
7. Session persists across page reloads

---

## 📁 Files Modified

### New Files
- **`src/lib/auth/admin-auth.ts`** - Auth helper functions

### Updated Files
- **`src/app/admin/login/page.tsx`** - Real auth with loading/error states
- **`src/components/admin/admin-layout.tsx`** - Session guard with auth state subscription
- **`src/components/admin/admin-header.tsx`** - Real logout + user role display

---

## 🚀 Creating Admin Users

### Option 1: Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → Authentication → Users
2. Click **"Add user"** → **"Create new user"**
3. Enter email and password
4. Click **"Create user"**
5. Copy the user's UUID
6. Go to **Table Editor** → **profiles** table
7. Click **"Insert"** → **"Insert row"**
8. Fill in:
   - `id`: Paste the UUID from step 5
   - `role`: Select `admin` or `editor`
9. Click **"Save"**

### Option 2: SQL Editor

```sql
-- Step 1: Create auth user (replace email/password)
-- This needs to be done via Dashboard or Admin API

-- Step 2: Create profile (replace UUID with the auth.users.id)
INSERT INTO public.profiles (id, role)
VALUES ('AUTH_USER_UUID_HERE', 'admin');
```

### Option 3: Server-Side Script (One-time setup)

```typescript
// scripts/create-admin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin(email: string, password: string) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    return;
  }

  console.log('✅ Auth user created:', authData.user.id);

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'admin'
    });

  if (profileError) {
    console.error('Error creating profile:', profileError);
    return;
  }

  console.log('✅ Admin profile created');
  console.log(`Email: ${email}`);
  console.log(`User ID: ${authData.user.id}`);
}

// Usage
createAdmin('admin@example.com', 'secure-password-here');
```

---

## 🔑 Auth Helper Functions

### `signIn(email, password)`
Signs in user and validates role. Throws error if access denied.

```typescript
import { signIn } from '@/lib/auth/admin-auth';

try {
  const { user, profile, session } = await signIn(email, password);
  console.log('Signed in as:', profile.role);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### `signOut()`
Signs out current user.

```typescript
import { signOut } from '@/lib/auth/admin-auth';

await signOut();
```

### `getCurrentUser()`
Gets current user with profile. Returns `null` if not authenticated.

```typescript
import { getCurrentUser } from '@/lib/auth/admin-auth';

const user = await getCurrentUser();
if (user) {
  console.log('Role:', user.profile.role);
  console.log('Email:', user.user.email);
}
```

### `isAuthenticated()`
Checks if user is authenticated with valid role.

```typescript
import { isAuthenticated } from '@/lib/auth/admin-auth';

const authenticated = await isAuthenticated();
if (!authenticated) {
  redirect('/admin/login');
}
```

### `isAdmin()` / `isEditor()`
Role-specific checks.

```typescript
import { isAdmin, isEditor } from '@/lib/auth/admin-auth';

if (await isAdmin()) {
  // Show delete buttons
}

if (await isEditor()) {
  // Show edit UI
}
```

---

## 🛡️ Route Protection Example

### Server Component

```typescript
// app/admin/novels/page.tsx
import { getCurrentUser } from '@/lib/auth/admin-auth';
import { redirect } from 'next/navigation';

export default async function AdminNovelsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/admin/login');
  }
  
  return (
    <div>
      <h1>Welcome, {user.profile.role}!</h1>
    </div>
  );
}
```

### Client Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth/admin-auth';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);
  
  if (loading) return <div>Loading...</div>;
  
  return <div>Protected content</div>;
}
```

---

## 🧪 Testing

### Test Login Flow

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/admin`
3. Should redirect to `/admin/login`
4. Enter valid admin credentials
5. Should redirect to `/admin` dashboard
6. Refresh page → should stay logged in
7. Click Logout → should redirect to login

### Test Access Denied

1. Create a regular auth user (no profile)
2. Try to login
3. Should show: "User profile not found. Access denied."

### Test Editor vs Admin

1. Create editor user with `role = 'editor'`
2. Login as editor
3. Header should show "E" icon and "Editor" text
4. Can view/edit content
5. Delete buttons should be hidden (future feature)

---

## 🔐 Security Notes

### ✅ What's Protected

- All `/admin/*` routes require authentication
- Users must have `admin` or `editor` role in `profiles` table
- Session persists securely via Supabase Auth
- Auth state changes trigger re-validation
- Invalid roles are immediately signed out

### ⚠️ Important

- **NO public signup** - Users must be pre-created
- Service role key is **never** exposed to client
- RLS policies protect data access (see `005_admin_rls_policies.sql`)
- Profiles table has RLS enabled
- Session tokens are httpOnly cookies (managed by Supabase)

---

## 🐛 Troubleshooting

### "User profile not found"

**Cause**: Auth user exists but no profile record

**Fix**:
```sql
INSERT INTO public.profiles (id, role)
VALUES ('USER_UUID_FROM_AUTH_USERS', 'admin');
```

### "Access denied. Admin or editor role required"

**Cause**: Profile exists but role is not 'admin' or 'editor'

**Fix**:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_UUID';
```

### Session not persisting

**Cause**: Supabase client not configured correctly

**Fix**: Check `src/lib/supabase/client.ts` and ensure:
```typescript
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### Infinite redirect loop

**Cause**: Auth state not properly initialized

**Fix**: Clear browser cookies/storage and try again. Check console for errors.

---

## 📝 Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## ✨ Features Implemented

✅ Email + password authentication  
✅ Role-based access (admin/editor)  
✅ Session persistence  
✅ Auto-redirect on auth state change  
✅ Loading states  
✅ Error handling  
✅ Logout functionality  
✅ User role display in header  
✅ Auth guard on all admin routes  
✅ Access denied for invalid roles  

---

## 🚀 Next Steps

1. Run RLS migration: `supabase db push`
2. Create your first admin user (see guide above)
3. Test login at `http://localhost:3000/admin`
4. Implement role-based UI (hide delete for editors)
5. Add password reset flow (optional)
6. Add profile management page (optional)

---

**Auth implementation complete!** 🎉
