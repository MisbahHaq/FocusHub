export function applyTheme(theme) {
    const html = document.documentElement;
    html.classList.remove('dark', 'midnight');
    if (theme === 'dark') html.classList.add('dark');
    if (theme === 'midnight') html.classList.add('midnight');
    localStorage.setItem('theme', theme);
}

export function toggleTheme() {
    const current = localStorage.getItem('theme') || 'light';
    const next = current === 'light' ? 'midnight' : current === 'midnight' ? 'dark' : 'light';
    applyTheme(next);
    updateThemeIcon(next);
}

export function updateThemeIcon(theme) {
    const darkIcon = document.querySelector('#themeToggle .dark-icon');
    const lightIcon = document.querySelector('#themeToggle .light-icon');
    const midnightIcon = document.querySelector('#themeToggle .midnight-icon');
    if (!darkIcon || !lightIcon || !midnightIcon) return;

    darkIcon.classList.toggle('hidden', theme !== 'dark');
    lightIcon.classList.toggle('hidden', theme === 'midnight' || theme === 'dark');
    midnightIcon.classList.toggle('hidden', theme !== 'midnight');
}

export function applySavedTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        applyTheme(saved);
        updateThemeIcon(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
        updateThemeIcon('dark');
    } else {
        applyTheme('light');
        updateThemeIcon('light');
    }
}
