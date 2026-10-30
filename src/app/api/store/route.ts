import { NextResponse } from 'next/server';
import { getRealtimeState, updateRealtimeState } from '@/lib/realtimeStore';

export async function GET(request: Request) {
  void request.url;
  const state = getRealtimeState();
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
      tombstones: body.tombstones
    });
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
