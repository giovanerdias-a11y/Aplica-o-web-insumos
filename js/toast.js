/**
 * toast.js — Notificações e alertas visuais no estilo Nexora.
 */

window.ToastModule = {
  show: function (message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const isError = type === 'error';
    const bgColor = isError ? 'bg-error text-on-error' : 'bg-primary text-on-primary';
    const icon = isError ? 'error' : 'check_circle';
    const iconColor = isError ? 'text-error-container' : 'text-secondary-container';

    toast.className = `pointer-events-auto flex items-center gap-space-sm px-space-md py-space-sm rounded-xl ${bgColor} shadow-xl font-label-md text-label-md transition-all duration-300 transform translate-y-2 opacity-0 z-50`;
    toast.innerHTML = `
      <span class="material-symbols-outlined ${iconColor}" style="font-variation-settings: 'FILL' 1;">${icon}</span>
      <span class="flex-1">${message}</span>
      <button type="button" class="p-1 hover:opacity-75" onclick="this.parentElement.remove()">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
};
