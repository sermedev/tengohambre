-- Permisos de tabla para las cuentas que inician sesión.
-- Los proyectos nuevos de Supabase ya no los dan automáticamente sobre las tablas de "public".
-- Las reglas RLS de 0001 siguen decidiendo qué filas ve cada hogar; esto solo abre la puerta a la tabla.
-- anon (sin iniciar sesión) no recibe permisos de tabla: solo puede llamar a ping().

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
