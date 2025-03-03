import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Note: This is a custom matcher function that can be modified to fit your needs
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(req: NextRequest) {
  try {
    // Create a response object that we'll modify and return
    const res = NextResponse.next();

    // Create a Supabase client with the request and response
    const supabase = createMiddlewareClient<Database>({
      req,
      res,
    });

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If there's no session and the user is trying to access a protected route
    if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
      // Get the pathname of the requested page (e.g., /protected-page)
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      
      // Redirect to the login page with a return URL
      return NextResponse.redirect(redirectUrl);
    }

    // If there's a session and the user is trying to access an auth page
    if (session && req.nextUrl.pathname.startsWith('/auth')) {
      // Redirect to the dashboard
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (e) {
    // If there's an error, return the original response
    return NextResponse.next();
  }
} 