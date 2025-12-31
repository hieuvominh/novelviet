-- ============================================================================
-- CREATE ADMIN USER MANUALLY
-- ============================================================================
-- This script helps you create an admin user after creating the auth user
-- in Supabase Dashboard
--
-- STEPS:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter email and password, click "Create user"
-- 4. Copy the UUID from the user list
-- 5. Run the INSERT query below with that UUID
-- ============================================================================

-- Replace 'YOUR_AUTH_USER_UUID_HERE' with the actual UUID from auth.users
INSERT INTO public.profiles (id, role)
VALUES ('YOUR_AUTH_USER_UUID_HERE', 'admin');

-- Example (replace with your actual UUID):
-- INSERT INTO public.profiles (id, role)
-- VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin');

-- ============================================================================
-- VERIFY THE PROFILE WAS CREATED
-- ============================================================================

SELECT 
  p.id,
  p.role,
  u.email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;

-- ============================================================================
-- CREATE ADDITIONAL USERS
-- ============================================================================

-- Create an editor user (after creating auth user in dashboard)
-- INSERT INTO public.profiles (id, role)
-- VALUES ('EDITOR_AUTH_USER_UUID_HERE', 'editor');

-- ============================================================================
-- UPDATE USER ROLE
-- ============================================================================

-- Change editor to admin
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'USER_UUID_HERE';

-- Change admin to editor
-- UPDATE public.profiles
-- SET role = 'editor'
-- WHERE id = 'USER_UUID_HERE';

-- ============================================================================
-- DELETE PROFILE (revoke access)
-- ============================================================================

-- Remove user's admin/editor access (they can still have auth.users record)
-- DELETE FROM public.profiles
-- WHERE id = 'USER_UUID_HERE';
