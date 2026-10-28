'use server';

import { updateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { TAGS } from '@/lib/data/public';
import { bookingStatusSchema, fieldErrors, propertySchema, settingsSchema } from '@/lib/validation';
import type { ActionResult } from '@/types';

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'listing'
  );
}

function formToObject(formData: FormData) {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === 'string') obj[key] = value;
  });
  return obj;
}

export async function saveProperty(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const parsed = propertySchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors: fieldErrors(parsed.error) };
  }
  const v = parsed.data;

  const row = {
    title: v.title,
    description: v.description,
    address: v.address,
    city: v.city,
    area: v.area,
    nearby_university: v.nearbyUniversity,
    distance_to_campus: v.distanceToCampus,
    room_type: v.roomType,
    gender: v.gender,
    food_type: v.foodType,
    price_per_month_inr: v.pricePerMonthINR,
    security_deposit_inr: v.securityDepositINR,
    token_deposit_inr: v.tokenDepositINR,
    available_beds: v.availableBeds,
    curfew_time: v.curfewTime || null,
    landlord_name: v.landlordName,
    landlord_whatsapp: v.landlordWhatsApp,
    highlights: v.highlights,
    amenities: v.amenities,
    images: v.images,
    is_verified: v.isVerified,
    is_zero_brokerage: v.isZeroBrokerage,
    is_published: v.isPublished,
  };

  if (v.isPublished && v.images.length === 0) {
    return { ok: false, error: 'Add at least one photo before publishing.', fieldErrors: { images: ['Required to publish'] } };
  }

  const supabase = await createClient();

  if (v.id) {
    const { error } = await supabase.from('properties').update(row).eq('id', v.id);
    if (error) return { ok: false, error: error.message };
    updateTag(TAGS.properties);
    updateTag(TAGS.property(v.id));
    return { ok: true, data: { id: v.id }, message: 'Listing updated' };
  }

  const { data, error } = await supabase
    .from('properties')
    .insert({ ...row, code: '', slug: `${slugify(v.title)}-${Date.now().toString(36)}`, created_by: admin.id })
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Insert failed' };

  updateTag(TAGS.properties);
  return { ok: true, data: { id: data.id }, message: 'Listing created' };
}

export async function setPropertyPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('properties').update({ is_published: published }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  updateTag(TAGS.properties);
  updateTag(TAGS.property(id));
  return { ok: true };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();

  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', id);
  if ((count ?? 0) > 0) {
    return { ok: false, error: 'This listing has bookings. Unpublish it instead of deleting to keep records.' };
  }

  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  updateTag(TAGS.properties);
  updateTag(TAGS.property(id));
  return { ok: true };
}

export async function updateBooking(
  id: string,
  patch: { status?: string; adminNotes?: string }
): Promise<ActionResult> {
  await requireAdmin();
  const update: Record<string, string> = {};
  if (patch.status !== undefined) {
    const s = bookingStatusSchema.safeParse(patch.status);
    if (!s.success) return { ok: false, error: 'Invalid status' };
    update.status = s.data;
  }
  if (patch.adminNotes !== undefined) update.admin_notes = patch.adminNotes.slice(0, 2000);

  const supabase = await createClient();
  const { error } = await supabase.from('bookings').update(update).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors: fieldErrors(parsed.error) };
  }
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from('site_settings')
    .update({
      support_whatsapp: v.supportWhatsApp,
      support_email: v.supportEmail,
      default_token_inr: v.defaultTokenINR,
      hold_hours: v.holdHours,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) return { ok: false, error: error.message };
  updateTag(TAGS.settings);
  return { ok: true, message: 'Settings saved' };
}
