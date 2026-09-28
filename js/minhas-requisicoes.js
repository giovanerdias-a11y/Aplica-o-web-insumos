/**
 * minhas-requisicoes.js — Módulo do Histórico Pessoal de Requisições (US-05).
 */

window.MinhasRequisicoesModule = {
  requisicoesList: [],

  categoryLabels: {
    'papelaria': 'Papelaria',
    'impressao': 'Impressão',
    'informatica': 'Informática',
    'outros': 'Outros'
  },

  loadRequisicoes: async function () {
    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');
    const user = window.AuthModule ? window.AuthModule.getCurrentUser() : null;

    if (client && isConfigured && user) {
      try {
        const { data, error } = await client
          .from('movimentacoes')
          .select('*, itens(nome, categoria, unidade)')
          .eq('usuario_id', user.id)
          .eq('tipo', 'retirada')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar minhas requisições:', error);
          this.useFallbackData();
        } else {
          this.requisicoesList = data || [];
          this.renderTable();
        }
      } catch (err) {
        console.error('Exceção ao buscar minhas requisições:', err);
        this.useFallbackData();
      }
    } else {
      this.useFallbackData();
    }
  },

  useFallbackData: function () {
    const now = new Date();
    this.requisicoesList = [
      {
        id: 'mov-101',
        created_at: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
        quantidade: 2,
        tipo: 'retirada',
        itens: { nome: 'Resma Papel A4 75g (500 Folhas)', categoria: 'papelaria', unidade: 'pacote' }
      },
      {
        id: 'mov-102',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        quantidade: 1,
        tipo: 'retirada',
        itens: { nome: 'Mouse USB Ergonômico Preto 1600 DPI', categoria: 'informatica', unidade: 'un' }
      },
      {
        id: 'mov-103',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        quantidade: 1,
        tipo: 'retirada',
        itens: { nome: 'Toner HP Laserjet 107A Preto', categoria: 'impressao', unidade: 'un' }
      }
    ];
    this.renderTable();
  },

  filterTable: function () {
    this.renderTable();
  },

  renderTable: function () {
    const tbody = document.getElementById('my-req-table-body');
    const emptyState = document.getElementById('my-req-empty');
    const badgeCount = document.getElementById('my-req-count-badge');
    const kpiBadge = document.getElementById('kpi-minhas-retiradas');

    if (!tbody) return;

    const searchInput = document.getElementById('my-req-search');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = this.requisicoesList.filter(item => {
      const nomeItem = item.itens ? item.itens.nome.toLowerCase() : '';
      const catItem = item.itens ? item.itens.categoria.toLowerCase() : '';
      return !query || nomeItem.includes(query) || catItem.includes(query);
    });

    if (badgeCount) badgeCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'registro' : 'registros'}`;
    if (kpiBadge) kpiBadge.textContent = this.requisicoesList.length;

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    filtered.forEach(req => {
      const date = new Date(req.created_at);
      const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const itemNome = req.itens ? req.itens.nome : 'Item Insumo';
      const itemCat = req.itens ? req.itens.categoria : 'outros';
      const itemUn = req.itens ? req.itens.unidade : 'un';
      const catLabel = this.categoryLabels[itemCat] || itemCat;

      const row = document.createElement('tr');
      row.className = 'hover:bg-surface-container-low/50 transition-colors';

      row.innerHTML = `
        <td class="p-space-md whitespace-nowrap">
          <div class="flex flex-col">
            <span class="font-label-md text-label-md font-semibold text-on-surface">${formattedDate}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">${formattedTime}</span>
          </div>
        </td>
        <td class="p-space-md">
          <span class="font-label-md text-label-md font-bold text-primary">${itemNome}</span>
        </td>
        <td class="p-space-md whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-semibold bg-surface-container text-primary">
            ${catLabel}
          </span>
        </td>
        <td class="p-space-md text-center whitespace-nowrap">
          <span class="font-headline-sm text-headline-sm font-bold text-primary">${req.quantidade}</span>
          <span class="font-body-sm text-body-sm text-on-surface-variant">${itemUn}</span>
        </td>
        <td class="p-space-md text-center whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-bold bg-primary-container text-on-primary">
            Retirada
          </span>
        </td>
        <td class="p-space-md text-right whitespace-nowrap">
          <span class="inline-flex items-center gap-1 font-label-xs text-label-xs text-secondary font-semibold">
            <span class="material-symbols-outlined text-[14px]">lock</span> Imutável
          </span>
        </td>
      `;

      tbody.appendChild(row);
    });
  }
};
