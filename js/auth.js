/**
 * auth.js — Módulo de Autenticação Supabase para Nexora Insumos (US-01).
 */

window.AuthModule = {
  currentUser: null,
  userProfile: null,

  init: async function () {
    const client = window.supabaseClient;

    if (!client) {
      console.warn('SupabaseClient indisponível em AuthModule.init()');
      return;
    }

    try {
      // Verificar sessão ativa no Supabase Auth
      const { data: { session }, error } = await client.auth.getSession();
      if (session && session.user) {
        await this.handleUserAuthenticated(session.user);
      } else {
        this.clearSession();
      }

      // Escutar mudanças de estado de autenticação
      client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await this.handleUserAuthenticated(session.user);
          if (window.AppRouter) window.AppRouter.navigate('catalogo-requisicao');
        } else if (event === 'SIGNED_OUT') {
          this.clearSession();
          if (window.AppRouter) window.AppRouter.navigate('login');
        }
      });
    } catch (e) {
      console.error('Erro em AuthModule.init():', e);
    }
  },

  login: async function (event) {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const spinner = document.getElementById('login-btn-spinner');
    const btnText = document.getElementById('login-btn-text');
    const submitBtn = document.getElementById('login-submit-btn');
    const errorAlert = document.getElementById('login-error-alert');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (errorAlert) errorAlert.classList.add('hidden');
    if (spinner) spinner.classList.remove('hidden');
    if (btnText) btnText.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = true;

    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');

    if (client && isConfigured) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          this.showLoginError('Credenciais inválidas ou erro de conexão.', error.message);
        } else if (data && data.user) {
          await this.handleUserAuthenticated(data.user);
          if (window.ToastModule) {
            window.ToastModule.show(`Bem-vindo, ${email.split('@')[0]}!`, 'success');
          }
          if (window.AppRouter) window.AppRouter.navigate('catalogo-requisicao');
        }
      } catch (err) {
        this.showLoginError('Erro ao realizar login.', err.message || 'Falha de comunicação.');
      }
    } else {
      // Fallback para modo homologação local quando credenciais do Supabase ainda não foram preenchidas no config.js
      setTimeout(async () => {
        const isManager = email.toLowerCase().includes('gesto') || email.toLowerCase().includes('camila');
        const mockUser = {
          id: isManager ? '00000000-0000-0000-0000-000000000002' : '00000000-0000-0000-0000-000000000001',
          email: email,
          user_metadata: { papel: isManager ? 'gestor' : 'funcionario' }
        };

        this.currentUser = mockUser;
        this.userProfile = { papel: isManager ? 'gestor' : 'funcionario' };
        this.updateUI();

        if (window.ToastModule) {
          window.ToastModule.show(`Sessão de homologação iniciada como ${isManager ? 'Gestor' : 'Colaborador'}.`, 'success');
        }
        if (window.AppRouter) window.AppRouter.navigate('catalogo-requisicao');
      }, 700);
    }

    if (spinner) spinner.classList.add('hidden');
    if (btnText) btnText.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = false;
  },

  handleUserAuthenticated: async function (user) {
    this.currentUser = user;
    const client = window.supabaseClient;

    if (client) {
      try {
        // Obter papel da tabela public.perfis
        const { data: perfis, error } = await client
          .from('perfis')
          .select('papel')
          .eq('user_id', user.id)
          .single();

        if (perfis && perfis.papel) {
          this.userProfile = { papel: perfis.papel };
        } else {
          // Fallback metadata se perfil não retornar
          const papelMeta = (user.user_metadata && user.user_metadata.papel) || 'funcionario';
          this.userProfile = { papel: papelMeta };
        }
      } catch (e) {
        console.warn('Não foi possível carregar o perfil da tabela perfis, utilizando metadados:', e);
        this.userProfile = { papel: (user.user_metadata && user.user_metadata.papel) || 'funcionario' };
      }
    } else {
      this.userProfile = { papel: 'funcionario' };
    }

    this.updateUI();
  },

  logout: async function () {
    const client = window.supabaseClient;
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.error('Erro ao encerrar sessão:', e);
      }
    }
    this.clearSession();
    if (window.ToastModule) window.ToastModule.show('Você encerrou sua sessão com segurança.', 'success');
    if (window.AppRouter) window.AppRouter.navigate('login');
  },

  clearSession: function () {
    this.currentUser = null;
    this.userProfile = null;
    this.updateUI();
  },

  isGestor: function () {
    return this.userProfile && this.userProfile.papel === 'gestor';
  },

  getCurrentUser: function () {
    if (!this.currentUser) return null;
    return {
      id: this.currentUser.id,
      email: this.currentUser.email || '',
      papel: this.userProfile ? this.userProfile.papel : 'funcionario',
      nome: (this.currentUser.email ? this.currentUser.email.split('@')[0] : 'Usuário')
    };
  },

  updateUI: function () {
    const user = this.getCurrentUser();
    const isGestor = this.isGestor();

    const nameEl = document.getElementById('header-user-name');
    const emailEl = document.getElementById('header-user-email');
    const badgeEl = document.getElementById('header-user-badge');
    const navGestao = document.getElementById('nav-gestao');
    const navAuditoria = document.getElementById('nav-auditoria');

    const catNameEl = document.getElementById('cat-user-display-name');
    const catDeptEl = document.getElementById('cat-user-dept');

    if (user) {
      const formattedName = user.nome.charAt(0).toUpperCase() + user.nome.slice(1);
      if (nameEl) nameEl.textContent = formattedName;
      if (emailEl) emailEl.textContent = user.email;
      if (catNameEl) catNameEl.textContent = formattedName;
      if (catDeptEl) catDeptEl.textContent = isGestor ? '(Gestão de TI)' : '(Colaborador)';

      if (badgeEl) {
        badgeEl.textContent = isGestor ? 'Gestor de TI' : 'Funcionário';
        badgeEl.className = isGestor
          ? 'px-space-sm py-space-xs rounded-full font-label-xs text-label-xs text-on-primary font-bold bg-secondary-container'
          : 'px-space-sm py-space-xs rounded-full font-label-xs text-label-xs text-on-primary font-bold bg-primary-container';
      }

      // Exibir ou ocultar navegações exclusivas do gestor
      if (navGestao) {
        if (isGestor) navGestao.classList.remove('hidden');
        else navGestao.classList.add('hidden');
      }
      if (navAuditoria) {
        if (isGestor) navAuditoria.classList.remove('hidden');
        else navAuditoria.classList.add('hidden');
      }
    } else {
      if (navGestao) navGestao.classList.add('hidden');
      if (navAuditoria) navAuditoria.classList.add('hidden');
    }
  },

  showLoginError: function (title, description) {
    const alertBox = document.getElementById('login-error-alert');
    const titleEl = document.getElementById('login-error-title');
    const descEl = document.getElementById('login-error-desc');

    if (alertBox && titleEl && descEl) {
      titleEl.textContent = title;
      descEl.textContent = description || '';
      alertBox.classList.remove('hidden');
    }
  },

  setProfile: function (type) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const roleBadge = document.getElementById('selected-role-name');
    const errorAlert = document.getElementById('login-error-alert');

    if (errorAlert) errorAlert.classList.add('hidden');

    if (type === 'employee') {
      if (emailInput) emailInput.value = 'marcelo.silva@nexora.com.br';
      if (passwordInput) passwordInput.value = 'RequisicaoColab@2026';
      if (roleBadge) roleBadge.textContent = 'Perfil: Marcelo Silva (Funcionário)';
    } else if (type === 'manager') {
      if (emailInput) emailInput.value = 'camila.ti@nexora.com.br';
      if (passwordInput) passwordInput.value = 'MasterGestaoTI@2026';
      if (roleBadge) roleBadge.textContent = 'Perfil: Camila Duarte (Gestora de TI)';
    }
  },

  togglePasswordVisibility: function () {
    const passwordInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('password-eye-icon');
    if (!passwordInput || !eyeIcon) return;

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeIcon.textContent = 'visibility_off';
    } else {
      passwordInput.type = 'password';
      eyeIcon.textContent = 'visibility';
    }
  }
};
