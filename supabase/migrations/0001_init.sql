-- =====================================================================
-- UniStay Global – Complete Database Schema (Roles, Admins, Accounts, Properties, Bookings)
-- Copy toàn bộ file này dán vào Supabase > SQL Editor và bấm RUN.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. BẢNG ROLES (Phân quyền hệ thống)
-- ---------------------------------------------------------------------
create table if not exists public.roles (
  code         text primary key,
  name         text not null,
  description  text not null default '',
  permissions  text[] not null default '{}',
  created_at   timestamptz not null default now()
);

insert into public.roles (code, name, description, permissions)
values
  ('admin', 'Quản trị viên (Admin)', 'Toàn quyền quản lý hệ thống, phòng trọ, duyệt đơn cọc và cấu hình ngân hàng', array['manage_all', 'manage_properties', 'manage_bookings', 'manage_accounts', 'manage_settings']),
  ('landlord', 'Chủ nhà / Đối tác (Landlord)', 'Đăng tin phòng trọ và tiếp nhận sinh viên đặt lịch xem phòng', array['manage_own_properties', 'view_own_bookings']),
  ('student', 'Sinh viên / Khách thuê (Student)', 'Tìm kiếm phòng trọ, đặt cọc giữ chỗ trực tuyến và liên hệ chủ nhà', array['view_properties', 'create_booking'])
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  permissions = excluded.permissions;

-- ---------------------------------------------------------------------
-- 2. BẢNG ADMINS (Danh sách Quản trị viên hệ thống)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  full_name    text not null,
  phone        text not null default '',
  avatar_url   text,
  admin_level  text not null default 'super_admin' check (admin_level in ('super_admin', 'moderator', 'support')),
  is_active    boolean not null default true,
  note         text not null default '',
  created_at   timestamptz not null default now()
);

insert into public.admins (email, full_name, phone, avatar_url, admin_level, is_active, note)
values
  (
    'truongvantuan43344@gmail.com',
    'Trương Hùng (Owner & Super Admin)',
    '+84 901 234 567',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'super_admin',
    true,
    'Tài khoản Google Admin chính chủ'
  ),
  (
    'admin@unistay.com',
    'UniStay System Admin',
    '+84 909 888 777',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    'super_admin',
    true,
    'Tài khoản quản trị dự phòng'
  )
on conflict (email) do update set
  full_name = excluded.full_name,
  admin_level = excluded.admin_level,
  is_active = excluded.is_active;

