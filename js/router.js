/**
 * router.js — Gerenciamento de navegação e rotas SPA do Nexora Insumos.
 */

window.AppRouter = {
  currentView: null,

  init: function () {
    // Interceptar cliques em links com data-path ou href
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-path]');
      if (link) {
        e.preventDefault();
        const path = link.getAttribute('data-path');
        this.navigate(path);
      }
    });

    // Escutar evento popstate (navegação do navegador)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.path) {
        this.showView(e.state.path, false);
      }
    });
  },

  navigate: function (path) {
    this.showView(path, true);
  },

  showView: function (path, pushState = true) {
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;
    const isGestor = window.AuthModule ? window.AuthModule.isGestor() : false;

    // Se não estiver logado e tentar acessar rota protegida, redireciona para login
    if (!user && path !== 'login') {
      path = 'login';
    }

    // Se estiver logado e tentar ir para login, vai para catálogo
    if (user && path === 'login') {
      path = 'catalogo-requisicao';
    }

    // Proteger rotas exclusivas do gestor
    if ((path === 'gestao-insumos' || path === 'extrato-auditoria') && !isGestor) {
      if (window.ToastModule) {
        window.ToastModule.show('Acesso restrito a Gestores de TI.', 'error');
      }
      path = 'catalogo-requisicao';
    }

    // Esconder todas as views
    const views = document.querySelectorAll('.app-view');
    views.forEach((v) => v.classList.add('hidden'));

    // Mapear caminhos para IDs de elementos de view
    const viewMap = {
      'login': 'view-login',
      'catalogo-requisicao': 'view-catalogo',
      'minhas-requisicoes': 'view-minhas-requisicoes',
      'gestao-insumos': 'view-gestao-insumos',
      'extrato-auditoria': 'view-extrato-auditoria'
    };

    const targetId = viewMap[path] || 'view-catalogo';
    const targetView = document.getElementById(targetId);

    if (targetView) {
      targetView.classList.remove('hidden');
      this.currentView = path;

      // Controlar exibição do Header e Footer
      const appHeader = document.getElementById('app-header');
      const appFooter = document.getElementById('app-footer');

      if (path === 'login') {
        if (appHeader) appHeader.classList.add('hidden');
        if (appFooter) appFooter.classList.add('hidden');
      } else {
        if (appHeader) appHeader.classList.remove('hidden');
        if (appFooter) appFooter.classList.remove('hidden');
      }

      // Atualizar classe ativa nos links da barra de navegação
      const navLinks = document.querySelectorAll('nav [data-path]');
      navLinks.forEach((navLink) => {
        const navPath = navLink.getAttribute('data-path');
        if (navPath === path) {
          navLink.className =
            'bg-primary-container text-on-primary font-bold px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors';
        } else {
          navLink.className =
            'text-on-primary-fixed-variant hover:text-on-primary hover:bg-primary-container px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors';
        }
      });

      if (pushState && window.location.hash !== '#' + path) {
        history.pushState({ path: path }, '', '#' + path);
      }

      // Notificar módulo da view ativa para recarregar dados
      this.onViewChanged(path);
    }
  },

  onViewChanged: function (path) {
    if (path === 'catalogo-requisicao' && window.CatalogoModule) {
      window.CatalogoModule.loadItens();
    } else if (path === 'minhas-requisicoes' && window.MinhasRequisicoesModule) {
      window.MinhasRequisicoesModule.loadRequisicoes();
    } else if (path === 'gestao-insumos' && window.GestaoModule) {
      window.GestaoModule.loadItens();
    } else if (path === 'extrato-auditoria' && window.AuditoriaModule) {
      window.AuditoriaModule.loadExtrato();
    }
  }
};
