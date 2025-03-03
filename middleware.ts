import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient({ req: request, res });
    await supabase.auth.getSession();
  } catch (err) {
    console.error('Middleware error:', err);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api|_next/data|$).*)',
  ],
}; 