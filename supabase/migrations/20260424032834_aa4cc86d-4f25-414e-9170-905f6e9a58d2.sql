-- Дополнительные поля для бронирования
alter table public.bookings
  add column if not exists event_type text,
  add column if not exists guests_count integer,
  add column if not exists contact_phone text,
  add column if not exists contact_name text;

-- Связка отзыва с бронированием для контроля «отзыв только после выполненного заказа»
alter table public.reviews
  add column if not exists booking_id uuid;

-- Уникальное ограничение: один отзыв на бронирование
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_booking_unique'
  ) then
    alter table public.reviews
      add constraint reviews_booking_unique unique (booking_id);
  end if;
end $$;

-- Усиленная политика INSERT отзывов: только клиент завершённого бронирования
drop policy if exists "Clients can post reviews" on public.reviews;
create policy "Clients can review completed bookings"
on public.reviews
for insert
with check (
  auth.uid() = client_id
  and booking_id is not null
  and exists (
    select 1 from public.bookings b
    where b.id = reviews.booking_id
      and b.client_id = auth.uid()
      and b.performer_id = reviews.performer_id
      and b.status = 'completed'
  )
);

-- Триггер: пересчёт rating и reviews_count у артиста при изменениях reviews
create or replace function public.recalc_performer_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid := coalesce(new.performer_id, old.performer_id);
  avg_rating numeric;
  cnt integer;
begin
  select coalesce(avg(rating)::numeric(10,2), 0), count(*)
    into avg_rating, cnt
    from public.reviews where performer_id = pid;
  update public.performers
     set rating = avg_rating, reviews_count = cnt, updated_at = now()
   where id = pid;
  return null;
end;
$$;

drop trigger if exists trg_reviews_recalc on public.reviews;
create trigger trg_reviews_recalc
after insert or update or delete on public.reviews
for each row execute function public.recalc_performer_rating();

-- Индекс по дате для календаря/листинга
create index if not exists idx_bookings_event_date on public.bookings (event_date);
create index if not exists idx_bookings_client on public.bookings (client_id);
create index if not exists idx_bookings_performer on public.bookings (performer_id);