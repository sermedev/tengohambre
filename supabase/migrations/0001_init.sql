-- TengoHambre · esquema inicial
-- Todo lo de la familia cuelga de un "hogar". Solo las cuentas de Google unidas a ese hogar pueden leer o escribir sus datos (RLS).
-- Los alimentos de BEDCA NO están aquí: van como archivo estático en la app (public/data/bedca.json), así la base de datos se queda pequeña.

create extension if not exists pgcrypto;

-- ───────── Hogar y cuentas ─────────
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mi casa',
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.household_users (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'miembro' check (role in ('admin', 'miembro')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);
create index on public.household_users (user_id);

-- ¿La cuenta conectada pertenece a este hogar? (security definer para no entrar en bucle con RLS)
create or replace function public.is_household_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.household_users where household_id = hid and user_id = auth.uid());
$$;

-- ───────── Personas de la familia (no son cuentas: los niños no inician sesión) ─────────
create table public.members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  color text not null default '--p1',
  icon text,
  sex text not null check (sex in ('hombre', 'mujer', 'nino', 'nina')),
  birth_date date not null,
  is_kid boolean not null default false,
  default_portion numeric(3,2) not null default 1 check (default_portion between 0 and 2),
  goal text not null default 'mantener',
  activity text not null default 'baja',
  height_cm numeric(5,1),
  waist_cm numeric(5,1),
  sports jsonb not null default '[]'::jsonb,       -- [{sport:'padel', days:1, minutes:90}]
  position int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.weight_log (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  day date not null default current_date,
  weight_kg numeric(5,2),
  waist_cm numeric(5,1),
  unique (member_id, day)
);

-- ───────── Alimentos propios (precocinados con datos de la etiqueta, por 100 g) ─────────
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  brand text,
  store text,                                       -- Mercadona, Aldi, Carrefour…
  barcode text,
  kcal numeric(6,1), protein_g numeric(5,1), carbs_g numeric(5,1), sugars_g numeric(5,1),
  fat_g numeric(5,1), sat_fat_g numeric(5,1), fiber_g numeric(5,1), salt_g numeric(5,2),
  source text not null default 'etiqueta' check (source in ('etiqueta', 'open_food_facts')),
  updated_at timestamptz not null default now()
);

-- ───────── Recetas ─────────
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  kind text not null default 'receta' check (kind in ('receta', 'precocinado')),
  food_id uuid references public.foods(id) on delete set null,   -- para precocinados
  servings numeric(4,1) not null default 4,
  minutes int,
  meals text[] not null default '{}',                -- des, mm, com, mer, cen
  groups text[] not null default '{}',               -- legumbre, pescado, verdura… (para el equilibrio semanal)
  steps text,
  updated_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  food_ref text not null,                            -- 'bedca:<id>' o 'food:<uuid>'
  name text not null,
  grams numeric(7,1) not null check (grams >= 0),
  position int not null default 0
);
create index on public.recipe_ingredients (recipe_id);

-- ───────── Almacén (inventario manual) ─────────
create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  place text not null check (place in ('Despensa', 'Nevera', 'Congelador')),
  qty numeric(7,2) not null default 1,
  unit text not null default 'ud' check (unit in ('raciones', 'g', 'kg', 'ud', 'L', 'paquetes')),
  recipe_id uuid references public.recipes(id) on delete set null,   -- platos ya cocinados
  expires_on date,
  updated_at timestamptz not null default now()
);

-- ───────── Menú ─────────
create table public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  day date not null,
  meal text not null check (meal in ('des', 'mm', 'com', 'mer', 'cen')),
  position int not null default 0,
  recipe_id uuid references public.recipes(id) on delete cascade,
  pantry_item_id uuid references public.pantry_items(id) on delete set null,
  eat_out text check (eat_out in ('ligero', 'normal', 'copioso')),
  portions jsonb not null default '{}'::jsonb,       -- {member_id: 0.75}; 0 = no come
  updated_at timestamptz not null default now(),
  check (num_nonnulls(recipe_id, pantry_item_id, eat_out) = 1)
);
create index on public.meal_plan_items (household_id, day);

-- ───────── Compra ─────────
create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  section text not null default 'Despensa',
  qty numeric(7,2),
  unit text,
  checked boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.saved_products (                -- productos que la familia añade al catálogo
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  section text not null,
  unique (household_id, name)
);

-- ───────── updated_at automático ─────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array['members','foods','recipes','pantry_items','meal_plan_items','shopping_items'] loop
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ───────── Seguridad (RLS) ─────────
alter table public.households enable row level security;
alter table public.household_users enable row level security;

create policy "ver mi hogar" on public.households for select using (public.is_household_member(id));
create policy "renombrar mi hogar" on public.households for update using (public.is_household_member(id));
create policy "ver quién está en mi hogar" on public.household_users for select using (public.is_household_member(household_id));
create policy "salir de un hogar" on public.household_users for delete using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['members','weight_log','foods','recipes','recipe_ingredients','pantry_items','meal_plan_items','shopping_items','saved_products'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "solo mi hogar" on public.%I for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id))', t);
  end loop;
end $$;

-- ───────── Crear hogar / unirse con código ─────────
create or replace function public.create_household(p_name text default 'Mi casa')
returns public.households language plpgsql security definer set search_path = public as $$
declare h public.households;
begin
  if auth.uid() is null then raise exception 'Hay que iniciar sesión'; end if;
  insert into public.households (name, created_by) values (coalesce(nullif(trim(p_name), ''), 'Mi casa'), auth.uid()) returning * into h;
  insert into public.household_users (household_id, user_id, role) values (h.id, auth.uid(), 'admin');
  return h;
end $$;

create or replace function public.join_household(p_code text)
returns public.households language plpgsql security definer set search_path = public as $$
declare h public.households;
begin
  if auth.uid() is null then raise exception 'Hay que iniciar sesión'; end if;
  select * into h from public.households where invite_code = upper(trim(p_code));
  if h.id is null then raise exception 'Código no válido'; end if;
  insert into public.household_users (household_id, user_id) values (h.id, auth.uid()) on conflict do nothing;
  return h;
end $$;

revoke all on function public.create_household(text) from public, anon;
revoke all on function public.join_household(text) from public, anon;
grant execute on function public.create_household(text) to authenticated;
grant execute on function public.join_household(text) to authenticated;

-- Para la GitHub Action que evita que Supabase pause el proyecto por inactividad
create or replace function public.ping() returns text language sql stable as $$ select 'pong'::text $$;
grant execute on function public.ping() to anon, authenticated;

-- Cambios en directo entre el móvil de los dos
alter publication supabase_realtime add table public.meal_plan_items, public.shopping_items, public.pantry_items, public.recipes, public.members;
