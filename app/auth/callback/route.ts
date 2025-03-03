import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

/**
 * Auth callback handler for OAuth providers and magic links
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Redirect to the specified page or dashboard
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
  }

  // If no code provided, redirect to login page
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
} 