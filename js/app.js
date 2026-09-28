/**
 * app.js — Ponto de Entrada da Aplicação Nexora Insumos.
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando Aplicação Nexora Insumos...');

  // Inicializar roteador de telas
  if (window.AppRouter) {
    window.AppRouter.init();
  }

  // Inicializar módulo de autenticação Supabase
  if (window.AuthModule) {
    await window.AuthModule.init();
  }

  // Definir view inicial com base na URL ou estado de login
  const hash = window.location.hash.replace('#', '');
  const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;

  if (user) {
    const startView = (hash && hash !== 'login') ? hash : 'catalogo-requisicao';
    if (window.AppRouter) window.AppRouter.navigate(startView);
  } else {
    if (window.AppRouter) window.AppRouter.navigate('login');
  }
});
