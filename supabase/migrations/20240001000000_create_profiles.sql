-- ─── Profiles Table ──────────────────────────────────────────────────────────
-- Extends Supabase auth.users with public profile data.
-- One row per user, id is a foreign key to auth.users.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  name        text,
  city        text,
  church      text,
  avatar_url  text
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;

-- Authenticated users can read any profile
create policy "Authenticated users can read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Users can only insert their own profile row
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Users can only update their own profile row
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── Auto-create profile on sign-up ──────────────────────────────────────────
-- Trigger fires after a new row is inserted into auth.users (any sign-up method
-- including Google OAuth) and creates the matching profile row automatically.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
