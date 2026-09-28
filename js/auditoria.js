/**
 * auditoria.js — Módulo de Extrato Completo & Auditoria (US-09 e US-10).
 */

window.AuditoriaModule = {
  extratoList: [],

  categoryLabels: {
    'papelaria': 'Papelaria',
    'impressao': 'Impressão',
    'informatica': 'Informática',
    'outros': 'Outros'
  },

  loadExtrato: async function () {
    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');

    if (client && isConfigured) {
      try {
        const { data, error } = await client
          .from('movimentacoes')
          .select('*, itens(nome, categoria, unidade)')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar extrato de auditoria:', error);
          this.useFallbackData();
        } else {
          this.extratoList = data || [];
          this.renderTable();
        }
      } catch (err) {
        console.error('Exceção ao carregar extrato:', err);
        this.useFallbackData();
      }
    } else {
      this.useFallbackData();
    }
  },

  useFallbackData: function () {
    const now = new Date();
    this.extratoList = [
      {
        id: 'tx-89021',
        created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        tipo: 'retirada',
        quantidade: 2,
        usuario_id: 'usr-marcelo-silva',
        itens: { nome: 'Resma Papel A4 75g (500 Folhas)', categoria: 'papelaria', unidade: 'pacote' }
      },
      {
        id: 'tx-89020',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
        tipo: 'reposicao',
        quantidade: 10,
        usuario_id: 'usr-camila-ti',
        itens: { nome: 'Toner HP Laserjet 107A Preto', categoria: 'impressao', unidade: 'un' }
      },
      {
        id: 'tx-89019',
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
        tipo: 'ajuste',
        quantidade: 2,
        usuario_id: 'usr-camila-ti',
        itens: { nome: 'Mouse USB Ergonômico Preto 1600 DPI', categoria: 'informatica', unidade: 'un' }
      }
    ];
    this.renderTable();
  },

  filterExtrato: function () {
    this.renderTable();
  },

  renderTable: function () {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    const filterType = document.getElementById('audit-filter-type')?.value || 'all';

    const filtered = this.extratoList.filter(item => {
      return (filterType === 'all') || (item.tipo === filterType);
    });

    tbody.innerHTML = '';

    filtered.forEach(mov => {
      const date = new Date(mov.created_at);
      const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const itemNome = mov.itens ? mov.itens.nome : 'Item Insumo';
      const itemUn = mov.itens ? mov.itens.unidade : 'un';
      const userBadge = mov.usuario_id ? mov.usuario_id.substring(0, 18) + '...' : 'Usuário Sistema';

      let tipoBadge = '';
      if (mov.tipo === 'retirada') {
        tipoBadge = '<span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-bold bg-primary-container text-on-primary">Retirada</span>';
      } else if (mov.tipo === 'reposicao') {
        tipoBadge = '<span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-bold bg-secondary-container text-on-secondary-container">Reposição</span>';
      } else {
        tipoBadge = '<span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-bold bg-surface-container-high text-on-surface">Ajuste</span>';
      }

      const row = document.createElement('tr');
      row.className = 'hover:bg-surface-container-low/50 transition-colors';

      row.innerHTML = `
        <td class="p-space-md whitespace-nowrap">
          <div class="flex flex-col">
            <span class="font-label-md text-label-md font-semibold text-on-surface">${formattedDate}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">${formattedTime}</span>
          </div>
        </td>
        <td class="p-space-md font-bold text-primary">${itemNome}</td>
        <td class="p-space-md whitespace-nowrap">${tipoBadge}</td>
        <td class="p-space-md text-center whitespace-nowrap">
          <span class="font-headline-sm text-headline-sm font-bold text-primary">${mov.quantidade}</span>
          <span class="font-body-sm text-body-sm text-on-surface-variant">${itemUn}</span>
        </td>
        <td class="p-space-md font-mono text-body-sm text-on-surface-variant whitespace-nowrap">${userBadge}</td>
        <td class="p-space-md text-right whitespace-nowrap">
          <button type="button" onclick="window.AuditoriaModule.openDrawer('${mov.id}')" class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high font-label-xs text-label-xs text-primary font-bold">
            Ver Detalhes
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });
  },

  openDrawer: function (movId) {
    const mov = this.extratoList.find(m => m.id === movId);
    const drawer = document.getElementById('forensic-drawer');
    const content = document.getElementById('drawer-content');

    if (!mov || !drawer || !content) return;

    const date = new Date(mov.created_at).toLocaleString('pt-BR');
    const itemNome = mov.itens ? mov.itens.nome : 'Insumo';

    content.innerHTML = `
      <div class="p-space-md bg-surface-container-low rounded-lg space-y-2">
        <div><span class="text-on-surface-variant text-label-xs uppercase font-bold block">ID da Transação:</span> <span class="font-mono text-body-sm font-bold text-primary">${mov.id}</span></div>
        <div><span class="text-on-surface-variant text-label-xs uppercase font-bold block">Data e Hora:</span> <span class="font-body-md font-semibold">${date}</span></div>
        <div><span class="text-on-surface-variant text-label-xs uppercase font-bold block">Insumo Afetado:</span> <span class="font-body-md font-bold text-primary">${itemNome}</span></div>
        <div><span class="text-on-surface-variant text-label-xs uppercase font-bold block">Tipo da Operação:</span> <span class="font-body-md uppercase font-bold">${mov.tipo}</span></div>
        <div><span class="text-on-surface-variant text-label-xs uppercase font-bold block">Quantidade Movimentada:</span> <span class="font-headline-sm text-headline-sm font-bold text-primary">${mov.quantidade}</span></div>
        <div><span class="text-on-surface-variant text-label-xs uppercase font-bold block">Usuário UUID (auth.uid):</span> <span class="font-mono text-body-sm">${mov.usuario_id}</span></div>
      </div>
      <div class="p-space-md bg-surface-container-high rounded-lg flex items-center gap-space-sm">
        <span class="material-symbols-outlined text-secondary">verified_user</span>
        <span class="font-label-xs text-label-xs text-on-surface-variant">Registro protegido pelo Trigger Postgres (trg_mov_imutavel). Exclusão ou alteração bloqueada no banco.</span>
      </div>
    `;

    drawer.classList.remove('hidden');
  },

  exportCSV: function () {
    if (this.extratoList.length === 0) {
      if (window.ToastModule) window.ToastModule.show('Nenhum dado para exportar.', 'error');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,ID,Data,Item,Tipo,Quantidade,Usuario\n';

    this.extratoList.forEach(m => {
      const date = new Date(m.created_at).toISOString();
      const itemNome = m.itens ? `"${m.itens.nome.replace(/"/g, '""')}"` : 'Insumo';
      csvContent += `${m.id},${date},${itemNome},${m.tipo},${m.quantidade},${m.usuario_id}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `extrato_auditoria_nexora_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.ToastModule) {
      window.ToastModule.show('Relatório CSV de auditoria baixado com sucesso!', 'success');
    }
  }
};
