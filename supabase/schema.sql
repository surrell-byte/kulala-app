create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null default 'Dreamer',
  avatar text not null default '🌙',
  age text not null default '6-8',
  bedtime_mood text not null default 'calm',
  preferred_voice text not null default 'female',
  default_sleep_timer integer,
  has_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  story_id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in ('maji', 'bedtime', 'calm', 'classic')),
  sort_order integer not null default 0,
  title text not null,
  cover text not null,
  age text not null,
  read_time text not null,
  category text not null,
  icon text not null,
  featured boolean not null default false,
  is_premium boolean not null default false,
  body text not null,
  moral text,
  audio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stories_collection_idx on public.stories (collection);
create index if not exists stories_featured_idx on public.stories (featured) where featured = true;
create index if not exists stories_sort_order_idx on public.stories (sort_order);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(story_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

create table if not exists public.story_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(story_id) on delete cascade,
  percent integer not null default 0 check (percent >= 0 and percent <= 100),
  sentence_index integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_status_idx on public.subscriptions (user_id, status);

-- Automated updated_at logic
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_stories_updated
  before update on public.stories
  for each row execute function public.handle_updated_at();

create trigger on_subscriptions_updated
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

create or replace view public.story_catalog as
select
  story_id,
  collection,
  sort_order,
  title,
  cover,
  age,
  read_time,
  category,
  icon,
  featured,
  is_premium,
  moral,
  case when is_premium then null else body end as body,
  case when is_premium then null else audio end as audio
from public.stories;

create or replace function public.user_has_premium()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- Performance optimization: check if we even have an authenticated user first
  select case 
    when auth.uid() is null then false
    else (
      exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and has_premium = true
      )
      or exists (
        select 1
        from public.subscriptions
        where user_id = auth.uid()
          -- Include 'past_due' to allow a grace period for payment failures
          and status in ('active', 'trialing', 'past_due')
          and (current_period_end is null or current_period_end > now())
      )
    )
  end;
$$;

create or replace function public.get_story_for_current_user(requested_story_id uuid)
returns table (
  story_id uuid,
  collection text,
  sort_order integer,
  title text,
  cover text,
  age text,
  read_time text,
  category text,
  icon text,
  featured boolean,
  is_premium boolean,
  body text,
  moral text,
  audio text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.story_id,
    s.collection,
    s.sort_order,
    s.title,
    s.cover,
    s.age,
    s.read_time,
    s.category,
    s.icon,
    s.featured,
    s.is_premium,
    case when s.is_premium and not public.user_has_premium() then null else s.body end,
    s.moral,
    case when s.is_premium and not public.user_has_premium() then null else s.audio end
  from public.stories s
  where s.story_id = requested_story_id
    and (s.is_premium = false or auth.uid() is not null);
$$;

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.favorites enable row level security;
alter table public.story_progress enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "profiles are readable by owner" on public.profiles;
create policy "profiles are readable by owner"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles are inserted by owner" on public.profiles;
create policy "profiles are inserted by owner"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles are updated by owner" on public.profiles;
create policy "profiles are updated by owner"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "story catalog is public" on public.stories;
-- Do not create direct client select access on public.stories.
-- Public clients should use public.story_catalog and get_story_for_current_user()
-- so premium body/audio columns can stay protected.

drop policy if exists "favorites are owned by user" on public.favorites;
create policy "favorites are owned by user"
on public.favorites for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "progress is owned by user" on public.story_progress;
create policy "progress is owned by user"
on public.story_progress for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "subscriptions are readable by owner" on public.subscriptions;
create policy "subscriptions are readable by owner"
on public.subscriptions for select
using (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    nickname,
    avatar,
    age,
    bedtime_mood,
    preferred_voice,
    default_sleep_timer
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar', '🌙'),
    coalesce(new.raw_user_meta_data->>'age', '6-8'),
    coalesce(new.raw_user_meta_data->>'bedtime_mood', 'calm'),
    coalesce(new.raw_user_meta_data->>'preferred_voice', 'female'),
    nullif(new.raw_user_meta_data->>'default_sleep_timer', '')::integer
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_profile_entitlement_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow service_role (Dashboard/Admin) to bypass the restriction
  if current_setting('role') = 'service_role' then
    return new;
  end if;

  if old.has_premium is distinct from new.has_premium then
    new.has_premium := old.has_premium;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_entitlement_self_update on public.profiles;
create trigger prevent_profile_entitlement_self_update
before update on public.profiles
for each row execute function public.prevent_profile_entitlement_self_update();

grant select on public.story_catalog to anon, authenticated;
grant execute on function public.get_story_for_current_user(uuid) to anon, authenticated;
grant execute on function public.user_has_premium() to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update on public.story_progress to authenticated;
grant select on public.subscriptions to authenticated;
