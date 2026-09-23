# Seguridad Supabase

El frontend usa solo `VITE_SUPABASE_ANON_KEY`. Nunca agregue la clave service-role a `VITE_*`: Vite la publica en el navegador.

## Despliegue

1. Ejecute `supabase login` y `supabase link --project-ref <ref>`.
2. Configure: `supabase secrets set SITE_URL=https://su-dominio.example ALLOWED_ORIGIN=https://su-dominio.example`.
3. Ejecute `supabase functions deploy manage-users`.

Supabase entrega `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` dentro de la función. Nunca las copie a `.env.local`.

## Autorización

La función exige una sesión válida y el rol `admin` de `funcionarios` para administrar cuentas. Habilite RLS y limite la lectura del perfil propio:

```sql
alter table public.funcionarios enable row level security;
create policy "perfil propio" on public.funcionarios for select to authenticated using (id = auth.uid());
```

Revise las políticas de todas las tablas clínicas antes de producción.
