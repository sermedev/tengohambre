-- TengoHambre · menús semanales tipo (plantillas)
-- Se puede ejecutar varias veces sin error: solo añade lo que falte.
-- Pegar entero en Supabase → SQL Editor → Run.

-- Una plantilla guarda una semana entera de menú con un nombre, para aplicarla a la semana que se quiera.
-- items: [{ dow: 0-6 (lunes = 0), meal, position, recipe_id, eat_out, label, portions }]
create table if not exists public.menu_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists menu_templates_household_idx on public.menu_templates (household_id);

drop trigger if exists menu_templates_touch on public.menu_templates;
create trigger menu_templates_touch before update on public.menu_templates for each row execute function public.touch_updated_at();

-- Seguridad: cada hogar ve solo sus plantillas
alter table public.menu_templates enable row level security;
drop policy if exists "solo mi hogar" on public.menu_templates;
create policy "solo mi hogar" on public.menu_templates for all
  using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));

-- Permisos (los proyectos nuevos de Supabase no los dan solos)
grant select, insert, update, delete on public.menu_templates to authenticated;

-- Cambios en directo (el otro móvil ve las plantillas nuevas)
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then return; end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'menu_templates') then
    alter publication supabase_realtime add table public.menu_templates;
  end if;
end $$;
