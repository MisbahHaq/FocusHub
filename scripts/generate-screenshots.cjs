const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

function createSvgScreenshot(title, subtitle, accentColor = '#6366f1') {
    return `<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="450" fill="#111318" rx="16"/>
    <!-- Header bar -->
    <rect width="800" height="40" fill="#1c1f28" rx="16"/>
    <circle cx="30" cy="20" r="6" fill="#ef4444"/>
    <circle cx="50" cy="20" r="6" fill="#eab308"/>
    <circle cx="70" cy="20" r="6" fill="#22c55e"/>
    <text x="400" y="25" fill="#a3a5b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Focus Synergy — ${title}</text>
    
    <!-- Sidebar -->
    <rect x="20" y="60" width="180" height="370" fill="#181a1e" rx="12"/>
    <rect x="35" y="80" width="150" height="32" fill="${accentColor}" rx="6" opacity="0.3"/>
    <text x="45" y="101" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="bold">${title}</text>

    <rect x="35" y="125" width="150" height="24" fill="#222633" rx="6"/>
    <rect x="35" y="160" width="150" height="24" fill="#222633" rx="6"/>
    <rect x="35" y="195" width="150" height="24" fill="#222633" rx="6"/>

    <!-- Main Panel -->
    <rect x="220" y="60" width="560" height="370" fill="#1c1f28" rx="12"/>
    <text x="250" y="110" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold">${title}</text>
    <text x="250" y="135" fill="#a3a5b8" font-family="system-ui, -apple-system, sans-serif" font-size="14">${subtitle}</text>

    <!-- Dynamic Visual Widget -->
    <rect x="250" y="160" width="500" height="240" fill="#111318" rx="12" stroke="#31354a" stroke-width="1"/>
    <circle cx="500" cy="260" r="60" fill="none" stroke="${accentColor}" stroke-width="12" opacity="0.8"/>
    <text x="500" y="265" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">00:45:00</text>
</svg>`;
}

const screens = [
    { name: 'dashboard.svg', title: 'Smart Timers & Tracker', sub: 'Deep work loops with real-time countdown & item ledger', color: '#6366f1' },
    { name: 'heatmap.svg', title: 'Activity Heatmap', sub: 'Year-long focus intensity & streak tracking calendar', color: '#10b981' },
    { name: 'seasons.svg', title: 'Seasons Planner', sub: 'Structured 4-6 week focus blocks & energy mode logs', color: '#f59e0b' },
    { name: 'notes.svg', title: 'Notes Workspace', sub: 'Rich auto-saving note editor for deep work thoughts', color: '#ec4899' }
];

for (const s of screens) {
    const svg = createSvgScreenshot(s.title, s.sub, s.color);
    fs.writeFileSync(path.join(docsDir, s.name), svg);
    console.log(`Generated ${s.name}`);
}
