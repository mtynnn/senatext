import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const respuesta = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respuesta({ error: 'Método no permitido.' }, 405);
  const authorization = req.headers.get('Authorization');
  if (!authorization) return respuesta({ error: 'No autenticado.' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { autoRefreshToken: false, persistSession: false } });
  const token = authorization.replace(/^Bearer\s+/i, '');
  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user) return respuesta({ error: 'Sesión inválida.' }, 401);
  const body = await req.json().catch(() => ({}));
  const { data: perfil } = await admin.from('funcionarios').select('rol').eq('id', user.id).single();
  if (perfil?.rol !== 'admin') return respuesta({ error: 'No autorizado.' }, 403);

  if (body.action === 'list') {
    const { data, error } = await admin.from('funcionarios').select('id, nombre, correo, rol').order('nombre');
    if (error) return respuesta({ error: 'No fue posible listar funcionarios.' }, 500);
    const ahora = new Date().toISOString();
    return respuesta({ cuentas: data.map((f) => ({ id: f.id, nombre: f.nombre, email: f.correo, rol: f.rol, estadoInvitacion: 'activa', creadaEn: ahora, correoEnviadoEn: ahora })) });
  }
  if (body.action === 'create') {
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respuesta({ error: 'Nombre o correo inválido.' }, 400);
    const { data: invitacion, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: Deno.env.get('SITE_URL') });
    if (error || !invitacion.user) return respuesta({ error: error?.message ?? 'No fue posible invitar al usuario.' }, 400);
    const { error: insertError } = await admin.from('funcionarios').insert({ id: invitacion.user.id, nombre, correo: email, rol: 'funcionario', modulo: 'general' });
    if (insertError) { await admin.auth.admin.deleteUser(invitacion.user.id); return respuesta({ error: 'No fue posible crear el perfil.' }, 500); }
    return respuesta({ cuenta: { id: invitacion.user.id, nombre, email, rol: 'funcionario', estadoInvitacion: 'enviada', creadaEn: new Date().toISOString(), correoEnviadoEn: new Date().toISOString() } }, 201);
  }
  if (body.action === 'resend-invite' && typeof body.id === 'string') {
    const { data: cuenta } = await admin.from('funcionarios').select('correo').eq('id', body.id).single();
    if (!cuenta) return respuesta({ error: 'Cuenta no encontrada.' }, 404);
    const { error } = await admin.auth.resetPasswordForEmail(cuenta.correo, { redirectTo: Deno.env.get('SITE_URL') });
    if (error) return respuesta({ error: error.message }, 400);
    return respuesta({ ok: true });
  }
  if (body.action === 'delete' && typeof body.id === 'string') {
    const { error } = await admin.auth.admin.deleteUser(body.id);
    if (error) return respuesta({ error: error.message }, 400);
    await admin.from('funcionarios').delete().eq('id', body.id);
    return respuesta({ ok: true });
  }
  return respuesta({ error: 'Acción inválida.' }, 400);
});
