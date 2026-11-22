-- TengoHambre · paso 4: lista de la compra compartida
-- Se puede ejecutar varias veces sin error: solo añade lo que falte.
-- Pegar entero en Supabase → SQL Editor → Run.

-- Lo que viene del menú se marca para poder rehacerlo sin tocar lo que se apuntó a mano
alter table public.shopping_items add column if not exists from_menu boolean not null default false;
alter table public.shopping_items add column if not exists note text;   -- para qué recetas es, qué se descontó del almacén
alter table public.shopping_items add column if not exists created_at timestamptz not null default now();
create index if not exists shopping_items_household_idx on public.shopping_items (household_id);
create index if not exists saved_products_household_idx on public.saved_products (household_id);

-- Permisos (los proyectos nuevos de Supabase no los dan solos)
grant select, insert, update, delete on public.shopping_items, public.saved_products to authenticated;

-- Cambios en directo también para «Mis productos» (la lista ya los tenía)
do $$
declare t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then return; end if;
  foreach t in array array['shopping_items','saved_products'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
