import { NextResponse } from 'next/server';
import { getRealtimeState, updateRealtimeState } from '@/lib/realtimeStore';

export async function GET(request: Request) {
  void request.url;
  const state = getRealtimeState();
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = updateRealtimeState({
      properties: body.properties,
      bookings: body.bookings,
      messages: body.messages,
      settings: body.settings
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid payload' },
      { status: 400 }
    );
  }
}
