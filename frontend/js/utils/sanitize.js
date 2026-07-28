const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;' };

export function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"'`/]/g, s => entityMap[s]);
}

export function sanitizeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
}
