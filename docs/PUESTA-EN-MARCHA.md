# Puesta en marcha

Todo es gratis y ninguno de estos servicios pide tarjeta. Tardarás unos 30 minutos en total.

## 0. Repositorio privado

GitHub → `sermedev/tengohambre` → **Settings → General → Danger Zone → Change visibility → Private**.
Las copias de seguridad guardan datos de la familia, así que el repositorio tiene que ser privado.

## 1. Supabase (base de datos e inicio de sesión)

1. Entra en https://supabase.com → **Start your project** → regístrate con GitHub.
2. **New project**: nombre `tengohambre`, región *West EU (Ireland)* o *Central EU (Frankfurt)*, plan **Free**. Guarda la contraseña de la base de datos.
3. Cuando termine de crearse, abre **SQL Editor → New query**, pega el contenido de `supabase/migrations/0001_init.sql` y pulsa **Run**. Debe decir *Success*.
4. Apunta estos datos (botón **Connect** arriba, o **Project Settings → API Keys**):
   - **Project URL**: `https://xxxx.supabase.co`
   - **Publishable key**: empieza por `sb_publishable_` (si solo ves *anon key*, vale esa).
   - **Cadena de conexión** en *Connect → Session pooler* (`postgresql://postgres.xxxx:[TU-CONTRASEÑA]@aws-…pooler.supabase.com:5432/postgres`). Cambia `[TU-CONTRASEÑA]` por la del paso 2.

## 2. Google (el botón «Continuar con Google»)

1. Entra en https://console.cloud.google.com con tu cuenta de Google → crea un proyecto `TengoHambre`.
2. **APIs y servicios → Pantalla de consentimiento de OAuth** (Google Auth Platform): tipo **Externo**, nombre `TengoHambre`, tu correo de soporte. En **Público**, pulsa **Publicar app** (solo pide correo y perfil, así que no necesita revisión de Google).
3. **Clientes → Crear cliente → Aplicación web**.
   - *URI de redireccionamiento autorizados*: `https://xxxx.supabase.co/auth/v1/callback` (tu Project URL + `/auth/v1/callback`).
4. Copia el **ID de cliente** y el **Secreto de cliente**.
5. En Supabase: **Authentication → Sign In / Providers → Google** → actívalo y pega los dos valores → **Save**.

## 3. Vercel (publicar la web)

1. Entra en https://vercel.com → **Sign up** → **Continue with GitHub** → plan **Hobby** (gratis).
2. **Add New → Project** → importa `tengohambre` (si no aparece, *Adjust GitHub App Permissions* y dale acceso a ese repo).
3. Framework: **Vite** (lo detecta solo). En **Environment Variables** añade:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Publishable key
4. **Deploy**. Te dará una dirección tipo `https://tengohambre-xxxx.vercel.app`.
5. Vuelve a Supabase: **Authentication → URL Configuration**:
   - *Site URL*: tu dirección de Vercel.
   - *Redirect URLs*: añade tu dirección de Vercel y `http://localhost:5173`.

## 4. Secretos de GitHub (copias y mantener Supabase despierto)

GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**, tres veces:

| Nombre | Valor |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `SUPABASE_DB_URL` | Cadena de conexión del *Session pooler* con tu contraseña |

Para que la importación de BEDCA pueda abrir su PR: **Settings → Actions → General → Workflow permissions** → marca *Allow GitHub Actions to create and approve pull requests*.

Pruébalo: pestaña **Actions** → *Mantener Supabase despierto* → **Run workflow**. Debe salir en verde.

## 5. Primer uso

1. Abre la dirección de Vercel en el móvil → **Continuar con Google**.
2. **Crear hogar**: revisa nombres y fechas de nacimiento → **Crear hogar**.
3. En **Más → Ajustes** verás el código del hogar. Tu mujer entra con su Google, elige **Tengo un código** y lo escribe.
4. Para instalarla: en el móvil, menú del navegador → **Añadir a pantalla de inicio**.

## Límites del plan gratuito (de sobra para una familia)

- Supabase: 500 MB de base de datos, 50 000 usuarios al mes. Se pausa tras 7 días sin uso: la Action de cada 3 días lo evita.
- Vercel Hobby: uso personal y no comercial.
- GitHub Actions: los repos privados tienen 2 000 minutos al mes; estas tareas usan menos de 20.
