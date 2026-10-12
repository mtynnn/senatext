# Seguridad Supabase

El frontend usa solo `VITE_SUPABASE_ANON_KEY`. Nunca agregue la clave service-role a `VITE_*`: Vite la publica en el navegador.

## Despliegue

1. Ejecute `supabase login` y `supabase link --project-ref <ref>`.
2. Configure: `supabase secrets set SITE_URL=https://su-dominio.example ALLOWED_ORIGIN=https://su-dominio.example`.
3. Ejecute `supabase functions deploy manage-users`.

Supabase entrega `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` dentro de la función. Nunca las copie a `.env.local`.

## CORS y `verify_jwt`

- `supabase/config.toml` fija `verify_jwt = false` solo para `manage-users`. Con `true`, el gateway de Supabase exige JWT también en el preflight `OPTIONS`, que el navegador envía sin `Authorization`; responde 401 y falla el CORS antes de llegar al código. La seguridad no se reduce: la función valida el JWT con `auth.getUser` y exige `funcionarios.rol = 'admin'` en cada acción.
- `ALLOWED_ORIGIN` admite **un solo origen**. Si no está definido, la función usa `http://localhost:3000` (puerto de `npm run dev`). En producción defínalo con el dominio exacto del frontend (esquema + dominio, sin `/` final): `supabase secrets set ALLOWED_ORIGIN=https://su-dominio.example`.
- Tras cambiar `config.toml` o los secretos, vuelva a desplegar con `supabase functions deploy manage-users`.

## Autorización

La función exige una sesión válida y el rol `admin` de `funcionarios` para administrar cuentas. Habilite RLS y limite la lectura del perfil propio:

```sql
alter table public.funcionarios enable row level security;
create policy "perfil propio" on public.funcionarios for select to authenticated using (id = auth.uid());
```

Revise las políticas de todas las tablas clínicas antes de producción.
