create extension if not exists pgcrypto;

create table if not exists public.copyright_applications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null default '',
  external_url text not null default '',
  file_hash text not null,
  file_name text not null default '',
  file_type text not null default '',
  file_size bigint not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  certificate_id bigint,
  transaction_hash text,
  reviewer_wallet text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.copyright_applications enable row level security;

drop policy if exists "Public demo can read applications" on public.copyright_applications;
create policy "Public demo can read applications"
on public.copyright_applications
for select
to anon, authenticated
using (true);

drop policy if exists "Public demo can submit pending applications" on public.copyright_applications;
create policy "Public demo can submit pending applications"
on public.copyright_applications
for insert
to anon, authenticated
with check (
  status = 'pending'
  and certificate_id is null
  and transaction_hash is null
  and approved_at is null
);

-- Demo-only public update policy.
-- For a real production app, replace this with a Supabase Edge Function that verifies
-- a MetaMask signature from the reviewer wallet before updating approval fields.
drop policy if exists "Public demo can update review result" on public.copyright_applications;
create policy "Public demo can update review result"
on public.copyright_applications
for update
to anon, authenticated
using (true)
with check (
  status in ('pending', 'approved')
);

create index if not exists copyright_applications_status_created_idx
on public.copyright_applications (status, created_at desc);

