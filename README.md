# TengoHambre

App familiar (móvil, tableta y PC) para planificar el menú semanal, las recetas, la lista de la compra y el almacén, con datos nutricionales de fuentes oficiales (OMS, EFSA, AESAN/BEDCA).

- **App**: React + TypeScript + Vite + Tailwind, instalable como PWA.
- **Datos**: Supabase (plan gratuito) con inicio de sesión de Google y un hogar compartido.
- **Publicación**: Vercel (plan gratuito).
- **Mantenimiento**: GitHub Actions mantiene Supabase activo y hace una copia semanal en `backups/`.

Coste: 0 €. Ningún servicio pide tarjeta.

## Puesta en marcha

Sigue [docs/PUESTA-EN-MARCHA.md](docs/PUESTA-EN-MARCHA.md).

## Desarrollo

```bash
cp .env.example .env.local   # y rellena las dos claves
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | App en http://localhost:5173 |
| `npm run build` | Compila para producción |
| `VITE_DEMO=1 npm run dev` | App sin Supabase, con datos de ejemplo guardados en el navegador |
| `npm test` | Pruebas del importador de BEDCA y de los alimentos de las recetas Sugeridas |
| `npm run bedca` | Descarga BEDCA a `public/data/bedca.json` |

## Estructura

- `src/` app (páginas en `src/pages`, tema y colores en `src/index.css`)
- `supabase/migrations/` esquema de base de datos y reglas de seguridad
- `scripts/bedca-import.mjs` importador de alimentos BEDCA
- `.github/workflows/` comprobaciones, mantener Supabase despierto, copia semanal, importar BEDCA
- `backups/` copias semanales (el repositorio debe ser **privado**)
