import { escapeHtml } from './sanitize.js';
import { createIcons, icons } from 'lucide';

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition-all transform translate-y-0 opacity-100 flex items-center gap-2 ${type === 'warning' ? 'bg-amber-900 text-amber-100 border-amber-700' : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-700'}`;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

export function switchTab(tabId, { playSoundFn } = {}) {
    if (playSoundFn) playSoundFn('nav tap');
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('tab-enter');
    });
    const target = document.getElementById(`tab-${tabId}`);
    if (target) {
        target.classList.remove('hidden');
        void target.offsetWidth;
        target.classList.add('tab-enter');
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = btn.className
            .replace('bg-white/10 text-white', 'text-gray-500 hover:bg-white/5 hover:text-gray-300');
    });
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.className = activeBtn.className
            .replace('text-gray-500 hover:bg-white/5 hover:text-gray-300', 'bg-white/10 text-white');
    }

    if (tabId === 'seasons' && typeof window.renderSeasonsView === 'function') {
        window.renderSeasonsView();
    } else if (tabId === 'calendar' && typeof window.renderCalendarView === 'function') {
        window.renderCalendarView();
    } else if (tabId === 'notes' && typeof window.renderNotesView === 'function') {
        window.renderNotesView();
    }
}

export function playSound(src) {
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play().catch(() => {});
}

export function refreshIcons(container) {
    if (container) {
        createIcons({ icons, attrs: { class: [] } }, container);
    } else {
        createIcons({ icons });
    }
}
