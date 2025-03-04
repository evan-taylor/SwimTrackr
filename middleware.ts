import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const middleware = async (request: NextRequest) => {
  // Create a response object
  let response = NextResponse.next();

  // Check if the request is for a protected route
  const requestUrl = new URL(request.url);
  const isProtectedRoute = requestUrl.pathname.startsWith('/dashboard');
  
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh the session
  const { data: { session } } = await supabase.auth.getSession();

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', requestUrl.origin);
    redirectUrl.searchParams.set('redirectTo', requestUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
};

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - .well-known (well-known files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.well-known).*)',
  ],
}; 