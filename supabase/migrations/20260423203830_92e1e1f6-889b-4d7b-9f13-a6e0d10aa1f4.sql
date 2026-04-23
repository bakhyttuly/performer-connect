-- 1) Verification status enum
do $$ begin
  create type public.verification_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- 2) Add columns to performers
alter table public.performers
  add column if not exists verification_status public.verification_status not null default 'pending',
  add column if not exists rejection_reason text;

-- Backfill: any existing rows considered approved + published
update public.performers
set verification_status = 'approved'
where verification_status = 'pending' and is_verified = true;

-- 3) Trigger: auto-publish on approved, unpublish otherwise
create or replace function public.sync_performer_publication()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verification_status = 'approved' then
    new.is_published := true;
    new.is_verified := true;
  else
    new.is_published := false;
    new.is_verified := false;
  end if;
  return new;
end;
$$;

drop trigger if exists performers_sync_publication on public.performers;
create trigger performers_sync_publication
before insert or update of verification_status on public.performers
for each row execute function public.sync_performer_publication();

-- 4) Restrict who can change verification_status: only admins
create or replace function public.protect_performer_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and new.verification_status is distinct from old.verification_status
     and not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can change verification status';
  end if;
  if tg_op = 'INSERT'
     and new.verification_status <> 'pending'
     and not public.has_role(auth.uid(), 'admin') then
    new.verification_status := 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists performers_protect_verification on public.performers;
create trigger performers_protect_verification
before insert or update on public.performers
for each row execute function public.protect_performer_verification();

-- 5) updated_at trigger for performers
drop trigger if exists performers_set_updated_at on public.performers;
create trigger performers_set_updated_at
before update on public.performers
for each row execute function public.set_updated_at();

-- 6) Bookings table
do $$ begin
  create type public.booking_status as enum ('pending', 'accepted', 'declined', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  performer_id uuid not null references public.performers(id) on delete cascade,
  client_id uuid not null,
  event_date date not null,
  location text not null,
  budget integer,
  message text,
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_performer on public.bookings(performer_id);
create index if not exists idx_bookings_client on public.bookings(client_id);
create index if not exists idx_bookings_status on public.bookings(status);

alter table public.bookings enable row level security;

-- Clients create bookings as themselves
create policy "Clients create bookings"
on public.bookings for insert
with check (auth.uid() = client_id);

-- Clients see their own bookings; performers see bookings to them; admins see all
create policy "View own bookings"
on public.bookings for select
using (
  auth.uid() = client_id
  or exists (
    select 1 from public.performers p
    where p.id = bookings.performer_id and p.user_id = auth.uid()
  )
  or public.has_role(auth.uid(), 'admin')
);

-- Clients can update their own pending bookings (e.g. cancel)
create policy "Clients update own bookings"
on public.bookings for update
using (auth.uid() = client_id)
with check (auth.uid() = client_id);

-- Performers update bookings assigned to them
create policy "Performers update incoming bookings"
on public.bookings for update
using (
  exists (
    select 1 from public.performers p
    where p.id = bookings.performer_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.performers p
    where p.id = bookings.performer_id and p.user_id = auth.uid()
  )
);

-- Admins manage all
create policy "Admins manage bookings"
on public.bookings for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();
