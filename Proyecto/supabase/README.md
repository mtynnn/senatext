# Seguridad Supabase

El frontend usa solo `VITE_SUPABASE_ANON_KEY`. Nunca agregue la clave service-role a `VITE_*`: Vite la publica en el navegador.

## Despliegue

1. Ejecute `supabase login` y `supabase link --project-ref <ref>`.
2. Configure: `supabase secrets set SITE_URL=https://su-dominio.example ALLOWED_ORIGIN=https://su-dominio.example`.
3. Ejecute `supabase functions deploy manage-users`.

Supabase entrega `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` dentro de la función. Nunca las copie a `.env.local`.

## CORS y `verify_jwt`

- `supabase/config.toml` fija `verify_jwt = false` solo para `manage-users`. Con `true`, el gateway de Supabase exige JWT también en el preflight `OPTIONS`, que el navegador envía sin `Authorization`; responde 401 y falla el CORS antes de llegar al código. La seguridad no se reduce: la función valida el JWT con `auth.getUser` y exige `funcionarios.rol = 'admin'` en cada acción.
- **Orígenes permitidos:** la función lee una lista explícita desde el secreto `ALLOWED_ORIGINS` (orígenes separados por coma; se recortan los espacios). `ALLOWED_ORIGIN` (un solo origen) sigue siendo válido y se suma a la lista. Cada origen debe ser exacto: esquema + dominio + puerto si aplica, sin `/` final. No se aceptan `*` ni patrones.
  - Ejemplo con desarrollo y producción: `supabase secrets set ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,https://su-dominio.example"`.
  - Si ninguno de los dos secretos está definido, se usan por defecto `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:3000` y `http://127.0.0.1:5173`. Al definir un secreto, los valores por defecto **dejan de aplicar**: incluya también los de desarrollo si los necesita.
  - En cada respuesta (incluidas errores y `OPTIONS`) la función compara el header `Origin` con la lista: si coincide, lo devuelve en `Access-Control-Allow-Origin`; si no, omite ese header. Siempre añade `Vary: Origin`.
- **Redespliegue obligatorio:** tras cambiar el código de la función, `config.toml` o los secretos, vuelva a desplegar con `supabase functions deploy manage-users`; los cambios no se aplican hasta entonces.

## Autorización

La función exige una sesión válida y el rol `admin` de `funcionarios` para administrar cuentas. Habilite RLS y limite la lectura del perfil propio:

```sql
alter table public.funcionarios enable row level security;
create policy "perfil propio" on public.funcionarios for select to authenticated using (id = auth.uid());
```

Revise las políticas de todas las tablas clínicas antes de producción.
