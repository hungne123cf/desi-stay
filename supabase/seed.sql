-- =====================================================================
-- YuvaStays – OPTIONAL sample listings for demo / staging.
-- Do NOT run on the production database of a real client.
-- Images are Unsplash placeholders: replace with real photos via /admin.
-- =====================================================================

insert into public.properties
  (title, slug, description, address, city, area, nearby_university, distance_to_campus,
   room_type, gender, food_type, price_per_month_inr, security_deposit_inr, token_deposit_inr,
   highlights, amenities, images, curfew_time, available_beds, is_verified, is_zero_brokerage,
   is_published, landlord_name, landlord_whatsapp)
values
(
  'The Elite Heights – Boys PG & Co-Living', 'elite-heights-boys-pg',
  'Fully furnished co-living for students with study desks, fibre internet and three pure-veg meals a day.',
  '4th Cross, Koramangala 5th Block', 'Bengaluru', 'Koramangala',
  'Christ University (Central Campus)', '450 m (6 min walk)',
  'double', 'boys', 'pure_veg', 12500, 15000, 2000,
  array['Pure veg mess (3 meals/day)', '6 min walk to Christ University', 'Attached washroom'],
  array['High-speed WiFi', 'Air conditioner', 'Attached bathroom', 'Study table', 'Housekeeping', 'Laundry', 'Power backup', 'CCTV'],
  array['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'],
  '10:30 PM', 3, true, true, true, 'Sample Landlord', '+910000000000'
),
(
  'Aura Blossom – Girls Residency', 'aura-blossom-girls-residency',
  'Safe residency for female students with a resident warden, quiet study room and veg/Jain menu.',
  'FC Road, Shivajinagar', 'Pune', 'Shivajinagar',
  'Fergusson College', '300 m (4 min walk)',
  'single', 'girls', 'jain_available', 16000, 20000, 2500,
  array['Female warden on site', 'Jain & pure veg menu', 'Private room'],
  array['High-speed WiFi', 'Air conditioner', 'Attached bathroom', 'Study hall', 'Daily cleaning', 'Washing machine'],
  array['https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'],
  '10:00 PM', 2, true, true, true, 'Sample Landlord', '+910000000000'
),
(
  'North Campus Scholar Suites – Co-Ed', 'north-campus-scholar-suites',
  'Modern co-ed living near DU North Campus with community lounge and flexible meal plans.',
  'Hudson Lane, GTB Nagar', 'Delhi NCR', 'GTB Nagar',
  'Delhi University (North Campus)', '600 m (8 min walk)',
  'double', 'all', 'non_veg', 11000, 11000, 1500,
  array['Hudson Lane location', 'Veg & non-veg meals', 'Maintenance included'],
  array['High-speed WiFi', 'Air conditioner', 'Attached bathroom', 'Lounge', 'Kitchenette', 'Laundry'],
  array['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
  '11:00 PM', 5, true, true, true, 'Sample Landlord', '+910000000000'
);
