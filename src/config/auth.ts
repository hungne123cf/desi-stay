import { UserAccount } from '@/types';

export const DEFAULT_GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '397249070493-nobrh851jga00tk81tfqdc74ghuc2m0i.apps.googleusercontent.com';

// Avatar thật từ Google của tài khoản Sinh viên: Truong Hung (K18 CT) - hungtce181568@fpt.edu.vn
export const TRUONG_HUNG_K18_AVATAR =
  'https://lh3.googleusercontent.com/a/ACg8ocLkwpBVjQWQrLm4AT7bBEJYVC2LnbmKztX_PWiRRchhmM_FhTfT=s384-c';

// Avatar thật từ Google của tài khoản Super Admin: Trương Hùng - truongvantuan43344@gmail.com
export const TRUONG_HUNG_ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/a/ACg8ocLcJeUqcDC3Ka0yx4uDj5bjHvCuaOX-4di4830y2-VhEkoYR7I=s384-c';

export const TRUONG_HUNG_REAL_AVATAR = TRUONG_HUNG_ADMIN_AVATAR;

export const ADMIN_EMAILS = [
  'truongvantuan43344@gmail.com',
  'admin@unistay.com'
];

export const PREDEFINED_ADMINS = [
  {
    email: 'truongvantuan43344@gmail.com',
    password: 'Admin@123456',
    name: 'Trương Hùng (Admin)',
    avatar: TRUONG_HUNG_ADMIN_AVATAR,
    role: 'admin' as const,
    phone: '+84 901 234 567'
  },
  {
    email: 'admin@unistay.com',
    password: 'Admin@123456',
    name: 'UniStay Super Admin',
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
    avatar: TRUONG_HUNG_ADMIN_AVATAR,
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
    createdAt: '2026-10-25T00:00:00.000Z',
    lastLoginAt: '2026-10-29T13:00:00.000Z'
  },
  {
    id: 'acc-student-k18',
    email: 'hungtce181568@fpt.edu.vn',
    name: 'Truong Hung (K18 CT)',
    role: 'student',
    phone: '123456789',
    college: 'ĐH FPT Cần Thơ',
    avatar: TRUONG_HUNG_K18_AVATAR,
    createdAt: '2026-10-28T00:00:00.000Z',
    lastLoginAt: '2026-10-30T14:00:00.000Z'
  }
];

export function isEmailAdmin(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase().trim());
}
