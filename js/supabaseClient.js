/**
 * supabaseClient.js — Inicialização do cliente Supabase para o Frontend Nexora Insumos.
 *
 * Utiliza o SDK global do Supabase carregado via CDN (@supabase/supabase-js).
 */

(function () {
  const config = window.SUPABASE_CONFIG || {};

  if (!config.URL || !config.ANON_KEY || config.URL.includes('sua-url-supabase')) {
    console.warn(
      '⚠️ Supabase Config Warning: As credenciais do Supabase não foram configuradas em js/config.js. ' +
      'Por favor, insira a SUPABASE_URL e a SUPABASE_ANON_KEY no arquivo js/config.js para conectar ao banco de dados.'
    );
  }

  // Verificar se o SDK da CDN do Supabase está disponível
  if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
    console.error('❌ Supabase SDK não foi carregado via CDN. Certifique-se de incluir a tag <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>.');
    return;
  }

  try {
    window.supabaseClient = window.supabase.createClient(config.URL, config.ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.log('✅ Cliente Supabase inicializado com sucesso.');
  } catch (error) {
    console.error('❌ Erro ao inicializar o cliente Supabase:', error);
  }
})();
