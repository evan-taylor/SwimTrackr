import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

// Add runtime configuration
export const runtime = 'experimental-edge';

export async function middleware(request: NextRequest) {
  // Create a response object that we'll modify and return
  const response = NextResponse.next();

  try {
    // Create supabase client
    const supabase = createMiddlewareClient<Database>({ 
      req: request, 
      res: response 
    });

    // Refresh session if expired
    await supabase.auth.getSession();

    // Check auth status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Handle protected routes
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
    const isProtectedRoute = !request.nextUrl.pathname.match(
      /^\/(_next|api|static|public|favicon\.ico)/
    );

    if (!session && isProtectedRoute && !isAuthRoute) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // For auth routes, redirect to dashboard if already logged in
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return the original response if there's an error
    return response;
  }
}

// Specify which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (inside /public)
     * 4. all files in /public
     */
    '/((?!api|_next|static|public|favicon.ico).*)',
  ],
}; 