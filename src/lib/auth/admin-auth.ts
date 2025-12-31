import { createClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'editor';

export interface UserProfile {
  id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Sign in with email and password
 * Checks if user has admin or editor role
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient();

  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('No user returned from sign in');
  }

  // Fetch user profile to check role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, created_at, updated_at')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    // Profile doesn't exist - sign out and reject
    await supabase.auth.signOut();
    throw new Error('User profile not found. Access denied.');
  }

  // Check if user has admin or editor role
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    await supabase.auth.signOut();
    throw new Error('Access denied. Admin or editor role required.');
  }

  return {
    user: authData.user,
    profile,
    session: authData.session,
  };
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return session;
}

/**
 * Get current user with profile
 * Returns null if not authenticated or no valid profile
 */
export async function getCurrentUser() {
  const supabase = createClient();
  
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return null;
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, created_at, updated_at')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  // Verify role
  if (!['admin', 'editor'].includes(profile.role)) {
    return null;
  }

  return {
    user: session.user,
    profile,
    session,
  };
}

/**
 * Check if user is authenticated with valid role
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.profile.role === 'admin';
}

/**
 * Check if user has editor role
 */
export async function isEditor(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.profile.role === 'editor';
}

/**
 * Get user's role
 * Returns null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.profile.role || null;
}
