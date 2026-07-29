const globalListeners = new Map();

export function createStore(initialState) {
  const store = new Proxy(initialState, {
    set(target, key, value) {
      const old = target[key];
      target[key] = value;
      if (old !== value && globalListeners.has(key)) {
        globalListeners.get(key).forEach(fn => fn(value, old));
      }
      return true;
    },
    get(target, key) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        return target[key];
      }
      return target[key];
    },
  });
  return store;
}

export function subscribe(key, fn) {
  if (!globalListeners.has(key)) globalListeners.set(key, new Set());
  globalListeners.get(key).add(fn);
  return () => globalListeners.get(key).delete(fn);
}

export function showError(message, context = '') {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold bg-red-900 text-red-100 border-red-700 flex items-center gap-2 max-w-sm';
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
  if (context) console.error(`[${context}] ${message}`);
}

export function showConfirm(message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 tab-enter';
    overlay.innerHTML = `
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <p class="text-sm text-zinc-700 dark:text-zinc-300">${message}</p>
        <div class="flex justify-end gap-2">
          <button id="confirm-cancel" class="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Cancel</button>
          <button id="confirm-ok" class="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs rounded-xl hover:opacity-90 transition">OK</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
    document.getElementById('confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
  });
}
