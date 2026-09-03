-- Esquema da app Despensa
-- Corre isto uma vez em: Supabase Dashboard > SQL Editor > New query > Run

create extension if not exists "pgcrypto";

-- ---------- Tabelas ----------

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  zone text not null,
  amount numeric not null default 0,
  unit text,
  expiry date,
  alert_days int default 3,
  min_stock numeric,
  ignore_low_stock boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  prep_minutes int,
  servings int not null default 2,
  meal_types text[] not null default '{}',
  ingredients jsonb not null default '[]', -- [{ "name": "...", "qty": "..." }]
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists weekly_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  wants_lunch boolean not null default false,
  wants_dinner boolean not null default false,
  lunch_recipe_id uuid references recipes (id) on delete set null,
  dinner_recipe_id uuid references recipes (id) on delete set null,
  unique (user_id, date)
);

create table if not exists shopping_manual_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists shopping_checked_ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ingredient_name text not null,
  checked boolean not null default false,
  unique (user_id, ingredient_name)
);

-- ---------- Row Level Security ----------
-- Cada utilizador só vê e altera os seus próprios dados.

alter table zones enable row level security;
alter table items enable row level security;
alter table recipes enable row level security;
alter table weekly_plan enable row level security;
alter table shopping_manual_items enable row level security;
alter table shopping_checked_ingredients enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['zones', 'items', 'recipes', 'weekly_plan', 'shopping_manual_items', 'shopping_checked_ingredients']
  loop
    execute format('
      create policy "select own rows" on %I for select using (user_id = auth.uid());
      create policy "insert own rows" on %I for insert with check (user_id = auth.uid());
      create policy "update own rows" on %I for update using (user_id = auth.uid()) with check (user_id = auth.uid());
      create policy "delete own rows" on %I for delete using (user_id = auth.uid());
    ', t, t, t, t);
  end loop;
end $$;

-- ---------- Zonas por defeito para cada novo utilizador ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into zones (user_id, name)
  values
    (new.id, 'Frigorífico'),
    (new.id, 'Congelador'),
    (new.id, 'Despensa'),
    (new.id, 'Outros');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
