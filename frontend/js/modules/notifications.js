/**
 * Notification management module for Focus Synergy.
 * Handles desktop native notifications and Web API fallback.
 */

let permissionRequested = false;
let notifiedTimerIds = new Set();

import { isTauriEnv } from '../utils/tauri.js';

export async function requestNotificationPermission() {
    if (permissionRequested) return true;
    permissionRequested = true;

    if (isTauriEnv()) {
        try {
            const { isPermissionGranted, requestPermission } = window.__TAURI__?.notification || {};
            if (isPermissionGranted && requestPermission) {
                let granted = await isPermissionGranted();
                if (!granted) {
                    const status = await requestPermission();
                    return status === 'granted';
                }
                return true;
            }
        } catch (e) {
            console.warn("Tauri notification permission error:", e);
        }
    }

    if ("Notification" in window) {
        if (Notification.permission === "default") {
            const status = await Notification.requestPermission();
            return status === "granted";
        }
        return Notification.permission === "granted";
    }

    return false;
}

export async function sendNativeNotification(title, body) {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    if (isTauriEnv() && window.__TAURI__?.notification?.sendNotification) {
        try {
            window.__TAURI__.notification.sendNotification({ title, body });
            return;
        } catch (e) {
            console.warn("Tauri sendNotification error:", e);
        }
    }

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: 'fav.png' });
    }
}

export function checkBreakReminder(item, liveElapsedSeconds, thresholdMinutes = 50, enabled = true) {
    if (!enabled || !item || !item.isRunning) return;

    const thresholdSeconds = thresholdMinutes * 60;
    if (liveElapsedSeconds >= thresholdSeconds) {
        if (!notifiedTimerIds.has(item.id)) {
            notifiedTimerIds.add(item.id);
            const itemName = item.name || item.title || 'Focus Session';
            sendNativeNotification(
                "Time for a Break!",
                `You've been focusing on "${itemName}" for ${Math.floor(liveElapsedSeconds / 60)} minutes. Take a moment to step away and stretch!`
            );
        }
    } else {
        // Reset if timer paused/restarted below threshold
        notifiedTimerIds.delete(item.id);
    }
}

export function resetTimerNotificationState(itemId) {
    notifiedTimerIds.delete(itemId);
}
