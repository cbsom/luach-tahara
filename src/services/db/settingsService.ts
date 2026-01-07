// Settings Service - Manage user settings
import { getDB } from './schema';
import type { Settings } from '@/types';

const SETTINGS_KEY = 'user-settings';

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: Settings = {
    location: {
        name: 'Jerusalem',
        latitude: 31.7683,
        longitude: 35.2137,
        utcOffset: 2,
        israel: true,
    },
    showFlagsOnMainScreen: true,
    showEntryInfo: true,
    hideFlagsWeekAfterEntry: false,
    calendarDisplaysCurrent: 'jewish',
    discreetReminders: false,
    haflagaOnahs: 0,
    keepThirtyOne: true,
    ohrZeruah: false,
    dilugChodeshPastEnds: false,
    kavuahDiffOnahs: false,
    haflagaOfOnahs: false,
    numberMonthsAheadToWarn: 12,
    onahBeinunis24Hours: false,
    showOhrZeruah: false,
    keepLongerHaflagah: false,
    noProbsAfterEntry: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
};

/**
 * Get user settings
 */
export async function getSettings(): Promise<Settings> {
    const db = await getDB();
    const stored = await db.get('settings', SETTINGS_KEY);

    if (!stored) {
        // Initialize with defaults
        await saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }

    // Return settings without sync metadata
    const { syncStatus, ...settings } = stored;
    return settings as Settings;
}

/**
 * Save user settings
 */
export async function saveSettings(settings: Partial<Settings>): Promise<Settings> {
    const db = await getDB();
    const current = await getSettings();

    const updated = {
        ...current,
        ...settings,
        updatedAt: Date.now(),
    };

    await db.put('settings', {
        ...updated,
        id: SETTINGS_KEY,
        syncStatus: 'pending',
    });

    return updated;
}

/**
 * Update specific setting
 */
export async function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
): Promise<Settings> {
    return saveSettings({ [key]: value } as Partial<Settings>);
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<Settings> {
    const db = await getDB();
    const defaults = {
        ...DEFAULT_SETTINGS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    await db.put('settings', {
        ...defaults,
        id: SETTINGS_KEY,
        syncStatus: 'pending',
    });

    return defaults;
}

/**
 * Check if settings are pending sync
 */
export async function areSettingsPendingSync(): Promise<boolean> {
    const db = await getDB();
    const stored = await db.get('settings', SETTINGS_KEY);
    return stored?.syncStatus === 'pending';
}

/**
 * Mark settings as synced
 */
export async function markSettingsSynced(): Promise<void> {
    const db = await getDB();
    const stored = await db.get('settings', SETTINGS_KEY);

    if (stored) {
        stored.syncStatus = 'synced';
        await db.put('settings', stored);
    }
}
