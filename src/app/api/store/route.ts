import { NextResponse } from 'next/server';
import { getRealtimeState, updateRealtimeState } from '@/lib/realtimeStore';
import { fetchAllFromSupabase, syncToSupabase } from '@/lib/supabaseStore';
import { isSupabaseConfigured } from '@/lib/env';

export async function GET(request: Request) {
  void request.url;
  let state = getRealtimeState();

  if (isSupabaseConfigured()) {
    try {
      const supaData = await fetchAllFromSupabase();
      if (supaData && supaData.properties && supaData.properties.length > 0) {
        state = updateRealtimeState({
          properties: supaData.properties,
          bookings: supaData.bookings,
          reviews: supaData.reviews,
          messages: supaData.messages,
          accounts: supaData.accounts,
          settings: supaData.settings
        });
      }
    } catch {
      // Fallback seamlessly to local realtime store
    }
  }

  return NextResponse.json(state, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0'
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = updateRealtimeState({
      properties: body.properties,
      bookings: body.bookings,
      messages: body.messages,
      reviews: body.reviews,
      accounts: body.accounts,
      settings: body.settings,
      tombstones: body.tombstones,
      wishlists: body.wishlists
    });

    if (isSupabaseConfigured()) {
      void syncToSupabase({
        properties: body.properties,
        bookings: body.bookings,
        reviews: body.reviews,
        messages: body.messages,
        accounts: body.accounts,
        settings: body.settings
      });
    }

    return NextResponse.json(updated, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid payload' },
      { status: 400 }
    );
  }
}
