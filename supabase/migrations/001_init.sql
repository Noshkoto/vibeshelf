-- Vibeshelf · Phase 2 schema
-- Run this once in the Supabase SQL Editor.
-- Requires: Authentication > Providers > "Allow anonymous sign-ins" enabled.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  tagline text not null,
  description text not null default '',
  live_url text not null,
  maker_name text not null,
  maker_handle text,
  tools text[] not null default '{}',
  category text not null,
  palette text not null,
  motif text not null,
  cover_url text,
  owner_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists apps_created_at_idx on public.apps (created_at desc);
create index if not exists apps_owner_id_idx on public.apps (owner_id);

create table if not exists public.upvotes (
  app_slug text not null,
  owner_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (app_slug, owner_id)
);

create index if not exists upvotes_slug_idx on public.upvotes (app_slug);

-- Aggregate helper: one row per slug with its live count.
create or replace view public.upvote_counts as
  select app_slug, count(*)::bigint as upvote_count
  from public.upvotes
  group by app_slug;

grant select on public.upvote_counts to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.apps enable row level security;
alter table public.upvotes enable row level security;

-- Apps: public read, authenticated insert of own, delete own.
drop policy if exists "apps_read_all" on public.apps;
create policy "apps_read_all" on public.apps
  for select using (true);

drop policy if exists "apps_insert_own" on public.apps;
create policy "apps_insert_own" on public.apps
  for insert with check (auth.uid() = owner_id);

drop policy if exists "apps_delete_own" on public.apps;
create policy "apps_delete_own" on public.apps
  for delete using (auth.uid() = owner_id);

-- Upvotes: public read, authenticated insert/delete of own.
drop policy if exists "upvotes_read_all" on public.upvotes;
create policy "upvotes_read_all" on public.upvotes
  for select using (true);

drop policy if exists "upvotes_insert_own" on public.upvotes;
create policy "upvotes_insert_own" on public.upvotes
  for insert with check (auth.uid() = owner_id);

drop policy if exists "upvotes_delete_own" on public.upvotes;
create policy "upvotes_delete_own" on public.upvotes
  for delete using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for cover screenshots
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists "covers_authenticated_insert" on storage.objects;
create policy "covers_authenticated_insert" on storage.objects
  for insert with check (bucket_id = 'covers' and auth.uid() is not null);

drop policy if exists "covers_owner_delete" on storage.objects;
create policy "covers_owner_delete" on storage.objects
  for delete using (bucket_id = 'covers' and auth.uid() = owner);
