import { cookies } from 'next/headers';
import { headers } from 'next/headers';

export function isAuthenticated() {
  try {
    // Try getting cookie from both client and server side
    const cookieStore = cookies();
    const headersList = headers();
    const cookieHeader = headersList.get('cookie');
    
    // Check cookie in cookie store
    const authCookie = cookieStore.get('resources-auth');
    if (authCookie?.value === 'true') {
      return true;
    }
    
    // Check cookie in headers if not found in cookie store
    if (cookieHeader?.includes('resources-auth=true')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}

export function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error('Unauthorized');
  }
}

export function getAuthCookie() {
  const cookieStore = cookies();
  return cookieStore.get('resources-auth');
}

export function setAuthCookie(response: Response) {
  // Set a secure, HTTP-only cookie with SameSite=Lax
  const cookieValue = 'resources-auth=true; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure';
  
  // Set the cookie header
  response.headers.set('Set-Cookie', cookieValue);
  
  return response;
} 