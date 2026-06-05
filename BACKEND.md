# Kulala Backend Setup

## 1. Create Supabase Project

Create a Supabase project, then copy `.env.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

These two values are public browser values from Supabase project settings. Do not put service-role or Stripe secrets in `.env.local`.

## 2. Create Tables And Policies

Run `supabase/schema.sql` in the Supabase SQL editor.

This creates:

- `profiles`
- `stories`
- `favorites`
- `story_progress`
- `subscriptions`
- `story_catalog` metadata view
- `get_story_for_current_user()` premium-safe story RPC
- RLS policies for user-owned data

After running the SQL, verify that direct client reads from `public.stories` are blocked, while `public.story_catalog` is readable.

## 3. Seed Stories

Generate seed SQL from the current local story data:

```bash
npm run supabase:seed
```

Then run `supabase/seed.sql` in the Supabase SQL editor.

Run this again whenever local story data changes:

```bash
npm run supabase:seed
```

## 4. Auth

Supabase auth is used automatically when `.env.local` is configured. Without env vars, the app falls back to local demo auth.

Recommended Supabase Auth settings:

- Enable email/password signups.
- Add your local and production URLs to Auth URL Configuration.
- For local development, allow `http://localhost:5173`.
- For production, set the Site URL to your deployed app URL.

Smoke test:

1. Create an account in the app.
2. Confirm a row appears in `public.profiles`.
3. Save a story and start narration.
4. Confirm rows appear in `public.favorites` and `public.story_progress`.

## 5. Premium Access

Premium body/audio should only be loaded through:

```sql
public.get_story_for_current_user(story_id)
```

Do not expose direct client `select` access to `public.stories`.

Important: files in `public/` are always public. If premium audio needs real protection, upload it to a private Supabase Storage bucket and store only private object paths in the database. Then return signed URLs from a trusted function after checking `public.user_has_premium()`.

For manual testing, grant premium with:

```sql
update public.profiles
set has_premium = true
where email = 'customer@example.com';
```

## 6. Stripe Subscriptions

Edge function templates are included:

- `supabase/functions/create-checkout-session`
- `supabase/functions/stripe-webhook`

Required secrets:

```bash
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID=...
SUPABASE_SERVICE_ROLE_KEY=...
SITE_URL=https://your-site.com
```

Use `supabase/.env.example` as the server-side secrets template. Set these values as Supabase function secrets, not browser env vars.

Deployment outline:

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase secrets set STRIPE_SECRET_KEY=... STRIPE_PRICE_ID=... SITE_URL=...
supabase secrets set STRIPE_WEBHOOK_SECRET=... SUPABASE_SERVICE_ROLE_KEY=...
```

Stripe setup:

1. Create a subscription product and price in Stripe.
2. Put the Stripe price id in `STRIPE_PRICE_ID`.
3. Add a webhook endpoint for `https://<project-ref>.functions.supabase.co/stripe-webhook`.
4. Subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
5. Put the webhook signing secret in `STRIPE_WEBHOOK_SECRET`.

Payment smoke test:

1. Sign in to the app.
2. Open a premium story.
3. Complete Stripe Checkout in test mode.
4. Confirm `public.subscriptions.status` is `active` or `trialing`.
5. Confirm `public.profiles.has_premium` becomes `true`.
6. Reopen the premium story and verify body/audio are available.
