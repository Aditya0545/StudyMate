import { cookies } from 'next/headers';

export function isAuthenticated() {
  const cookieStore = cookies();
  return cookieStore.get('resources-auth')?.value === 'true';
}

export function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }
} 