-- ---------------------------------------------------------------------
-- 3. BẢNG ACCOUNTS (Tài khoản người dùng Google & Email)
-- ---------------------------------------------------------------------
create table if not exists public.accounts (
  id             uuid primary key default gen_random_uuid(),
  email          text unique not null,
  full_name      text not null,
  password_hash  text,
  avatar_url     text,
  phone          text,
  college        text,
  role_code      text not null default 'student' references public.roles(code) on update cascade,
  auth_provider  text not null default 'google' check (auth_provider in ('google', 'email')),
  is_verified    boolean not null default true,
  last_login_at  timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Tự động kiểm tra nếu email nằm trong bảng `admins` thì tự động cấp role = 'admin'
create or replace function public.sync_account_admin_role()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  if exists (select 1 from public.admins where lower(email) = new.email and is_active = true) then
    new.role_code := 'admin';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sync_account_admin_role on public.accounts;
create trigger trg_sync_account_admin_role
  before insert or update on public.accounts
  for each row execute function public.sync_account_admin_role();

-- Nạp sẵn tài khoản mẫu vào bảng accounts
insert into public.accounts (email, full_name, password_hash, avatar_url, phone, college, role_code, auth_provider)
values
  (
    'truongvantuan43344@gmail.com',
    'Trương Hùng',
    'Admin@123456',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    '+84 901 234 567',
    'FPT University',
    'admin',
    'google'
  ),
  (
    'hungtce181568@fpt.edu.vn',
    'Truong Hung (K18 CT)',
    null,
    null,
    '+84 987 654 321',
    'ĐH FPT Cần Thơ',
    'student',
    'google'
  ),
  (
    'nam.nguyen@gmail.com',
    'Nguyễn Hoàng Nam',
    '123456',
    null,
    '0909 123 456',
    'ĐH Bách Khoa TP.HCM',
    'student',
    'email'
  )
on conflict (email) do update set
  full_name = excluded.full_name,
  role_code = excluded.role_code;

-- ---------------------------------------------------------------------
-- 4. BẢNG PROPERTIES (Danh sách Phòng trọ / Căn hộ sinh viên)
-- ---------------------------------------------------------------------
create table if not exists public.properties (
  id                   uuid primary key default gen_random_uuid(),
  code                 text unique not null,
  title                text not null,
  slug                 text unique not null,
  description          text not null default '',
  address              text not null default '',
  city                 text not null,
  country              text not null default 'Vietnam',
  area                 text not null default '',
  nearby_university    text not null default '',
  distance_to_campus   text not null default '',
  room_type            text not null default 'studio',
  gender               text not null default 'all',
  food_preference      text not null default 'self_cook',
  price_per_month_usd  numeric(10,2) not null default 180,
  security_deposit_usd numeric(10,2) not null default 180,
  token_deposit_usd    numeric(10,2) not null default 20,
  highlights           text[] not null default '{}',
  amenities            text[] not null default '{}',
  images               text[] not null default '{}',
  curfew_time          text not null default 'Giờ giấc tự do 24/7',
  available_beds       integer not null default 2,
  is_verified          boolean not null default true,
  is_zero_brokerage    boolean not null default true,
  is_published         boolean not null default true,
  landlord_name        text not null default '',
  landlord_contact     text not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Đảm bảo các cột mới tồn tại nếu bảng properties đã được tạo từ bản cũ
alter table public.properties add column if not exists country text not null default 'Vietnam';
alter table public.properties add column if not exists food_preference text not null default 'self_cook';
alter table public.properties add column if not exists price_per_month_usd numeric(10,2) not null default 180;
alter table public.properties add column if not exists security_deposit_usd numeric(10,2) not null default 180;
alter table public.properties add column if not exists token_deposit_usd numeric(10,2) not null default 20;
alter table public.properties add column if not exists landlord_contact text not null default '';

-- ---------------------------------------------------------------------
-- 5. BẢNG BOOKINGS (Danh sách Đơn đặt cọc giữ phòng)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  reference             text unique not null,
  property_code         text not null,
  property_title        text not null,
  account_email         text not null,
  student_name          text not null,
  student_contact       text not null,
  college               text not null default '',
  move_in_date          date not null,
  room_type             text not null default 'studio',
  token_amount_usd      numeric(10,2) not null default 20,
  token_amount_display  text not null default '500.000 ₫',
  currency              text not null default 'VND',
  status                text not null default 'token_paid',
  payment_method        text not null default 'vietqr_bank',
  transaction_reference text,
  admin_notes           text not null default '',
  created_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. BẢNG SITE_SETTINGS (Cấu hình hệ thống & Ngân hàng VietQR)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id                     integer primary key default 1 check (id = 1),
  brand_name             text not null default 'UniStay',
  default_currency       text not null default 'VND',
  support_whatsapp       text not null default '+84901234567',
  support_hotline        text not null default '1900 6868',
  vietqr_bank_name       text not null default 'Vietcombank (VCB)',
  vietqr_account_number  text not null default '1029384756',
  vietqr_account_holder  text not null default 'CONG TY CP UNISTAY VIETNAM',
  updated_at             timestamptz not null default now()
);

alter table public.site_settings add column if not exists brand_name text not null default 'UniStay';
alter table public.site_settings add column if not exists default_currency text not null default 'VND';
alter table public.site_settings add column if not exists support_hotline text not null default '1900 6868';
alter table public.site_settings add column if not exists vietqr_bank_name text not null default 'Vietcombank (VCB)';
alter table public.site_settings add column if not exists vietqr_account_number text not null default '1029384756';
alter table public.site_settings add column if not exists vietqr_account_holder text not null default 'CONG TY CP UNISTAY VIETNAM';

insert into public.site_settings (id, brand_name, default_currency, support_whatsapp, support_hotline, vietqr_bank_name, vietqr_account_number, vietqr_account_holder)
values (1, 'UniStay', 'VND', '+84901234567', '1900 6868', 'Vietcombank (VCB)', '1029384756', 'CONG TY CP UNISTAY VIETNAM')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 7. PHÂN QUYỀN TRUY CẬP (RLS Policies cho phép Web đọc/ghi)
-- ---------------------------------------------------------------------
alter table public.roles         enable row level security;
alter table public.admins        enable row level security;
alter table public.accounts      enable row level security;
alter table public.properties    enable row level security;
alter table public.bookings      enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "public_access_roles" on public.roles;
create policy "public_access_roles" on public.roles for all using (true) with check (true);

drop policy if exists "public_access_admins" on public.admins;
create policy "public_access_admins" on public.admins for all using (true) with check (true);

drop policy if exists "public_access_accounts" on public.accounts;
create policy "public_access_accounts" on public.accounts for all using (true) with check (true);
