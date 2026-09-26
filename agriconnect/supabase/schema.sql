create extension if not exists pgcrypto;


-- ==========================================
-- RESOURCES TABLE
-- ==========================================

create table if not exists public.resources (

  id uuid primary key default gen_random_uuid(),

  title text not null,

  category text not null check (
    category in (
      'Equipment',
      'Workers',
      'Seeds',
      'Irrigation',
      'Fertilizer',
      'Services'
    )
  ),

  description text,

  price numeric not null default 0,

  price_unit text not null default 'service',

  latitude double precision not null,

  longitude double precision not null,

  location_text text,

  rating numeric(2,1) not null default 5.0,

  available boolean not null default true,

  provider_name text not null,

  provider_phone text,

  image_url text,

  created_at timestamptz not null default now()
);


-- ==========================================
-- BOOKINGS TABLE
-- ==========================================

create table if not exists public.bookings (

  id uuid primary key default gen_random_uuid(),

  resource_id uuid not null
    references public.resources(id)
    on delete cascade,

  farmer_name text not null,

  farmer_phone text not null,

  status text not null default 'pending'
  check (
    status in (
      'pending',
      'accepted',
      'rejected',
      'completed'
    )
  ),

  created_at timestamptz not null default now()
);


-- ==========================================
-- INDEXES
-- ==========================================

create index if not exists resources_category_idx
on public.resources(category);

create index if not exists resources_available_idx
on public.resources(available);

create index if not exists bookings_resource_idx
on public.bookings(resource_id);


-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

alter table public.resources
enable row level security;

alter table public.bookings
enable row level security;


-- ==========================================
-- RESOURCE POLICIES
-- ==========================================

drop policy if exists "public can read resources"
on public.resources;

create policy "public can read resources"
on public.resources
for select
to anon, authenticated
using (true);


drop policy if exists "public can insert resources"
on public.resources;

create policy "public can insert resources"
on public.resources
for insert
to anon, authenticated
with check (true);


-- ==========================================
-- BOOKING POLICY
-- ==========================================

drop policy if exists "public can insert bookings"
on public.bookings;

create policy "public can insert bookings"
on public.bookings
for insert
to anon, authenticated
with check (true);


-- ==========================================
-- DEMO DATA
-- ==========================================

insert into public.resources
(
  title,
  category,
  description,
  price,
  price_unit,
  latitude,
  longitude,
  location_text,
  rating,
  available,
  provider_name,
  provider_phone
)

values

(
  'Ravi Tractor Service',
  'Equipment',
  'Tractor with operator for field preparation.',
  1200,
  'day',
  9.9312,
  76.2673,
  'Kochi',
  4.7,
  true,
  'Ravi',
  '+91 90000 11111'
),

(
  'GreenField Irrigation Pump',
  'Irrigation',
  'Portable irrigation pump available for farm use.',
  500,
  'day',
  9.9500,
  76.2900,
  'Kochi',
  4.5,
  true,
  'GreenField',
  '+91 90000 22222'
),

(
  'Farm Labour Team',
  'Workers',
  'Local agricultural workers for planting and harvesting.',
  800,
  'day',
  9.9100,
  76.2500,
  'Kochi',
  4.8,
  true,
  'Farm Labour Team',
  '+91 90000 33333'
),

(
  'Healthy Seeds Store',
  'Seeds',
  'Seasonal vegetable and crop seeds.',
  120,
  'item',
  9.9400,
  76.2750,
  'Kochi',
  4.6,
  true,
  'Healthy Seeds',
  '+91 90000 44444'
);