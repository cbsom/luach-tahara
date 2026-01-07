// Sync Service - Manage synchronization with Firebase
import { getDB } from './schema';
import { getPendingEntries, markEntrySynced } from './entryService';
import { getPendingKavuahs, markKavuahSynced } from './kavuahService';
import { areSettingsPendingSync, markSettingsSynced } from './settingsService';

const SYNC_META_KEY = 'sync-metadata';

export interface SyncMetadata {
    lastSyncTime: number;
    lastSyncSuccess: boolean;
    pendingChanges: number;
}

/**
 * Get sync metadata
 */
export async function getSyncMetadata(): Promise<SyncMetadata> {
    const db = await getDB();
    const meta = await db.get('syncMeta', SYNC_META_KEY);

    if (!meta) {
        const defaultMeta: SyncMetadata = {
            lastSyncTime: 0,
            lastSyncSuccess: false,
            pendingChanges: 0,
        };
        await db.put('syncMeta', { key: SYNC_META_KEY, ...defaultMeta });
        return defaultMeta;
    }

    return {
        lastSyncTime: meta.lastSyncTime,
        lastSyncSuccess: meta.lastSyncSuccess,
        pendingChanges: meta.pendingChanges,
    };
}

/**
 * Update sync metadata
 */
export async function updateSyncMetadata(updates: Partial<SyncMetadata>): Promise<void> {
    const db = await getDB();
    const current = await getSyncMetadata();

    const updated = {
        ...current,
        ...updates,
    };

    await db.put('syncMeta', {
        key: SYNC_META_KEY,
        lastSyncTime: updated.lastSyncTime,
        lastSyncSuccess: updated.lastSyncSuccess,
        pendingChanges: updated.pendingChanges,
    });
}

/**
 * Get count of pending changes
 */
export async function getPendingChangesCount(): Promise<number> {
    const [pendingEntries, pendingKavuahs, settingsPending] = await Promise.all([
        getPendingEntries(),
        getPendingKavuahs(),
        areSettingsPendingSync(),
    ]);

    return pendingEntries.length + pendingKavuahs.length + (settingsPending ? 1 : 0);
}

/**
 * Check if sync is needed
 */
export async function isSyncNeeded(): Promise<boolean> {
    const count = await getPendingChangesCount();
    return count > 0;
}

/**
 * Mark sync as started
 */
export async function markSyncStarted(): Promise<void> {
    await updateSyncMetadata({
        lastSyncTime: Date.now(),
    });
}

/**
 * Mark sync as completed successfully
 */
export async function markSyncSuccess(): Promise<void> {
    await updateSyncMetadata({
        lastSyncSuccess: true,
        pendingChanges: 0,
    });
}

/**
 * Mark sync as failed
 */
export async function markSyncFailed(): Promise<void> {
    const pendingCount = await getPendingChangesCount();
    await updateSyncMetadata({
        lastSyncSuccess: false,
        pendingChanges: pendingCount,
    });
}

/**
 * Get all pending data for sync
 */
export async function getAllPendingData() {
    const [entries, kavuahs, settingsPending] = await Promise.all([
        getPendingEntries(),
        getPendingKavuahs(),
        areSettingsPendingSync(),
    ]);

    return {
        entries,
        kavuahs,
        settingsPending,
    };
}

/**
 * Mark all data as synced
 * Call this after successful Firebase sync
 */
export async function markAllSynced(
    entryIds: string[],
    kavuahIds: string[]
): Promise<void> {
    // Mark entries as synced
    await Promise.all(entryIds.map(id => markEntrySynced(id)));

    // Mark kavuahs as synced
    await Promise.all(kavuahIds.map(id => markKavuahSynced(id)));

    // Mark settings as synced
    await markSettingsSynced();

    // Update sync metadata
    await markSyncSuccess();
}

/**
 * Get time since last sync in milliseconds
 */
export async function getTimeSinceLastSync(): Promise<number> {
    const meta = await getSyncMetadata();
    if (meta.lastSyncTime === 0) {
        return Infinity;
    }
    return Date.now() - meta.lastSyncTime;
}

/**
 * Check if sync is overdue (more than 1 hour)
 */
export async function isSyncOverdue(): Promise<boolean> {
    const timeSince = await getTimeSinceLastSync();
    const ONE_HOUR = 60 * 60 * 1000;
    return timeSince > ONE_HOUR;
}
