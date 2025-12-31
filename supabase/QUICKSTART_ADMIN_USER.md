# Quick Start: Create Your First Admin User

## Step 1: Apply Migrations

Make sure all migrations are applied:

```bash
# If using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard → SQL Editor
```

Run migrations in order:
1. `001_core_schema.sql`
2. `002_functions_triggers.sql`
3. `003_rls_policies.sql`
4. **`004_profiles_table.sql`** ← Creates profiles table
5. `005_admin_rls_policies.sql` ← Creates RLS policies

## Step 2: Create Auth User in Dashboard

1. Go to **Supabase Dashboard**
2. Click **Authentication** (left sidebar)
3. Click **Users** tab
4. Click **Add user** button (top right)
5. Select **Create new user**
6. Fill in:
   - Email: `admin@example.com` (or your email)
   - Password: Create a strong password
   - Auto Confirm User: ✅ **Enabled**
7. Click **Create user**
8. **Copy the UUID** from the user list (you'll need this next)

## Step 3: Create Profile Record

### Option A: Via Dashboard

1. Go to **Table Editor** (left sidebar)
2. Select **profiles** table
3. Click **Insert** → **Insert row**
4. Fill in:
   - `id`: Paste the UUID you copied from Step 2
   - `role`: Select **admin** from dropdown
   - `created_at`: Auto-filled
   - `updated_at`: Auto-filled
5. Click **Save**

### Option B: Via SQL Editor

1. Go to **SQL Editor** (left sidebar)
2. Paste this query (replace UUID):

```sql
INSERT INTO public.profiles (id, role)
VALUES ('PASTE_UUID_FROM_STEP_2_HERE', 'admin');
```

3. Click **Run**

## Step 4: Verify

Run this query in SQL Editor:

```sql
SELECT 
  p.id,
  p.role,
  u.email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;
```

You should see your admin user listed.

## Step 5: Test Login

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/admin`
3. You'll be redirected to `/admin/login`
4. Enter the email and password from Step 2
5. Click **Login**
6. You should be redirected to the admin dashboard!

---

## Troubleshooting

### Error: "relation 'public.profiles' does not exist"

**Cause**: Migration `004_profiles_table.sql` hasn't been run

**Fix**: 
```bash
supabase db push
```

Or run the migration manually in SQL Editor.

### Error: "User profile not found. Access denied."

**Cause**: Auth user exists but no profile record

**Fix**: Complete Step 3 above to create the profile record.

### Error: "Access denied. Admin or editor role required."

**Cause**: Profile exists but role is wrong

**Fix**:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'YOUR_USER_UUID';
```

### Can't find user UUID

1. Go to Authentication → Users
2. The UUID is in the first column (ID)
3. Click to copy

---

## Create Additional Users

### Create Editor User

1. Create auth user in dashboard (same as Step 2)
2. Copy UUID
3. Run:
```sql
INSERT INTO public.profiles (id, role)
VALUES ('EDITOR_UUID_HERE', 'editor');
```

### Change User Role

```sql
-- Promote editor to admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_UUID';

-- Demote admin to editor
UPDATE public.profiles
SET role = 'editor'
WHERE id = 'USER_UUID';
```

### Revoke Access

```sql
-- Remove profile (user can no longer access admin)
DELETE FROM public.profiles
WHERE id = 'USER_UUID';
```

---

## Summary

1. ✅ Apply migrations (especially `004_profiles_table.sql`)
2. ✅ Create auth user in Supabase Dashboard
3. ✅ Copy user UUID
4. ✅ Insert profile record with `role = 'admin'`
5. ✅ Test login at `/admin`

**Done!** 🎉
