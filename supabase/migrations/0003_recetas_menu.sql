-- TengoHambre · paso 3: recetas, precocinados, menú semanal y almacén
-- Se puede ejecutar varias veces sin error: solo añade lo que falte.
-- Pegar entero en Supabase → SQL Editor → Run.

-- ───────── Recetas ─────────
alter table public.recipes add column if not exists icon text not null default '🍽️';
alter table public.recipes add column if not exists note text;                         -- por qué la recomendamos, consejos
alter table public.recipes add column if not exists kid_friendly boolean not null default true;
alter table public.recipes add column if not exists portion_g numeric(6,1);             -- precocinados: gramos por ración (etiqueta)
alter table public.recipes add column if not exists pack_portions numeric(4,1);         -- precocinados: raciones por envase
alter table public.recipes add column if not exists suggested_key text;                 -- receta Sugerida de la que viene
create unique index if not exists recipes_suggested_key_idx on public.recipes (household_id, suggested_key) where suggested_key is not null;

-- Para los precocinados la ración la da la etiqueta; las recetas propias reparten el total entre "servings" raciones de adulto
alter table public.recipes drop constraint if exists recipes_servings_check;
alter table public.recipes add constraint recipes_servings_check check (servings > 0);

create index if not exists recipe_ingredients_household_idx on public.recipe_ingredients (household_id);

-- ───────── Almacén ─────────
alter table public.pantry_items add column if not exists added_on date not null default current_date;  -- para avisar de lo que lleva tiempo
alter table public.pantry_items drop constraint if exists pantry_items_qty_check;
alter table public.pantry_items add constraint pantry_items_qty_check check (qty >= 0);

-- ───────── Menú ─────────
-- Un plato del menú es una receta, unas sobras del almacén o una comida fuera de casa.
-- Las sobras guardan también la receta y el nombre, para que el menú no se rompa si luego se borra del almacén.
alter table public.meal_plan_items add column if not exists label text;
alter table public.meal_plan_items drop constraint if exists meal_plan_items_check;
alter table public.meal_plan_items add constraint meal_plan_items_check
  check (num_nonnulls(recipe_id, pantry_item_id, eat_out, label) >= 1 and (eat_out is null or (recipe_id is null and pantry_item_id is null)));

-- ───────── Permisos (los proyectos nuevos de Supabase no los dan solos) ─────────
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ───────── Cambios en directo también para ingredientes y precocinados ─────────
do $$
declare t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then return; end if;
  foreach t in array array['recipe_ingredients','foods','weight_log'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
