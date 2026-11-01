-- =====================================================================
-- UniStay Global – Complete Database Schema & Seed Data
-- Copy toàn bộ nội dung file này dán vào:
-- Supabase Dashboard > SQL Editor > New query > Bấm RUN (F5)
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
  ('admin', 'Quản trị viên (Admin)', 'Toàn quyền quản lý hệ thống, kho phòng, duyệt cọc và cấu hình ngân hàng', array['manage_all', 'manage_properties', 'manage_bookings', 'manage_accounts', 'manage_settings']),
  ('staff', 'Nhân viên hỗ trợ (Staff)', 'Hỗ trợ khách hàng, chat trực tiếp và quản lý phòng trọ', array['manage_properties', 'manage_bookings', 'chat_support']),
  ('landlord', 'Chủ nhà / Đối tác', 'Đăng tin phòng trọ và tiếp nhận sinh viên hẹn xem', array['manage_own_properties', 'view_own_bookings']),
  ('student', 'Sinh viên / Khách thuê', 'Tìm kiếm phòng trọ, đặt cọc giữ chỗ VietQR và chat hỗ trợ', array['view_properties', 'create_booking'])
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  permissions = excluded.permissions;

-- ---------------------------------------------------------------------
-- 2. BẢNG ADMINS (Danh sách Quản trị viên hệ thống)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  id           text primary key default gen_random_uuid()::text,
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
    'https://lh3.googleusercontent.com/a/ACg8ocLkwpBVjQWQrLm4AT7bBEJYVC2LnbmKztX_PWiRRchhmM_FhTfT=s384-c',
    'super_admin',
    true,
    'Tài khoản Google Admin chính chủ'
  ),
  (
    'admin@unistay.com',
    'UniStay Super Admin',
    '+84 909 888 777',
    null,
    'super_admin',
    true,
    'Tài khoản quản trị dự phòng'
  )
on conflict (email) do update set
  full_name = excluded.full_name,
  admin_level = excluded.admin_level,
  is_active = excluded.is_active;

