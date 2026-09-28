/**
 * gestao.js — Módulo de Gestão de Insumos para Gestores de TI (US-06, US-07, US-08).
 */

window.GestaoModule = {
  itensList: [],

  categoryLabels: {
    'papelaria': 'Papelaria',
    'impressao': 'Impressão',
    'informatica': 'Informática',
    'outros': 'Outros'
  },

  loadItens: async function () {
    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');

    if (client && isConfigured) {
      try {
        const { data, error } = await client
          .from('itens')
          .select('*')
          .order('nome', { ascending: true });

        if (error) {
          console.error('Erro ao carregar itens da gestão:', error);
          this.useFallbackData();
        } else {
          this.itensList = data || [];
          this.renderTable();
          this.populateItemSelects();
        }
      } catch (err) {
        console.error('Exceção ao carregar itens da gestão:', err);
        this.useFallbackData();
      }
    } else {
      this.useFallbackData();
    }
  },

  useFallbackData: function () {
    this.itensList = [
      { id: '11111111-1111-1111-1111-111111111111', nome: 'Resma Papel A4 75g (500 Folhas)', categoria: 'papelaria', unidade: 'pacote', saldo_atual: 14, estoque_minimo: 5, ativo: true },
      { id: '22222222-2222-2222-2222-222222222222', nome: 'Toner HP Laserjet 107A Preto', categoria: 'impressao', unidade: 'un', saldo_atual: 1, estoque_minimo: 3, ativo: true },
      { id: '33333333-3333-3333-3333-333333333333', nome: 'Mouse USB Ergonômico Preto 1600 DPI', categoria: 'informatica', unidade: 'un', saldo_atual: 8, estoque_minimo: 4, ativo: true },
      { id: '44444444-4444-4444-4444-444444444444', nome: 'Teclado USB Padrão ABNT2', categoria: 'informatica', unidade: 'un', saldo_atual: 5, estoque_minimo: 2, ativo: true }
    ];
    this.renderTable();
    this.populateItemSelects();
  },

  populateItemSelects: function () {
    const reporSelect = document.getElementById('repor-item-id');
    const ajustarSelect = document.getElementById('ajustar-item-id');

    const optionsHTML = this.itensList.map(item =>
      `<option value="${item.id}">${item.nome} (Saldo atual: ${item.saldo_atual} ${item.unidade || 'un'})</option>`
    ).join('');

    if (reporSelect) reporSelect.innerHTML = optionsHTML;
    if (ajustarSelect) ajustarSelect.innerHTML = optionsHTML;
  },

  renderTable: function () {
    const tbody = document.getElementById('gestao-table-body');
    const countEl = document.getElementById('gestao-item-count');

    if (!tbody) return;

    if (countEl) countEl.textContent = `${this.itensList.length} itens cadastrados`;

    tbody.innerHTML = '';

    this.itensList.forEach(item => {
      const isLowStock = item.saldo_atual <= item.estoque_minimo;
      const catLabel = this.categoryLabels[item.categoria] || item.categoria;

      const row = document.createElement('tr');
      row.className = 'hover:bg-surface-container-low/50 transition-colors';

      row.innerHTML = `
        <td class="p-space-md font-bold text-primary">${item.nome}</td>
        <td class="p-space-md">
          <span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-semibold bg-surface-container text-primary">
            ${catLabel}
          </span>
        </td>
        <td class="p-space-md text-center text-on-surface-variant">${item.unidade || 'un'}</td>
        <td class="p-space-md text-center">
          <span class="font-headline-sm text-headline-sm font-bold ${isLowStock ? 'text-error' : 'text-primary'}">
            ${item.saldo_atual}
          </span>
        </td>
        <td class="p-space-md text-center text-on-surface-variant font-semibold">${item.estoque_minimo}</td>
        <td class="p-space-md text-center">
          <div class="flex items-center justify-center gap-space-xs">
            <button type="button" onclick="window.GestaoModule.openModalRepor('${item.id}')" title="Repor Estoque" class="px-2 py-1 rounded bg-secondary text-on-secondary font-label-xs text-label-xs font-bold hover:opacity-90">
              + Repor
            </button>
            <button type="button" onclick="window.GestaoModule.openModalAjustar('${item.id}')" title="Ajustar Inventário" class="px-2 py-1 rounded bg-surface-container-high text-on-surface font-label-xs text-label-xs font-bold hover:bg-surface-container border border-outline-variant">
              Ajustar
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(row);
    });
  },

  // Modal Cadastrar Item (US-06)
  openModalCriar: function () {
    const modal = document.getElementById('modal-criar-item');
    if (modal) modal.classList.remove('hidden');
  },
  closeModalCriar: function () {
    const modal = document.getElementById('modal-criar-item');
    if (modal) modal.classList.add('hidden');
  },
  submitCriarItem: async function (event) {
    if (event) event.preventDefault();

    const nome = document.getElementById('criar-nome').value.trim();
    const categoria = document.getElementById('criar-categoria').value;
    const unidade = document.getElementById('criar-unidade').value.trim() || 'un';
    const saldoInicial = parseInt(document.getElementById('criar-saldo').value || '0', 10);
    const estoqueMinimo = parseInt(document.getElementById('criar-minimo').value || '0', 10);

    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');

    if (client && isConfigured) {
      try {
        const { data, error } = await client.rpc('criar_item', {
          p_nome: nome,
          p_categoria: categoria,
          p_unidade: unidade,
          p_saldo_inicial: saldoInicial,
          p_estoque_minimo: estoqueMinimo
        });

        if (error) {
          if (window.ToastModule) window.ToastModule.show(error.message || 'Erro ao cadastrar item.', 'error');
        } else {
          if (window.ToastModule) window.ToastModule.show(`Item "${nome}" cadastrado com sucesso!`, 'success');
          this.closeModalCriar();
          document.getElementById('form-criar-item').reset();
          await this.loadItens();
          if (window.CatalogoModule) await window.CatalogoModule.loadItens();
        }
      } catch (err) {
        if (window.ToastModule) window.ToastModule.show(err.message || 'Erro de comunicação.', 'error');
      }
    } else {
      // Demo fallback
      const newItem = {
        id: 'mock-' + Date.now(),
        nome, categoria, unidade, saldo_atual: saldoInicial, estoque_minimo: estoqueMinimo, ativo: true
      };
      this.itensList.push(newItem);
      this.renderTable();
      this.populateItemSelects();
      if (window.ToastModule) window.ToastModule.show(`[Homologação] Item "${nome}" cadastrado com sucesso!`, 'success');
      this.closeModalCriar();
      document.getElementById('form-criar-item').reset();
    }
  },

  // Modal Repor Estoque (US-07)
  openModalRepor: function (itemId) {
    if (itemId) {
      const select = document.getElementById('repor-item-id');
      if (select) select.value = itemId;
    }
    const modal = document.getElementById('modal-repor-item');
    if (modal) modal.classList.remove('hidden');
  },
  closeModalRepor: function () {
    const modal = document.getElementById('modal-repor-item');
    if (modal) modal.classList.add('hidden');
  },
  submitReporItem: async function (event) {
    if (event) event.preventDefault();

    const itemId = document.getElementById('repor-item-id').value;
    const qtd = parseInt(document.getElementById('repor-qtd').value || '1', 10);

    if (!itemId || qtd <= 0) return;

    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');

    if (client && isConfigured) {
      try {
        const { data, error } = await client.rpc('repor_item', {
          p_item: itemId,
          p_qtd: qtd
        });

        if (error) {
          if (window.ToastModule) window.ToastModule.show(error.message || 'Erro ao repor estoque.', 'error');
        } else {
          if (window.ToastModule) window.ToastModule.show(`Reposicionados ${qtd} unidades com sucesso!`, 'success');
          this.closeModalRepor();
          await this.loadItens();
          if (window.CatalogoModule) await window.CatalogoModule.loadItens();
        }
      } catch (err) {
        if (window.ToastModule) window.ToastModule.show(err.message || 'Erro ao executar reposição.', 'error');
      }
    } else {
      // Demo fallback
      const item = this.itensList.find(i => i.id === itemId);
      if (item) item.saldo_atual += qtd;
      this.renderTable();
      if (window.ToastModule) window.ToastModule.show(`[Homologação] Reposição de ${qtd} un efetuada.`, 'success');
      this.closeModalRepor();
    }
  },

  // Modal Ajustar Inventário (US-08)
  openModalAjustar: function (itemId) {
    if (itemId) {
      const select = document.getElementById('ajustar-item-id');
      if (select) {
        select.value = itemId;
        const item = this.itensList.find(i => i.id === itemId);
        const novoSaldoInput = document.getElementById('ajustar-novo-saldo');
        if (item && novoSaldoInput) novoSaldoInput.value = item.saldo_atual;
      }
    }
    const modal = document.getElementById('modal-ajustar-item');
    if (modal) modal.classList.remove('hidden');
  },
  closeModalAjustar: function () {
    const modal = document.getElementById('modal-ajustar-item');
    if (modal) modal.classList.add('hidden');
  },
  submitAjustarItem: async function (event) {
    if (event) event.preventDefault();

    const itemId = document.getElementById('ajustar-item-id').value;
    const novoSaldo = parseInt(document.getElementById('ajustar-novo-saldo').value || '0', 10);

    if (!itemId || novoSaldo < 0) return;

    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');

    if (client && isConfigured) {
      try {
        const { data, error } = await client.rpc('ajustar_item', {
          p_item: itemId,
          p_novo_saldo: novoSaldo
        });

        if (error) {
          if (window.ToastModule) window.ToastModule.show(error.message || 'Erro ao ajustar saldo.', 'error');
        } else {
          if (window.ToastModule) window.ToastModule.show(`Saldo ajustado para ${novoSaldo} com sucesso!`, 'success');
          this.closeModalAjustar();
          await this.loadItens();
          if (window.CatalogoModule) await window.CatalogoModule.loadItens();
        }
      } catch (err) {
        if (window.ToastModule) window.ToastModule.show(err.message || 'Erro de comunicação.', 'error');
      }
    } else {
      // Demo fallback
      const item = this.itensList.find(i => i.id === itemId);
      if (item) item.saldo_atual = novoSaldo;
      this.renderTable();
      if (window.ToastModule) window.ToastModule.show(`[Homologação] Saldo ajustado para ${novoSaldo}.`, 'success');
      this.closeModalAjustar();
    }
  }
};
