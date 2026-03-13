-- Recreate posts table with proper snake_case schema.
-- Drops the old Prisma-managed "Post" table (capital P, quoted).

drop table if exists public."Post" cascade;
drop table if exists public.posts cascade;

create table public.posts (
  id           text primary key,
  user_id      text not null references public."User" (id) on delete cascade,
  content      text not null,
  category     text not null,
  location     text,
  is_anonymous boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.posts enable row level security;

-- Anyone (including anon) can read posts
create policy "Anyone can read posts"
  on public.posts for select
  using (true);

-- Only authenticated users can insert their own posts
create policy "Authenticated users can create posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid()::text = user_id);

-- Users can only update their own posts
create policy "Users can update their own posts"
  on public.posts for update
  to authenticated
  using  (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

-- Users can only delete their own posts
create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid()::text = user_id);
