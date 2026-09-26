# AgriConnect

## Setup
npm install

Copy `.env.local.example` to `.env.local` and add your Supabase URL and anon key.

Run `supabase/schema.sql` in Supabase SQL Editor.

Then:
npm run dev

## Vercel
Add these Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Push changes to GitHub:
git add .
git commit -m "Update AgriConnect"
git push origin main

If GitHub is connected to Vercel, Vercel automatically deploys the new commit.

## Note
The included Supabase schema resets the prototype `resources` and `bookings` tables. Do not run it on a database containing data you need to keep.
