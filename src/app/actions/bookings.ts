'use server';

import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { bookingSchema, fieldErrors } from '@/lib/validation';
import type { ActionResult } from '@/types';

export async function createBooking(
  input: Record<string, unknown>
): Promise<ActionResult<{ reference: string }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Please sign in to reserve a bed.' };

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors: fieldErrors(parsed.error) };
  }
  const v = parsed.data;

  const today = new Date().toISOString().slice(0, 10);
  if (v.moveInDate < today) {
    return { ok: false, error: 'Move-in date cannot be in the past.', fieldErrors: { moveInDate: ['Pick a future date'] } };
  }

  const supabase = await createClient();

  // Prevent duplicate open requests for the same property
  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('property_id', v.propertyId)
    .in('status', ['pending', 'token_paid']);
  if ((count ?? 0) > 0) {
    return { ok: false, error: 'You already have an open request for this property. Check “My bookings”.' };
  }

  // token_amount_inr / room_type / hold_expires_at are set by a DB trigger from the property row.
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      property_id: v.propertyId,
      user_id: user.id,
      student_name: v.studentName,
      student_email: v.studentEmail,
      student_whatsapp: v.studentWhatsApp,
      college: v.college,
      move_in_date: v.moveInDate,
      room_type: 'double',
      token_amount_inr: 0,
      status: 'pending',
      payment_method: 'pay_on_visit',
    })
    .select('reference')
    .single();

  if (error || !data) {
    console.error('createBooking', error?.message);
    return { ok: false, error: 'Could not create your booking. The property may no longer be available.' };
  }

  // Save contact details to the profile for next time (best effort)
  await supabase
    .from('profiles')
    .update({ phone: v.studentWhatsApp, college: v.college || null, full_name: v.studentName })
    .eq('id', user.id);

  return { ok: true, data: { reference: data.reference } };
}
