import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { mapProperty, mapSettings } from '@/lib/mappers';
import type { Property, SiteSettings } from '@/types';

export const TAGS = {
  properties: 'properties',
  property: (id: string) => `property:${id}`,
  settings: 'site-settings',
};

/** Published listings – public, cached, invalidated by admin actions. */
export async function getPublishedProperties(): Promise<Property[]> {
  'use cache';
  cacheTag(TAGS.properties);
  cacheLife('minutes');

  if (!isSupabaseConfigured()) return [];
  const { data, error } = await createPublicClient()
    .from('properties')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getPublishedProperties', error.message);
    return [];
  }
  return (data ?? []).map(mapProperty);
}

export async function getPublishedProperty(id: string): Promise<Property | null> {
  'use cache';
  cacheTag(TAGS.properties, TAGS.property(id));
  cacheLife('minutes');

  if (!isSupabaseConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await createPublicClient()
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();
  return data ? mapProperty(data) : null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache';
  cacheTag(TAGS.settings);
  cacheLife('hours');

  if (!isSupabaseConfigured()) return mapSettings(null);
  const { data } = await createPublicClient().from('site_settings').select('*').eq('id', 1).maybeSingle();
  return mapSettings(data);
}
