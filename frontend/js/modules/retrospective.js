/**
 * Season Retrospective View Module.
 * Computes analytics and renders summary modal for finished/previewed seasons.
 */

import { escapeHtml } from '../utils/sanitize.js';
import { getLocalDateStr } from '../utils/format.js';

export function calculateSeasonRetrospective(season, logs = [], dailyLogs = [], habitLogs = []) {
    if (!season) return null;

    const start = new Date(season.startDate).getTime();
    const end = new Date(season.endDate).getTime();

    // 1. Total Focused Hours
    const seasonLogs = logs.filter(l => {
        const t = new Date(l.timestamp).getTime();
        return t >= start && t <= end;
    });
    const totalSeconds = seasonLogs.reduce((acc, l) => acc + (l.seconds || 0), 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);

    // 2. Micro-habit completion rate (% of days in season)
    const seasonHabitLogs = habitLogs.filter(h => {
        if (h.seasonId && h.seasonId !== season.id) return false;
        const d = new Date(h.date).getTime();
        return d >= start && d <= end && h.completed;
    });

    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const completedDaysCount = new Set(seasonHabitLogs.map(h => h.date)).size;
    const habitCompletionRate = Math.min(100, Math.round((completedDaysCount / totalDays) * 100));

    // 3. High-energy vs low-energy day split
    const seasonDailyLogs = dailyLogs.filter(d => {
        const t = new Date(d.date || d.timestamp).getTime();
        return t >= start && t <= end;
    });

    let highEnergyDays = 0;
    let lowEnergyDays = 0;
    let normalEnergyDays = 0;

    seasonDailyLogs.forEach(log => {
        const mode = (log.energyMode || '').toLowerCase();
        if (mode === 'production' || mode === 'high' || mode === 'sprint') {
            highEnergyDays++;
        } else if (mode === 'recovery' || mode === 'low' || mode === 'rest') {
            lowEnergyDays++;
        } else {
            normalEnergyDays++;
        }
    });

    // 4. Day-by-day strip visualization data
    const dayStrip = [];
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 0; i < totalDays; i++) {
        const currentMs = start + i * dayMs;
        const dateStr = getLocalDateStr(currentMs);
        
        const hasHabit = seasonHabitLogs.some(h => h.date === dateStr);
        const dayLog = seasonDailyLogs.find(d => getLocalDateStr(d.date) === dateStr);
        const dayFocusSec = seasonLogs
            .filter(l => getLocalDateStr(l.timestamp) === dateStr)
            .reduce((sum, l) => sum + (l.seconds || 0), 0);

        dayStrip.push({
            date: dateStr,
            hasHabit,
            energyMode: dayLog ? dayLog.energyMode : 'none',
            focusHours: (dayFocusSec / 3600).toFixed(1)
        });
    }

    return {
        season,
        totalHours,
        habitCompletionRate,
        completedDaysCount,
        totalDays,
        highEnergyDays,
        lowEnergyDays,
        normalEnergyDays,
        dayStrip
    };
}

export function renderRetrospectiveModal(retroData) {
    if (!retroData) return '';

    const { season, totalHours, habitCompletionRate, completedDaysCount, totalDays, highEnergyDays, lowEnergyDays, dayStrip } = retroData;

    return `
        <div id="retroModalOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl tab-enter">
                <div class="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <div>
                        <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Season Retrospective</span>
                        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">${escapeHtml(season.title) || 'Season Overview'}</h2>
                        <p class="text-xs text-zinc-500 mt-1">${new Date(season.startDate).toLocaleDateString()} — ${new Date(season.endDate).toLocaleDateString()}</p>
                    </div>
                    <button onclick="closeRetroModal()" class="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                        <div class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">${totalHours}h</div>
                        <div class="text-xs text-zinc-500 font-medium mt-1">Total Focused Time</div>
                    </div>
                    <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                        <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${habitCompletionRate}%</div>
                        <div class="text-xs text-zinc-500 font-medium mt-1">Habit Rate (${completedDaysCount}/${totalDays} days)</div>
                    </div>
                    <div class="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                        <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">${highEnergyDays}:${lowEnergyDays}</div>
                        <div class="text-xs text-zinc-500 font-medium mt-1">High vs Low Energy Days</div>
                    </div>
                </div>

                <!-- Day-by-Day Strip Visualization -->
                <div>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Daily Progress Strip</h4>
                    <div class="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
                        ${dayStrip.map(day => {
                            let bgClass = 'bg-zinc-200 dark:bg-zinc-800';
                            if (day.hasHabit && day.focusHours > 0) bgClass = 'bg-emerald-500';
                            else if (day.hasHabit) bgClass = 'bg-emerald-400/70';
                            else if (day.focusHours > 0) bgClass = 'bg-indigo-500';

                            return `
                                <div class="w-7 h-10 ${bgClass} rounded flex-shrink-0 flex flex-col items-center justify-between py-1 text-[9px] font-bold text-white cursor-pointer relative group" title="${day.date}: ${day.focusHours}h focus | Habit: ${day.hasHabit ? 'Done' : 'Missed'}">
                                    <span>${new Date(day.date).getDate()}</span>
                                    <span>${day.hasHabit ? '✓' : ''}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="flex justify-end pt-2">
                    <button onclick="closeRetroModal()" class="px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold text-sm hover:opacity-90 transition">
                        Close Overview
                    </button>
                </div>
            </div>
        </div>
    `;
}
