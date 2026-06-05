# Kulala Backend Setup

## 1. Create Supabase Project

Create a Supabase project, then copy `.env.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

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

## 3. Seed Stories

Generate seed SQL from the current local story data:

```bash
npm run supabase:seed
```

Then run `supabase/seed.sql` in the Supabase SQL editor.

## 4. Auth

Supabase auth is used automatically when `.env.local` is configured. Without env vars, the app falls back to local demo auth.

## 5. Premium Access

Premium body/audio should only be loaded through:

```sql
public.get_story_for_current_user(story_id)
```

Do not expose direct client `select` access to `public.stories`.

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

Deploy the functions with the Supabase CLI after configuring Stripe.

