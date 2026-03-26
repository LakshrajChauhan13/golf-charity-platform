-- ============================================================
-- GolfGives — Supabase SQL Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id                              uuid primary key references auth.users(id) on delete cascade,
  full_name                       text,
  avatar_url                      text,
  subscription_status             text not null default 'inactive'
                                    check (subscription_status in ('active','trialing','past_due','canceled','inactive')),
  subscription_period             text check (subscription_period in ('monthly','yearly')),
  stripe_customer_id              text,
  stripe_subscription_id          text,
  subscription_current_period_end timestamptz,
  charity_id                      uuid,
  charity_percentage              integer not null default 10 check (charity_percentage between 10 and 50),
  is_admin                        boolean not null default false,
  created_at                      timestamptz not null default now()
);

-- Auto-create profile on new user sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. CHARITIES
-- ============================================================
create table if not exists public.charities (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  description      text not null,
  image_url        text,
  min_contribution integer not null default 10 check (min_contribution >= 10),
  is_featured      boolean not null default false,
  total_raised     numeric(12,2) not null default 0,
  created_at       timestamptz not null default now()
);

-- FK from profiles to charities
alter table public.profiles
  add constraint fk_profiles_charity
  foreign key (charity_id) references public.charities(id) on delete set null;

-- ============================================================
-- 3. SCORES  (Rolling-5 logic enforced by trigger)
-- ============================================================
create table if not exists public.scores (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  score      integer not null check (score between 1 and 45),
  date       date not null,
  created_at timestamptz not null default now()
);

create index if not exists scores_user_date_idx on public.scores(user_id, date desc);

-- Trigger: keep only 5 most recent scores per user
create or replace function public.enforce_rolling_five()
returns trigger language plpgsql security definer as $$
declare
  excess_ids uuid[];
begin
  select array_agg(id)
  into excess_ids
  from (
    select id
    from public.scores
    where user_id = new.user_id
    order by date desc, created_at desc
    offset 5
  ) sub;

  if excess_ids is not null then
    delete from public.scores where id = any(excess_ids);
  end if;

  return new;
end;
$$;

drop trigger if exists rolling_five_trigger on public.scores;
create trigger rolling_five_trigger
  after insert on public.scores
  for each row execute procedure public.enforce_rolling_five();

-- ============================================================
-- 4. DRAWS
-- ============================================================
create table if not exists public.draws (
  id                       uuid primary key default uuid_generate_v4(),
  draw_date                date not null,
  winning_numbers          integer[],
  status                   text not null default 'upcoming'
                             check (status in ('upcoming','simulated','published')),
  total_pool               numeric(12,2) not null default 0,
  jackpot_rollover         numeric(12,2) not null default 0,
  active_subscriber_count  integer not null default 0,
  created_at               timestamptz not null default now()
);

create index if not exists draws_status_date_idx on public.draws(status, draw_date desc);

-- ============================================================
-- 5. WINNERS
-- ============================================================
create table if not exists public.winners (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  draw_id      uuid not null references public.draws(id) on delete cascade,
  tier         integer not null check (tier in (3,4,5)),
  prize_amount numeric(12,2) not null default 0,
  proof_url    text,
  status       text not null default 'pending'
                 check (status in ('pending','verified','paid')),
  created_at   timestamptz not null default now(),
  unique (user_id, draw_id, tier)
);

create index if not exists winners_user_idx   on public.winners(user_id);
create index if not exists winners_draw_idx   on public.winners(draw_id);
create index if not exists winners_status_idx on public.winners(status);

-- ============================================================
-- 6. ADMIN HELPER FUNCTION
-- Using security definer avoids recursive RLS lookups
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
drop policy if exists "Users can view their own profile"  on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles"       on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (public.is_admin());

-- RPC: fetch all active subscribers' scores (bypasses RLS via SECURITY DEFINER)
create or replace function public.get_active_scores()
returns table(user_id uuid, score integer, date date)
language sql security definer stable as $$
  select s.user_id, s.score, s.date
  from public.scores s
  inner join public.profiles p on p.id = s.user_id
  where p.subscription_status = 'active'
  order by s.date desc;
$$;

-- Scores
alter table public.scores enable row level security;
drop policy if exists "Users can manage their own scores" on public.scores;

create policy "Users can manage their own scores"
  on public.scores for all using (auth.uid() = user_id);

-- Charities (public read, admin write)
alter table public.charities enable row level security;
drop policy if exists "Anyone can view charities"    on public.charities;
drop policy if exists "Admins can manage charities"  on public.charities;

create policy "Anyone can view charities"
  on public.charities for select using (true);
create policy "Admins can manage charities"
  on public.charities for all using (public.is_admin());

-- Draws (public read for non-draft, admin full access)
alter table public.draws enable row level security;
drop policy if exists "Anyone can view published draws" on public.draws;
drop policy if exists "Admins can manage draws"         on public.draws;

create policy "Anyone can view published draws"
  on public.draws for select
  using (status in ('published', 'upcoming') or public.is_admin());
create policy "Admins can manage draws"
  on public.draws for all using (public.is_admin());

-- Winners
alter table public.winners enable row level security;
drop policy if exists "Users can view their own winnings"    on public.winners;
drop policy if exists "Users can update proof on own winnings" on public.winners;
drop policy if exists "Admins can manage all winners"        on public.winners;

create policy "Users can view their own winnings"
  on public.winners for select using (auth.uid() = user_id);
create policy "Users can update proof on own winnings"
  on public.winners for update using (auth.uid() = user_id);
create policy "Admins can manage all winners"
  on public.winners for all using (public.is_admin());

-- ============================================================
-- 8. STORAGE BUCKET — winner proofs
-- NOTE: Storage *object* policies must be added via the
-- Supabase Dashboard → Storage → winner-proofs → Policies
-- ============================================================
insert into storage.buckets (id, name, public)
values ('winner-proofs', 'winner-proofs', false)
on conflict (id) do nothing;

-- ============================================================
-- 9. SEED DATA — Sample charities
-- ============================================================
insert into public.charities (name, description, image_url, min_contribution, is_featured, total_raised) values
  ('Children in Need',  'Raising funds to transform the lives of disadvantaged children across the UK.', null, 10, true,  12500.00),
  ('Macmillan Cancer',  'Providing physical, financial and emotional support to people living with cancer.', null, 10, true,  8400.00),
  ('Age UK',            'Supporting older people to love later life through vital services and campaigning.', null, 10, false, 3200.00),
  ('Mind UK',           'Providing advice and support to empower anyone experiencing a mental health problem.', null, 10, false, 5700.00),
  ('Comic Relief',      'Using the power of entertainment to change lives worldwide.', null, 10, false, 2100.00)
on conflict do nothing;
