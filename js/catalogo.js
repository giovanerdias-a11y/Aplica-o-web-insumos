/**
 * catalogo.js — Módulo de Catálogo & Requisição de Insumos (US-02, US-03, US-04).
 */

window.CatalogoModule = {
  itensList: [],
  currentItem: null,

  categoryLabels: {
    'papelaria': 'Papelaria',
    'impressao': 'Impressão',
    'informatica': 'Informática & Periféricos',
    'outros': 'Outros Insumos'
  },

  loadItens: async function () {
    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');

    if (client && isConfigured) {
      try {
        const { data, error } = await client
          .from('itens')
          .select('*')
          .eq('ativo', true)
          .order('nome', { ascending: true });

        if (error) {
          console.error('Erro ao buscar itens:', error);
          this.useFallbackData();
        } else {
          this.itensList = data || [];
          this.updateKPIs();
          this.renderItens();
        }
      } catch (err) {
        console.error('Exceção ao buscar catálogo:', err);
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
      { id: '44444444-4444-4444-4444-444444444444', nome: 'Teclado USB Padrão ABNT2', categoria: 'informatica', unidade: 'un', saldo_atual: 5, estoque_minimo: 2, ativo: true },
      { id: '55555555-5555-5555-5555-555555555555', nome: 'Cabo HDMI 2.0 High Speed 2 metros', categoria: 'informatica', unidade: 'un', saldo_atual: 12, estoque_minimo: 3, ativo: true },
      { id: '66666666-6666-6666-6666-666666666666', nome: 'Pilhas AA Alcolinas (Pacote c/ 4 un)', categoria: 'outros', unidade: 'pacote', saldo_atual: 3, estoque_minimo: 5, ativo: true }
    ];
    this.updateKPIs();
    this.renderItens();
  },

  updateKPIs: function () {
    const totalEl = document.getElementById('kpi-total-itens');
    const baixoEl = document.getElementById('kpi-baixo-estoque');

    const totalCount = this.itensList.length;
    const baixoCount = this.itensList.filter(item => item.saldo_atual <= item.estoque_minimo).length;

    if (totalEl) totalEl.textContent = totalCount;
    if (baixoEl) baixoEl.textContent = baixoCount;
  },

  filterItens: function () {
    this.renderItens();
  },

  resetFilters: function () {
    const searchInput = document.getElementById('cat-search-input');
    const categorySelect = document.getElementById('cat-category-select');

    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'all';

    this.renderItens();
  },

  renderItens: function () {
    const container = document.getElementById('cat-grid-container');
    const emptyState = document.getElementById('cat-empty-state');
    if (!container) return;

    const searchInput = document.getElementById('cat-search-input');
    const categorySelect = document.getElementById('cat-category-select');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCat = categorySelect ? categorySelect.value : 'all';

    const filtered = this.itensList.filter(item => {
      const matchQuery = !query || item.nome.toLowerCase().includes(query) || item.categoria.toLowerCase().includes(query);
      const matchCat = (selectedCat === 'all') || (item.categoria === selectedCat);
      return matchQuery && matchCat;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
    }

    filtered.forEach(item => {
      const isLowStock = item.saldo_atual <= item.estoque_minimo;
      const catLabel = this.categoryLabels[item.categoria] || item.categoria;

      const card = document.createElement('div');
      card.className = 'bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between';

      card.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-space-sm mb-space-sm">
            <span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-semibold bg-surface-container text-primary">
              ${catLabel}
            </span>
            ${isLowStock ? `
              <span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-bold bg-error-container text-on-error-container flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">warning</span> Estoque Baixo
              </span>
            ` : `
              <span class="px-2.5 py-1 rounded-full font-label-xs text-label-xs font-semibold bg-surface-container-low text-on-surface-variant">
                Disponível
              </span>
            `}
          </div>

          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug mb-space-xs">
            ${item.nome}
          </h3>

          <div class="flex items-baseline gap-space-xs mt-space-md pt-space-sm border-t border-outline-variant/30">
            <span class="font-body-sm text-body-sm text-on-surface-variant">Saldo em estoque:</span>
            <span class="font-headline-lg text-headline-lg font-bold ${isLowStock ? 'text-error' : 'text-primary'}">
              ${item.saldo_atual}
            </span>
            <span class="font-body-sm text-body-sm text-on-surface-variant">${item.unidade || 'un'}</span>
          </div>
        </div>

        <div class="mt-space-lg pt-space-sm">
          <button type="button" onclick="window.CatalogoModule.openModal('${item.id}')"
                  class="w-full py-2.5 px-space-md bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg hover:bg-primary-container shadow-sm transition-all flex items-center justify-center gap-space-xs ${item.saldo_atual <= 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                  ${item.saldo_atual <= 0 ? 'disabled' : ''}>
            <span class="material-symbols-outlined text-body-lg">output</span>
            <span>${item.saldo_atual <= 0 ? 'Sem Estoque' : 'Requisitar Material'}</span>
          </button>
        </div>
      `;

      container.appendChild(card);
    });
  },

  openModal: function (itemId) {
    const item = this.itensList.find(i => i.id === itemId);
    if (!item) return;

    this.currentItem = item;

    const nomeEl = document.getElementById('modal-item-nome');
    const catEl = document.getElementById('modal-item-cat');
    const saldoEl = document.getElementById('modal-item-saldo');
    const qtyInput = document.getElementById('req-qtd');

    if (nomeEl) nomeEl.textContent = item.nome;
    if (catEl) catEl.textContent = this.categoryLabels[item.categoria] || item.categoria;
    if (saldoEl) saldoEl.textContent = `${item.saldo_atual} ${item.unidade || 'un'}`;
    if (qtyInput) qtyInput.value = 1;

    const modal = document.getElementById('requisition-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    this.validateQty();
  },

  closeModal: function () {
    const modal = document.getElementById('requisition-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  adjustQty: function (delta) {
    const qtyInput = document.getElementById('req-qtd');
    if (!qtyInput) return;

    let val = parseInt(qtyInput.value || '1', 10) + delta;
    if (val < 1) val = 1;
    qtyInput.value = val;

    this.validateQty();
  },

  validateQty: function () {
    const qtyInput = document.getElementById('req-qtd');
    const alertBox = document.getElementById('modal-insufficient-alert');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (!qtyInput || !this.currentItem) return;

    const qty = parseInt(qtyInput.value || '0', 10);
    const available = this.currentItem.saldo_atual;

    if (qty <= 0 || qty > available) {
      if (alertBox) alertBox.classList.remove('hidden');
      if (submitBtn) submitBtn.disabled = true;
    } else {
      if (alertBox) alertBox.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  submitRequisition: async function (event) {
    if (event) event.preventDefault();

    if (!this.currentItem) return;

    const qtyInput = document.getElementById('req-qtd');
    const qty = parseInt(qtyInput.value || '1', 10);

    if (qty <= 0 || qty > this.currentItem.saldo_atual) {
      if (window.ToastModule) {
        window.ToastModule.show(`Saldo insuficiente. Disponível: ${this.currentItem.saldo_atual}`, 'error');
      }
      return;
    }

    const spinner = document.getElementById('modal-submit-spinner');
    const label = document.getElementById('modal-submit-label');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (spinner) spinner.classList.remove('hidden');
    if (label) label.textContent = 'Registrando...';
    if (submitBtn) submitBtn.disabled = true;

    const client = window.supabaseClient;
    const isConfigured = window.SUPABASE_CONFIG && !window.SUPABASE_CONFIG.URL.includes('sua-url-supabase');

    if (client && isConfigured) {
      try {
        const { data, error } = await client.rpc('retirar_item', {
          p_item: this.currentItem.id,
          p_qtd: qty
        });

        if (error) {
          if (window.ToastModule) {
            window.ToastModule.show(error.message || 'Erro ao processar retirada.', 'error');
          }
        } else {
          if (window.ToastModule) {
            window.ToastModule.show(`Retirada efetuada com sucesso! ${qty}x ${this.currentItem.nome}`, 'success');
          }
          this.closeModal();
          await this.loadItens();
        }
      } catch (err) {
        if (window.ToastModule) {
          window.ToastModule.show(err.message || 'Falha ao executar operação.', 'error');
        }
      }
    } else {
      // Demo local fallback
      setTimeout(() => {
        this.currentItem.saldo_atual -= qty;
        if (window.ToastModule) {
          window.ToastModule.show(`[Homologação] Retirada confirmada: ${qty}x ${this.currentItem.nome}. Novo saldo: ${this.currentItem.saldo_atual}`, 'success');
        }
        this.closeModal();
        this.updateKPIs();
        this.renderItens();
      }, 600);
    }

    if (spinner) spinner.classList.add('hidden');
    if (label) label.textContent = 'Confirmar Retirada';
    if (submitBtn) submitBtn.disabled = false;
  }
};
