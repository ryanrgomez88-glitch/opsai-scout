import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ assessments: [] });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('scout_assessments')
    .select('id, company, contact_email, created_at, recommendations_json')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ assessments: [], error: error.message });
  }

  return NextResponse.json({ assessments: data || [] });
}
