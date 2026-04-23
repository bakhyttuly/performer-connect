-- 1) booking_messages
create table public.booking_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null,
  body text not null check (length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index idx_booking_messages_booking on public.booking_messages(booking_id, created_at);

alter table public.booking_messages enable row level security;

-- helper: is participant in booking
create or replace function public.is_booking_participant(_booking_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bookings b
    left join public.performers p on p.id = b.performer_id
    where b.id = _booking_id
      and (b.client_id = _user_id or p.user_id = _user_id)
  )
$$;

create policy "View messages of own bookings"
  on public.booking_messages for select
  using (
    public.is_booking_participant(booking_id, auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Participants can send messages"
  on public.booking_messages for insert
  with check (
    auth.uid() = sender_id
    and public.is_booking_participant(booking_id, auth.uid())
  );

create policy "Sender can delete own message"
  on public.booking_messages for delete
  using (auth.uid() = sender_id or public.has_role(auth.uid(), 'admin'));

-- realtime
alter table public.booking_messages replica identity full;
alter publication supabase_realtime add table public.booking_messages;

-- 2) performer_availability
create table public.performer_availability (
  id uuid primary key default gen_random_uuid(),
  performer_id uuid not null references public.performers(id) on delete cascade,
  date date not null,
  status text not null default 'busy' check (status in ('busy','blocked')),
  note text,
  created_at timestamptz not null default now(),
  unique (performer_id, date)
);

create index idx_performer_availability_performer_date on public.performer_availability(performer_id, date);

alter table public.performer_availability enable row level security;

create policy "Availability viewable by everyone"
  on public.performer_availability for select
  using (true);

create policy "Performer manages own availability"
  on public.performer_availability for all
  using (
    exists (select 1 from public.performers p where p.id = performer_id and p.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    exists (select 1 from public.performers p where p.id = performer_id and p.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

-- 3) auto-mark availability when booking accepted
create or replace function public.sync_booking_availability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'UPDATE' and new.status = 'accepted' and old.status is distinct from 'accepted') then
    insert into public.performer_availability (performer_id, date, status, note)
    values (new.performer_id, new.event_date, 'busy', 'Booked')
    on conflict (performer_id, date) do nothing;
  elsif (tg_op = 'UPDATE' and old.status = 'accepted' and new.status in ('declined','cancelled')) then
    delete from public.performer_availability
    where performer_id = new.performer_id
      and date = new.event_date
      and note = 'Booked';
  end if;
  return new;
end;
$$;

create trigger trg_sync_booking_availability
  after update on public.bookings
  for each row execute function public.sync_booking_availability();