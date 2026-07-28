/**
 * Data Export module for Focus Synergy.
 * Supports JSON (full fidelity) and CSV (logs & dailyLogs) exports.
 * Supports web browser download blobs and Tauri native file dialogs.
 */

import { isTauriEnv } from '../utils/tauri.js';
export { isTauriEnv };

export async function exportUserData(adapter) {
    const data = await adapter.getAllData();
    return data;
}

export function downloadJsonFile(data, filename = 'focus_synergy_export.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerBlobDownload(blob, filename);
}

export function convertLogsToCsv(logs, itemsMap = {}) {
    const headers = ['Log ID', 'Item ID', 'Item Name', 'Seconds Logged', 'Hours Logged', 'Timestamp'];
    const rows = logs.map(log => {
        const itemName = itemsMap[log.itemId] ? itemsMap[log.itemId].name || itemsMap[log.itemId].title : 'Unknown';
        const hours = (log.seconds / 3600).toFixed(2);
        return [
            log.id,
            log.itemId || '',
            `"${(itemName || '').replace(/"/g, '""')}"`,
            log.seconds || 0,
            hours,
            log.timestamp || ''
        ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
}

export function convertDailyLogsToCsv(dailyLogs) {
    const headers = ['Log ID', 'Date', 'Energy Mode', 'Timestamp'];
    const rows = dailyLogs.map(log => [
        log.id,
        log.date || '',
        log.energyMode || '',
        log.timestamp || ''
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

export function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function saveFileWithTauri(content, filename, filters = []) {
    if (!isTauriEnv() || !window.__TAURI__?.dialog?.save) {
        return false;
    }
    try {
        const filePath = await window.__TAURI__.dialog.save({
            defaultPath: filename,
            filters: filters.length > 0 ? filters : undefined
        });
        if (filePath) {
            const { writeTextFile } = window.__TAURI__.fs;
            await writeTextFile(filePath, content);
            return true;
        }
    } catch (e) {
        console.warn('Tauri save dialog error:', e);
    }
    return false;
}

export async function exportAllData(adapter, items = []) {
    const data = await adapter.getAllData();
    const itemsMap = (items || []).reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});

    const dateStr = new Date().toISOString().split('T')[0];

    // 1. JSON export
    const jsonStr = JSON.stringify(data, null, 2);
    const jsonFilename = `focus_synergy_export_${dateStr}.json`;
    if (isTauriEnv()) {
        const saved = await saveFileWithTauri(jsonStr, jsonFilename, [
            { name: 'JSON', extensions: ['json'] }
        ]);
        if (!saved) triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), jsonFilename);
    } else {
        triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), jsonFilename);
    }

    // 2. CSV for logs
    if (data.logs && data.logs.length > 0) {
        const csvLogs = convertLogsToCsv(data.logs, itemsMap);
        const logsFilename = `focus_synergy_logs_${dateStr}.csv`;
        if (isTauriEnv()) {
            const saved = await saveFileWithTauri(csvLogs, logsFilename, [
                { name: 'CSV', extensions: ['csv'] }
            ]);
            if (!saved) triggerBlobDownload(new Blob([csvLogs], { type: 'text/csv' }), logsFilename);
        } else {
            triggerBlobDownload(new Blob([csvLogs], { type: 'text/csv' }), logsFilename);
        }
    }

    // 3. CSV for dailyLogs
    if (data.dailyLogs && data.dailyLogs.length > 0) {
        const csvDaily = convertDailyLogsToCsv(data.dailyLogs);
        const dailyFilename = `focus_synergy_daily_energy_${dateStr}.csv`;
        if (isTauriEnv()) {
            const saved = await saveFileWithTauri(csvDaily, dailyFilename, [
                { name: 'CSV', extensions: ['csv'] }
            ]);
            if (!saved) triggerBlobDownload(new Blob([csvDaily], { type: 'text/csv' }), dailyFilename);
        } else {
            triggerBlobDownload(new Blob([csvDaily], { type: 'text/csv' }), dailyFilename);
        }
    }
}
