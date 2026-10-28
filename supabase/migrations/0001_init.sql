-- =====================================================================
-- YuvaStays – Initial schema
-- Run once in Supabase Dashboard > SQL Editor (or `supabase db push`).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('student', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type room_type as enum ('single', 'double', 'triple', 'studio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gender_pref as enum ('all', 'boys', 'girls');
exception when duplicate_object then null; end $$;

do $$ begin
  create type food_type as enum ('pure_veg', 'non_veg', 'jain_available', 'self_cook');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'token_paid', 'confirmed', 'cancelled', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('razorpay', 'pay_on_visit');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Profiles (1-1 with auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  avatar_url  text,
  phone       text,
  college     text,
  role        user_role not null default 'student',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile whenever a user signs up (Google or email)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used by RLS policies. SECURITY DEFINER avoids recursive RLS on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Prevent users from promoting themselves to admin
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------
create table if not exists public.properties (
  id                   uuid primary key default gen_random_uuid(),
  code                 text unique not null,
  title                text not null check (char_length(title) between 3 and 160),
  slug                 text unique not null,
  description          text not null default '',
  address              text not null default '',
  city                 text not null,
  area                 text not null default '',
  nearby_university    text not null default '',
  distance_to_campus   text not null default '',
  room_type            room_type not null default 'double',
  gender               gender_pref not null default 'all',
  food_type            food_type not null default 'pure_veg',
  price_per_month_inr  integer not null check (price_per_month_inr >= 0),
  security_deposit_inr integer not null default 0 check (security_deposit_inr >= 0),
  token_deposit_inr    integer not null default 0 check (token_deposit_inr >= 0),
  highlights           text[] not null default '{}',
  amenities            text[] not null default '{}',
  images               text[] not null default '{}',
  curfew_time          text,
  latitude             double precision,
  longitude            double precision,
  available_beds       integer not null default 0 check (available_beds >= 0),
  is_verified          boolean not null default false,
  is_zero_brokerage    boolean not null default true,
  is_published         boolean not null default false,
  landlord_name        text not null default '',
  landlord_whatsapp    text not null default '',
  created_by           uuid references auth.users(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists properties_published_idx on public.properties (is_published, city);

create sequence if not exists public.property_code_seq start 101;

create or replace function public.properties_before_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' and (new.code is null or new.code = '') then
    new.code := 'YS-' || nextval('public.property_code_seq');
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists properties_before_write on public.properties;
create trigger properties_before_write
  before insert or update on public.properties
  for each row execute function public.properties_before_write();

-- ---------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  reference            text unique not null default ('BK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  property_id          uuid not null references public.properties(id) on delete restrict,
  user_id              uuid not null references auth.users(id) on delete cascade,
  student_name         text not null check (char_length(student_name) between 2 and 120),
  student_email        text not null,
  student_whatsapp     text not null,
  college              text not null default '',
  move_in_date         date not null,
  room_type            room_type not null,
  token_amount_inr     integer not null check (token_amount_inr >= 0),
  status               booking_status not null default 'pending',
  payment_method       payment_method not null default 'pay_on_visit',
  razorpay_order_id    text unique,
  razorpay_payment_id  text unique,
  admin_notes          text not null default '',
  hold_expires_at      timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists bookings_user_idx on public.bookings (user_id, created_at desc);
create index if not exists bookings_property_idx on public.bookings (property_id);

-- Never trust the client for money: copy price data from the property on insert.
create or replace function public.bookings_before_write()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  p public.properties%rowtype;
  hours integer;
begin
  if tg_op = 'INSERT' then
    select * into p from public.properties where id = new.property_id and is_published;
    if not found then
      raise exception 'Property not available';
    end if;
    select hold_hours into hours from public.site_settings where id = 1;
    new.token_amount_inr := p.token_deposit_inr;
    new.room_type        := p.room_type;
    new.hold_expires_at  := now() + make_interval(hours => coalesce(hours, 48));
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bookings_before_write on public.bookings;
create trigger bookings_before_write
  before insert or update on public.bookings
  for each row execute function public.bookings_before_write();

-- ---------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------
create table if not exists public.favorites (
  user_id      uuid not null references auth.users(id) on delete cascade,
  property_id  uuid not null references public.properties(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- ---------------------------------------------------------------------
-- Site settings (single row, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id                     integer primary key default 1 check (id = 1),
  support_whatsapp       text not null default '',
  support_email          text not null default '',
  default_token_inr      integer not null default 2000,
  hold_hours             integer not null default 48,
  updated_at             timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.properties    enable row level security;
alter table public.bookings      enable row level security;
alter table public.favorites     enable row level security;
alter table public.site_settings enable row level security;

-- Profiles
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: update own or admin" on public.profiles;
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- Properties
drop policy if exists "properties: public read published" on public.properties;
create policy "properties: public read published" on public.properties
  for select using (is_published or public.is_admin());

drop policy if exists "properties: admin insert" on public.properties;
create policy "properties: admin insert" on public.properties
  for insert with check (public.is_admin());

drop policy if exists "properties: admin update" on public.properties;
create policy "properties: admin update" on public.properties
  for update using (public.is_admin());

drop policy if exists "properties: admin delete" on public.properties;
create policy "properties: admin delete" on public.properties
  for delete using (public.is_admin());

-- Bookings: students create & read their own; only admins update/delete.
drop policy if exists "bookings: read own or admin" on public.bookings;
create policy "bookings: read own or admin" on public.bookings
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "bookings: student insert own pending" on public.bookings;
create policy "bookings: student insert own pending" on public.bookings
  for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    and razorpay_payment_id is null
  );

drop policy if exists "bookings: admin update" on public.bookings;
create policy "bookings: admin update" on public.bookings
  for update using (public.is_admin());

drop policy if exists "bookings: admin delete" on public.bookings;
create policy "bookings: admin delete" on public.bookings
  for delete using (public.is_admin());

-- Favorites
drop policy if exists "favorites: own" on public.favorites;
create policy "favorites: own" on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Settings: public read (WhatsApp number shown on site), admin write
drop policy if exists "settings: public read" on public.site_settings;
create policy "settings: public read" on public.site_settings
  for select using (true);

drop policy if exists "settings: admin update" on public.site_settings;
create policy "settings: admin update" on public.site_settings
  for update using (public.is_admin());

-- =====================================================================
-- Storage: property images (public read, admin write)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "property-images: public read" on storage.objects;
create policy "property-images: public read" on storage.objects
  for select using (bucket_id = 'property-images');

drop policy if exists "property-images: admin insert" on storage.objects;
create policy "property-images: admin insert" on storage.objects
  for insert with check (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "property-images: admin update" on storage.objects;
create policy "property-images: admin update" on storage.objects
  for update using (bucket_id = 'property-images' and public.is_admin());

drop policy if exists "property-images: admin delete" on storage.objects;
create policy "property-images: admin delete" on storage.objects
  for delete using (bucket_id = 'property-images' and public.is_admin());
