import { UserAccount } from '@/types';

export const DEFAULT_GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '397249070493-tdjj1fnblridf17atv36jat90vju5n0v.apps.googleusercontent.com';

export const TRUONG_HUNG_REAL_AVATAR =
  'https://lh3.googleusercontent.com/a/ACg8ocLkwpBVjQWQrLm4AT7bBEJYVC2LnbmKztX_PWiRRchhmM_FhTfT=s384-c';

export const ADMIN_EMAILS = [
  'truongvantuan43344@gmail.com',
  'admin@unistay.com'
];

export const PREDEFINED_ADMINS = [
  {
    email: 'truongvantuan43344@gmail.com',
    password: 'Admin@123456',
    name: 'Trương Hùng (Admin)',
    avatar: TRUONG_HUNG_REAL_AVATAR,
    role: 'admin' as const,
    phone: '+84 901 234 567'
  },
  {
    email: 'admin@unistay.com',
    password: 'Admin@123456',
    name: 'UniStay Super Admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    role: 'admin' as const,
    phone: '+84 909 888 777'
  }
];

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-admin-1',
    email: 'truongvantuan43344@gmail.com',
    name: 'Trương Hùng (Admin)',
    role: 'admin',
    phone: '0901234567',
    college: 'ĐH Cần Thơ (CTU)',
    avatar: TRUONG_HUNG_REAL_AVATAR,
    createdAt: '2026-10-25T00:00:00.000Z',
    lastLoginAt: '2026-10-29T14:00:00.000Z'
  },
  {
    id: 'acc-admin-2',
    email: 'admin@unistay.com',
    name: 'UniStay Super Admin',
    role: 'admin',
    phone: '0909888777',
    college: 'Ban Quản Trị Hệ Thống',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-10-25T00:00:00.000Z',
    lastLoginAt: '2026-10-29T13:00:00.000Z'
  }
];

export function isEmailAdmin(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase().trim());
}
