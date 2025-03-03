import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const envStatus = {
    supabaseUrl: supabaseUrl ? 'set' : 'missing',
    supabaseAnonKey: supabaseAnonKey ? 'set' : 'missing',
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: 'ok',
    environment: envStatus,
    timestamp: new Date().toISOString(),
  });
} 