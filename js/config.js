/**
 * config.js — Configurações do Supabase para o Frontend Nexora Insumos.
 *
 * ATENÇÃO DE SEGURANÇA:
 * - Utilize APENAS a chave pública anon (SUPABASE_ANON_KEY).
 * - NUNCA inclua a chave privada service_role ou qualquer secret neste arquivo ou no repositório.
 * - Caso esteja executando localmente ou no GitHub Pages, você pode preencher os placeholders abaixo
 *   ou definir window.SUPABASE_URL e window.SUPABASE_ANON_KEY antes do carregamento deste script.
 */

window.SUPABASE_CONFIG = {
  // Preencha com a URL do seu projeto Supabase (ex: https://xyzcompany.supabase.co)
  URL: window.SUPABASE_URL || 'https://jmwrfvpjepwrodbcqsis.supabase.co',

  // Preencha com a chave PÚBLICA anon key do Supabase (safe for browser)
 ANON_KEY: window.SUPABASE_ANON_KEY || 'sb_publishable_F0yXm8s1OGCBYlEsNte8DQ_p0JwFsz0'
};
