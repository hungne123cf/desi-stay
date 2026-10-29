export const DEFAULT_GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '397249070493-tdjj1fnblridf17atv36jat90vju5n0v.apps.googleusercontent.com';

export const ADMIN_EMAILS = [
  'truongvantuan43344@gmail.com',
  'admin@unistay.com'
];

export const PREDEFINED_ADMINS = [
  {
    email: 'truongvantuan43344@gmail.com',
    password: 'Admin@123456',
    name: 'Trương Hùng (Admin)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
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

export function isEmailAdmin(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email.toLowerCase().trim());
}
