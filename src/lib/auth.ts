import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { mapProfile } from '@/lib/mappers';
import type { CurrentUser } from '@/types';

/**
 * Data Access Layer: the single place that reads the session.
 * Always verified against Supabase Auth (getUser), never trusted from cookies alone.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? '',
      name: (user.user_metadata?.full_name as string) || (user.email ?? '').split('@')[0],
      avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
      role: 'student',
      phone: null,
      college: null,
    };
  }
  return mapProfile(profile, user.email ?? '');
}

export async function requireUser(next = '/'): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser('/admin');
  if (user.role !== 'admin') redirect('/?error=forbidden');
  return user;
}
