DROP TABLE IF EXISTS public.bookings;
DROP TABLE IF EXISTS public.resources;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.resources(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL,
 category text NOT NULL CHECK(category IN('Equipment','Workers','Seeds','Irrigation','Fertilizer','Services')),
 description text, price numeric NOT NULL DEFAULT 0, price_unit text NOT NULL DEFAULT 'service',
 latitude double precision NOT NULL, longitude double precision NOT NULL, location_text text,
 rating numeric(2,1) NOT NULL DEFAULT 5.0, available boolean NOT NULL DEFAULT true,
 provider_name text NOT NULL, provider_phone text, image_url text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
 farmer_name text NOT NULL, farmer_phone text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','accepted','rejected','completed')),
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX resources_category_idx ON public.resources(category);
CREATE INDEX resources_available_idx ON public.resources(available);
CREATE INDEX bookings_resource_idx ON public.bookings(resource_id);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read resources" ON public.resources FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY "public can insert resources" ON public.resources FOR INSERT TO anon,authenticated WITH CHECK(true);
CREATE POLICY "public can insert bookings" ON public.bookings FOR INSERT TO anon,authenticated WITH CHECK(true);

INSERT INTO public.resources(title,category,description,price,price_unit,latitude,longitude,location_text,rating,available,provider_name,provider_phone) VALUES
('Ravi Tractor Service','Equipment','Tractor with operator for field preparation.',1200,'day',9.9312,76.2673,'Kochi, Kerala',4.7,true,'Ravi','+91 90000 11111'),
('GreenField Irrigation Pump','Irrigation','Portable irrigation pump available for farm use.',500,'day',9.9500,76.2900,'Kochi, Kerala',4.5,true,'GreenField','+91 90000 22222'),
('Farm Labour Team','Workers','Local agricultural workers for planting and harvesting.',800,'day',9.9100,76.2500,'Kochi, Kerala',4.8,true,'Farm Labour Team','+91 90000 33333'),
('Healthy Seeds Store','Seeds','Seasonal vegetable and crop seeds.',120,'item',9.9400,76.2750,'Kochi, Kerala',4.6,true,'Healthy Seeds','+91 90000 44444');
