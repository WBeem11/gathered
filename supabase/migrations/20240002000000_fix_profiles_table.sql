-- Fix profiles table: drop auth.users FK (app uses NextAuth/Prisma, not Supabase Auth)
-- and change id to text to match Prisma's cuid() IDs.

drop table if exists public.profiles;

create table public.profiles (
  id         text primary key,
  created_at timestamptz not null default now(),
  name       text,
  city       text,
  church     text,
  avatar_url text
);

alter table public.profiles enable row level security;

create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated with check (auth.uid()::text = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using  (auth.uid()::text = id)
  with check (auth.uid()::text = id);
