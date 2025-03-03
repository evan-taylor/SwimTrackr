import { createServerSupabaseClient } from './supabase';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { UserRole } from './database.types';

// Get the current user's profile from server components
export async function getUser() {
  const cookieStore = await cookies();
  
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return { user, profile };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Check if the user has one of the specified roles
export async function hasRole(allowedRoles: UserRole[]) {
  const userData = await getUser();
  
  if (!userData) {
    return false;
  }
  
  return allowedRoles.includes(userData.profile?.role as UserRole);
}

// Middleware to protect routes based on roles
export async function requireAuth() {
  const userData = await getUser();
  
  if (!userData) {
    redirect('/auth/login');
  }
  
  return userData;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const userData = await requireAuth();
  
  if (!allowedRoles.includes(userData.profile?.role as UserRole)) {
    redirect('/dashboard');
  }
  
  return userData;
}

// Admin-only middleware
export async function requireAdmin() {
  return requireRole(['admin']);
}

// Facility manager middleware
export async function requireManager() {
  return requireRole(['admin', 'manager']);
}

// Instructor middleware
export async function requireInstructor() {
  return requireRole(['admin', 'manager', 'instructor']);
}

// Get all roles a user is allowed to access based on their role
export function getAllowedRolesForUser(role: UserRole): UserRole[] {
  switch (role) {
    case 'admin':
      return ['admin', 'manager', 'instructor', 'facility_parent', 'parent'];
    case 'manager':
      return ['manager', 'instructor', 'facility_parent', 'parent'];
    case 'instructor':
      return ['instructor'];
    case 'facility_parent':
      return ['facility_parent'];
    case 'parent':
      return ['parent'];
    default:
      return [];
  }
}

// Check if a user can manage a facility
export async function canManageFacility(facilityId: string) {
  const userData = await getUser();
  
  if (!userData) {
    return false;
  }
  
  const { profile } = userData;
  
  if (profile?.role === 'admin') {
    return true;
  }
  
  if (profile?.role === 'manager' && profile?.facility_id === facilityId) {
    return true;
  }
  
  return false;
}

// Log the user out and clear cookies
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('sb-auth-token');
  return redirect('/auth/login');
}