-- ---------------------------------------------------------------------
-- 3. BẢNG ACCOUNTS (Tài khoản người dùng & Phân quyền)
-- ---------------------------------------------------------------------
create table if not exists public.accounts (
  id             text primary key default ('acc-' || extract(epoch from now())::bigint),
  email          text unique not null,
  name           text not null,
  full_name      text,
  password_hash  text,
  avatar_url     text,
  avatar         text,
  phone          text,
  college        text,
  role           text not null default 'student',
  role_code      text not null default 'student',
  auth_provider  text not null default 'google',
  is_verified    boolean not null default true,
  is_suspended   boolean not null default false,
  suspended_at   timestamptz,
  last_login_at  timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

insert into public.accounts (id, email, name, full_name, phone, college, role, role_code, avatar, avatar_url)
values
  (
    'acc-admin-1',
    'truongvantuan43344@gmail.com',
    'Trương Hùng (Admin)',
    'Trương Hùng (Admin)',
    '0901234567',
    'ĐH Cần Thơ (CTU)',
    'admin',
    'admin',
    'https://lh3.googleusercontent.com/a/ACg8ocLkwpBVjQWQrLm4AT7bBEJYVC2LnbmKztX_PWiRRchhmM_FhTfT=s384-c',
    'https://lh3.googleusercontent.com/a/ACg8ocLkwpBVjQWQrLm4AT7bBEJYVC2LnbmKztX_PWiRRchhmM_FhTfT=s384-c'
  ),
  (
    'acc-admin-2',
    'admin@unistay.com',
    'UniStay Super Admin',
    'UniStay Super Admin',
    '0909888777',
    'Ban Quản Trị Hệ Thống',
    'admin',
    'admin',
    null,
    null
  ),
  (
    'acc-student-k18',
    'hungtce181568@fpt.edu.vn',
    'Truong Hung (K18 CT)',
    'Truong Hung (K18 CT)',
    '123456789',
    'ĐH FPT Cần Thơ',
    'student',
    'student',
    'https://lh3.googleusercontent.com/a/ACg8ocLcJeUqcDC3Ka0yx4uDj5bjHvCuaOX-4di4830y2-VhEkoYR7I=s384-c',
    'https://lh3.googleusercontent.com/a/ACg8ocLcJeUqcDC3Ka0yx4uDj5bjHvCuaOX-4di4830y2-VhEkoYR7I=s384-c'
  )
on conflict (email) do update set
  name = excluded.name,
  role = excluded.role,
  role_code = excluded.role_code;

-- ---------------------------------------------------------------------
-- 4. BẢNG PROPERTIES (Kho phòng trọ & Căn hộ sinh viên)
-- ---------------------------------------------------------------------
create table if not exists public.properties (
  id                   text primary key,
  code                 text unique not null,
  title                text not null,
  slug                 text unique not null,
  description          text not null default '',
  address              text not null default '',
  city                 text not null,
  country              text not null default 'Việt Nam',
  area                 text not null default '',
  nearby_university    text not null default '',
  distance_to_campus   text not null default '',
  room_type            text not null default 'studio',
  gender               text not null default 'all',
  food_preference      text not null default 'self_cook',
  price_per_month_usd  numeric(10,2) not null default 100,
  security_deposit_usd numeric(10,2) not null default 100,
  token_deposit_usd    numeric(10,2) not null default 20,
  highlights           text[] not null default '{}',
  amenities            text[] not null default '{}',
  images               text[] not null default '{}',
  curfew_time          text not null default 'Giờ giấc tự do 24/7 (Khóa vân tay)',
  available_beds       integer not null default 2,
  is_verified          boolean not null default true,
  is_zero_brokerage    boolean not null default true,
  is_published         boolean not null default true,
  is_sold_out          boolean not null default false,
  is_deleted           boolean not null default false,
  deleted_at           timestamptz,
  rating               numeric(3,2) not null default 0,
  reviews_count        integer not null default 0,
  landlord_name        text not null default '',
  landlord_contact     text not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Nạp sẵn 6 phòng trọ thực tế, xác thực cho sinh viên
insert into public.properties (
  id, code, title, slug, address, city, country, area, nearby_university, distance_to_campus,
  room_type, gender, food_preference, price_per_month_usd, security_deposit_usd, token_deposit_usd,
  images, description, highlights, amenities, curfew_time, available_beds, is_verified, is_zero_brokerage,
  is_published, landlord_name, landlord_contact, rating, reviews_count
)
values
  (
    'prop-1793242710688',
    'CT-101',
    'Căn hộ sinh viên cao cấp',
    'can-ho-sinh-vien-ctu-01',
    'KDC ĐH Cần Thơ, Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, Cần Thơ',
    'Cần Thơ',
    'Việt Nam',
    'Quận Ninh Kiều',
    'ĐH Cần Thơ (CTU - Khu II Đường 3/2)',
    '300m (4 phút đi bộ)',
    'studio',
    'all',
    'self_cook',
    118,
    118,
    20,
    array[
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    'Phòng trọ cao cấp full nội thất ngay cổng B ĐH Cần Thơ. Giờ giấc tự do 24/7, khóa vân tay, có máy lạnh Inverter, tủ lạnh, bếp riêng khép kín.',
    array['0% Phí môi giới làm việc trực tiếp', 'Gần ĐH Cần Thơ (CTU - Khu II Đường 3/2) (300m (4 phút đi bộ))', 'Giờ giấc tự do 24/7 (Khóa vân tay)'],
    array['Wifi tốc độ cao', 'Máy lạnh Inverter', 'Vệ sinh khép kín', 'Bếp riêng tự nấu', 'Bãi đỗ xe an ninh', 'Tủ lạnh', 'Máy giặt chung'],
    'Giờ giấc tự do 24/7 (Khóa vân tay)',
    2,
    true,
    true,
    true,
    'Trương Hùng',
    '0901234567',
    5,
    1
  ),
  (
    'prop-vn-ct-2',
    'CT-102',
    'FPT Smart Duplex – Phòng gác lửng KDC Hồng Phát gần ĐH FPT Cần Thơ',
    'fpt-smart-duplex-kdc-hong-phat-can-tho',
    'Đường số 6, KDC Hồng Phát, Phường An Bình, Quận Ninh Kiều, Cần Thơ',
    'Cần Thơ',
    'Việt Nam',
    'KDC Hồng Phát (P. An Bình)',
    'ĐH FPT Cần Thơ (Cầu Rau Răm - Nguyễn Văn Cừ)',
    '500m (2 phút đi xe máy)',
    'double',
    'all',
    'self_cook',
    126,
    126,
    20,
    array[
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    'Phòng Duplex gác lửng trần cao thoáng mát nằm trong KDC Hồng Phát yên tĩnh, đường nhựa rộng 12m có vỉa hè cây xanh, cực kỳ thuận tiện cho sinh viên ĐH FPT Cần Thơ và ĐH Nam Cần Thơ. Ở được 2-3 bạn thoải mái.',
    array['0% Phí môi giới làm việc trực tiếp', 'Cách ĐH FPT Cần Thơ & ĐH Nam Cần Thơ chỉ 500m', 'Thiết kế gác lửng rộng rãi, ở được 2-3 sinh viên', 'Giờ giấc tự do 24/7 (Khóa vân tay)'],
    array['Wifi Mesh riêng từng tầng', 'Máy lạnh Inverter', 'Gác lửng lót sàn gỗ', 'Tủ quần áo & bàn học dài', 'Bếp nấu ăn riêng', 'Khóa vân tay 2 lớp'],
    'Giờ giấc tự do 24/7 (Khóa vân tay)',
    2,
    true,
    true,
    true,
    'Chị Lan (Chủ nhà KDC Hồng Phát)',
    '0901234567',
    4.9,
    24
  ),
  (
    'prop-vn-ct-3',
    'CT-103',
    'An Khánh Studio – Phòng trọ sinh viên tiện nghi gần ĐH Y Dược Cần Thơ',
    'an-khanh-studio-gan-dh-y-duoc-can-tho',
    'Đường số 3, KDC 91B, Phường An Khánh, Quận Ninh Kiều, Cần Thơ',
    'Cần Thơ',
    'Việt Nam',
    'KDC 91B (P. An Khánh)',
    'ĐH Y Dược Cần Thơ (CTUMP)',
    '400m (5 phút đi bộ)',
    'single',
    'all',
    'self_cook',
    98,
    98,
    20,
    array[
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    'Phòng trọ một người hoặc hai bạn yên tĩnh, gần trường ĐH Y Dược Cần Thơ. Đầy đủ máy lạnh, wifi mạnh, bàn học, cửa sổ thoáng mát, khu an ninh tri thức cao.',
    array['0% Phí môi giới làm việc trực tiếp', '5 phút đi bộ tới cổng ĐH Y Dược Cần Thơ', 'Khu dân cư 91B an ninh, yên tĩnh học tập', 'Giờ giấc tự do 24/7 (Khóa vân tay)'],
    array['Wifi cáp quang tốc độ cao', 'Máy lạnh Inverter', 'Vệ sinh khép kín', 'Bàn ghế học tập', 'Bãi đỗ xe an ninh', 'Camera hành lang 24/7'],
    'Giờ giấc tự do 24/7 (Khóa vân tay)',
    1,
    true,
    true,
    true,
    'Bác Năm (Chủ trọ An Khánh)',
    '0901234567',
    4.8,
    18
  ),
  (
    'prop-vn-ct-4',
    'CT-104',
    'Nam Cần Thơ Deluxe – Căn hộ mini gần ĐH Nam Cần Thơ (DNC)',
    'nam-can-tho-deluxe-can-ho-mini-dnc',
    'Đường Nguyễn Văn Cừ nối dài, Phường An Bình, Quận Ninh Kiều, Cần Thơ',
    'Cần Thơ',
    'Việt Nam',
    'Đường Nguyễn Văn Cừ nối dài',
    'ĐH Nam Cần Thơ (DNC)',
    '600m (3 phút đi xe)',
    'studio',
    'all',
    'self_cook',
    87,
    87,
    20,
    array[
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    'Phòng mới tinh 100%, có máy lạnh, kệ bếp nấu ăn, ban công phơi đồ riêng biệt, giá cực kỳ sinh viên dành cho các bạn ĐH Nam Cần Thơ và FPT.',
    array['0% Phí môi giới làm việc trực tiếp', 'Sát ĐH Nam Cần Thơ (DNC) & BV Nam Cần Thơ', 'Ban công phơi đồ riêng, bếp nấu ăn thoáng mùi', 'Giờ giấc tự do 24/7'],
    array['Wifi tốc độ cao', 'Máy lạnh', 'Ban công riêng', 'Bếp nấu ăn riêng', 'Nhà để xe có khóa vân tay'],
    'Giờ giấc tự do 24/7 (Khóa vân tay)',
    2,
    true,
    true,
    true,
    'Cô Út (Chủ trọ An Bình)',
    '0901234567',
    4.9,
    12
  ),
  (
    'prop-vn-hcm-1',
    'SG-105',
    'The Green Studio – Căn hộ dịch vụ cao cấp gần ĐH Bách Khoa TP.HCM',
    'green-studio-bach-khoa-y-duoc-q10',
    'Đường Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh',
    'TP. Hồ Chí Minh',
    'Việt Nam',
    'Quận 10',
    'ĐH Bách Khoa TP.HCM & ĐH Y Dược',
    '350m (4 phút đi bộ)',
    'studio',
    'all',
    'self_cook',
    165,
    165,
    20,
    array[
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee1b40280b89?auto=format&fit=crop&w=1200&q=80'
    ],
    'Phòng studio full nội thất cao cấp: máy lạnh Inverter, máy nước nóng, tủ lạnh, bếp từ riêng biệt, ban công thoáng mát đón nắng. Giờ giấc tự do 24/7, thang máy thẻ từ, không chung chủ.',
    array['0% Phí môi giới làm việc trực tiếp', '4 phút đi bộ tới cổng ĐH Bách Khoa TP.HCM', 'Bếp riêng nấu ăn thoải mái, có ban công lớn', 'Thang máy thẻ từ, hầm để xe bảo vệ 24/7'],
    array['Wifi cáp quang tốc độ cao', 'Máy lạnh & Tủ lạnh Inverter', 'Vệ sinh khép kín nước nóng', 'Bếp từ riêng & hút mùi', 'Thang máy thẻ từ', 'Hầm xe bảo vệ 24/7'],
    'Tự do 24/7 (Thẻ từ thang máy & Camera)',
    2,
    true,
    true,
    true,
    'Anh Minh (Chủ tòa nhà Q.10)',
    '0901234567',
    4.9,
    35
  ),
  (
    'prop-vn-hn-1',
    'HN-106',
    'Sunrise Scholar Box – Ký túc xá Sleepbox tiện nghi Cầu Giấy',
    'sunrise-scholar-dorm-cau-giay',
    'Ngõ 20 Hồ Tùng Mậu, Phường Mai Dịch, Quận Cầu Giấy, Hà Nội',
    'Hà Nội',
    'Việt Nam',
    'Quận Cầu Giấy',
    'ĐH Quốc Gia Hà Nội & ĐH Sư Phạm (Cầu Giấy)',
    '350m (4 phút đi bộ)',
    'shared',
    'all',
    'self_cook',
    71,
    71,
    20,
    array[
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    'Mô hình Sleepbox riêng tư cao cấp: rèm che kín đáo, nệm êm, đèn học, ổ cắm riêng, tủ đồ khóa mã số. Không gian học tập yên tĩnh, trang bị máy lạnh 24/24, máy giặt, máy sấy miễn phí.',
    array['0% Phí môi giới làm việc trực tiếp', 'Sát ĐH Quốc Gia HN, ĐH Sư Phạm & Thương Mại', 'Sleepbox riêng tư, có khóa an toàn', 'Bao trọn chi phí điện nước, wifi, máy giặt'],
    array['Wifi tốc độ cao', 'Máy lạnh 24/24', 'Máy giặt & Máy sấy', 'Bếp chung đầy đủ gia vị', 'Tủ lạnh & Bình nóng lạnh'],
    'Tự do 24/7 (Khóa vân tay)',
    4,
    true,
    true,
    true,
    'Chị Mai (Quản lý KTX Cầu Giấy)',
    '0988776655',
    4.8,
    42
  )
on conflict (id) do update set
  title = excluded.title,
  price_per_month_usd = excluded.price_per_month_usd,
  is_published = excluded.is_published;

-- ---------------------------------------------------------------------
-- 5. BẢNG BOOKINGS (Danh sách Đơn cọc & Hẹn xem phòng)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id                    text primary key,
  reference             text unique not null,
  property_id           text not null,
  property_code         text not null default '',
  property_title        text not null default '',
  user_id               text not null default '',
  student_name          text not null,
  student_email         text not null,
  student_contact       text not null,
  student_whatsapp      text not null default '',
  college               text not null default '',
  move_in_date          text not null,
  visit_time_slot       text not null default '',
  room_type             text not null default 'studio',
  token_amount_usd      numeric(10,2) not null default 20,
  token_amount_local    text not null default '500.000 ₫',
  currency              text not null default 'VND',
  status                text not null default 'pending',
  payment_method        text not null default 'vietqr_bank',
  transaction_reference text,
  receipt_image_url     text,
  transfer_content      text,
  admin_notes           text not null default '',
  is_archived           boolean not null default false,
  archived_at           timestamptz,
  created_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. BẢNG SITE_SETTINGS (Cấu hình hệ thống & STK VietQR)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id                     text primary key default 'default',
  brand_name             text not null default 'UniStay',
  tagline                text not null default 'Phòng Trọ & Căn Hộ Sinh Viên',
  default_currency       text not null default 'VND',
  support_whatsapp       text not null default '0901234567',
  support_email          text not null default 'contact@unistay.vn',
  support_hotline        text not null default '0901234567',
  vietqr_bank_name       text not null default 'Techcombank',
  vietqr_bank_code       text not null default '970407',
  vietqr_account_number  text not null default '19074816556011',
  vietqr_account_holder  text not null default 'TRUONG VAN TUAN',
  default_token_usd      numeric(10,2) not null default 20,
  hold_hours             integer not null default 48,
  updated_at             timestamptz not null default now()
);

insert into public.site_settings (id, brand_name, tagline, default_currency, support_whatsapp, support_email, support_hotline, vietqr_bank_name, vietqr_bank_code, vietqr_account_number, vietqr_account_holder, default_token_usd, hold_hours)
values ('default', 'UniStay', 'Phòng Trọ & Căn Hộ Sinh Viên', 'VND', '0901234567', 'contact@unistay.vn', '0901234567', 'Techcombank', '970407', '19074816556011', 'TRUONG VAN TUAN', 20, 48)
on conflict (id) do update set
  brand_name = excluded.brand_name,
  vietqr_account_number = excluded.vietqr_account_number,
  vietqr_account_holder = excluded.vietqr_account_holder;

-- ---------------------------------------------------------------------
-- 7. BẢNG PROPERTY_REVIEWS (Đánh giá Sao & Phản hồi)
-- ---------------------------------------------------------------------
create table if not exists public.property_reviews (
  id             text primary key,
  booking_id     text,
  property_id    text not null,
  property_code  text not null default '',
  property_title text not null default '',
  user_name      text not null,
  user_email     text not null default '',
  user_avatar    text,
  user_college   text not null default '',
  rating         integer not null default 5 check (rating between 1 and 5),
  comment        text not null,
  admin_reply    text,
  replied_at     timestamptz,
  is_deleted     boolean not null default false,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now()
);

insert into public.property_reviews (
  id, booking_id, property_id, property_code, property_title, user_name, user_email, user_college, rating, comment, admin_reply, replied_at, created_at
)
values
  (
    'rev-ctu-101-seed',
    'BK-SEED-CTU',
    'prop-1793242710688',
    'CT-101',
    'Căn hộ sinh viên cao cấp',
    'Truong Hung (K18 CT)',
    'hungtce181568@fpt.edu.vn',
    'ĐH CT',
    5,
    'Chủ trọ / Quản lý thân thiện, hỗ trợ nhiệt tình',
    'thankyou',
    '2026-10-30T12:39:00.000Z',
    '2026-10-30T12:39:00.000Z'
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 8. BẢNG CHAT_MESSAGES (Tin nhắn Live Chat 2 chiều)
-- ---------------------------------------------------------------------
create table if not exists public.chat_messages (
  id               text primary key,
  conversation_id  text not null,
  student_name     text not null,
  student_email    text not null default '',
  sender_role      text not null default 'student' check (sender_role in ('student', 'admin', 'staff')),
  sender_name      text not null,
  sender_avatar    text,
  text             text not null,
  is_read_by_admin boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. BẢNG WISHLISTS (Danh sách Yêu thích)
-- ---------------------------------------------------------------------
create table if not exists public.wishlists (
  id           text primary key default gen_random_uuid()::text,
  account_id   text not null,
  property_id  text not null,
  created_at   timestamptz not null default now(),
  unique(account_id, property_id)
);

-- ---------------------------------------------------------------------
-- 10. PHÂN QUYỀN TRUY CẬP (RLS Policies cho phép Web đọc/ghi trực tiếp)
-- ---------------------------------------------------------------------
alter table public.roles            enable row level security;
alter table public.admins           enable row level security;
alter table public.accounts         enable row level security;
alter table public.properties       enable row level security;
alter table public.bookings         enable row level security;
alter table public.site_settings    enable row level security;
alter table public.property_reviews enable row level security;
alter table public.chat_messages    enable row level security;
alter table public.wishlists        enable row level security;

drop policy if exists "public_access_roles" on public.roles;
create policy "public_access_roles" on public.roles for all using (true) with check (true);

drop policy if exists "public_access_admins" on public.admins;
create policy "public_access_admins" on public.admins for all using (true) with check (true);

drop policy if exists "public_access_accounts" on public.accounts;
create policy "public_access_accounts" on public.accounts for all using (true) with check (true);

drop policy if exists "public_access_properties" on public.properties;
create policy "public_access_properties" on public.properties for all using (true) with check (true);

drop policy if exists "public_access_bookings" on public.bookings;
create policy "public_access_bookings" on public.bookings for all using (true) with check (true);

drop policy if exists "public_access_site_settings" on public.site_settings;
create policy "public_access_site_settings" on public.site_settings for all using (true) with check (true);

drop policy if exists "public_access_property_reviews" on public.property_reviews;
create policy "public_access_property_reviews" on public.property_reviews for all using (true) with check (true);

drop policy if exists "public_access_chat_messages" on public.chat_messages;
create policy "public_access_chat_messages" on public.chat_messages for all using (true) with check (true);

drop policy if exists "public_access_wishlists" on public.wishlists;
create policy "public_access_wishlists" on public.wishlists for all using (true) with check (true);

-- ---------------------------------------------------------------------
-- 11. STORAGE BUCKET LƯU TRỮ HÌNH ẢNH (Supabase Storage)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public_read_property_images" on storage.objects;
create policy "public_read_property_images"
  on storage.objects for select
  using (bucket_id = 'property-images');

drop policy if exists "public_upload_property_images" on storage.objects;
create policy "public_upload_property_images"
  on storage.objects for insert
  with check (bucket_id = 'property-images');
