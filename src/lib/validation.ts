import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{8,18}$/, 'Enter a valid phone number with country code, e.g. +91 98765 43210');

const lines = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  );

export const bookingSchema = z.object({
  propertyId: z.uuid(),
  studentName: z.string().trim().min(2, 'Name is too short').max(120),
  studentEmail: z.email('Enter a valid email'),
  studentWhatsApp: phone,
  college: z.string().trim().max(160).default(''),
  moveInDate: z.iso.date('Pick a valid date'),
});

export const propertySchema = z.object({
  id: z.uuid().optional().or(z.literal('').transform(() => undefined)),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(5000).default(''),
  address: z.string().trim().max(300).default(''),
  city: z.string().trim().min(2).max(80),
  area: z.string().trim().max(120).default(''),
  nearbyUniversity: z.string().trim().max(160).default(''),
  distanceToCampus: z.string().trim().max(80).default(''),
  roomType: z.enum(['single', 'double', 'triple', 'studio']),
  gender: z.enum(['all', 'boys', 'girls']),
  foodType: z.enum(['pure_veg', 'non_veg', 'jain_available', 'self_cook']),
  pricePerMonthINR: z.coerce.number().int().min(0).max(1_000_000),
  securityDepositINR: z.coerce.number().int().min(0).max(1_000_000),
  tokenDepositINR: z.coerce.number().int().min(0).max(100_000),
  availableBeds: z.coerce.number().int().min(0).max(1000),
  curfewTime: z.string().trim().max(80).optional(),
  landlordName: z.string().trim().max(120).default(''),
  landlordWhatsApp: z.string().trim().max(20).default(''),
  highlights: lines,
  amenities: lines,
  images: z
    .string()
    .optional()
    .transform((v) => {
      try {
        const arr = JSON.parse(v ?? '[]');
        return Array.isArray(arr) ? arr.filter((u) => typeof u === 'string' && u.startsWith('https://')) : [];
      } catch {
        return [];
      }
    }),
  isVerified: z.coerce.boolean().default(false),
  isZeroBrokerage: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(false),
});

export const settingsSchema = z.object({
  supportWhatsApp: z.string().trim().max(20).default(''),
  supportEmail: z.union([z.email(), z.literal('')]).default(''),
  defaultTokenINR: z.coerce.number().int().min(0).max(100_000),
  holdHours: z.coerce.number().int().min(1).max(720),
});

export const bookingStatusSchema = z.enum(['pending', 'token_paid', 'confirmed', 'cancelled', 'expired']);

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}
