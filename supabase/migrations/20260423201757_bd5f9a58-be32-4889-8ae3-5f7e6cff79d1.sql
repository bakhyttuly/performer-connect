-- Roles enum
create type public.app_role as enum ('admin', 'performer', 'client');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Roles viewable by everyone"
  on public.user_roles for select using (true);

create policy "Admins manage roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Performers
create table public.performers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stage_name text not null,
  category text not null,
  tagline text,
  description text,
  cover_url text,
  city text,
  price_from int,
  price_currency text default 'USD',
  rating numeric(3,2) default 0,
  reviews_count int default 0,
  is_verified boolean default false,
  is_published boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.performers enable row level security;

create policy "Published performers viewable by everyone"
  on public.performers for select
  using (is_published = true or auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Performers can insert own profile"
  on public.performers for insert
  with check (auth.uid() = user_id);

create policy "Performers can update own profile"
  on public.performers for update
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete performers"
  on public.performers for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Performer media gallery
create table public.performer_media (
  id uuid primary key default gen_random_uuid(),
  performer_id uuid references public.performers(id) on delete cascade not null,
  url text not null,
  kind text not null default 'image',
  position int default 0,
  created_at timestamptz not null default now()
);

alter table public.performer_media enable row level security;

create policy "Media viewable by everyone"
  on public.performer_media for select using (true);

create policy "Performer manages own media"
  on public.performer_media for all
  using (
    exists (select 1 from public.performers p where p.id = performer_id and p.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    exists (select 1 from public.performers p where p.id = performer_id and p.user_id = auth.uid())
    or public.has_role(auth.uid(), 'admin')
  );

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  performer_id uuid references public.performers(id) on delete cascade not null,
  client_id uuid references auth.users(id) on delete cascade not null,
  rating int not null check (rating between 1 and 5),
  text text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Reviews viewable by everyone"
  on public.reviews for select using (true);

create policy "Clients can post reviews"
  on public.reviews for insert
  with check (auth.uid() = client_id);

create policy "Clients update own reviews"
  on public.reviews for update
  using (auth.uid() = client_id);

create policy "Clients or admins delete reviews"
  on public.reviews for delete
  using (auth.uid() = client_id or public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default 'client' role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_roles (user_id, role)
  values (new.id, 'client');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger performers_updated_at before update on public.performers
  for each row execute function public.set_updated_at();