// Firebase Sync Service - Syncs IndexedDB with Firebase
import { getCurrentUser } from './auth';
import { getUserDocuments, setDocument, batchSetDocuments } from './firestore';
import {
    getAllPendingData,
    markAllSynced,
    markSyncStarted,
    markSyncSuccess,
    markSyncFailed,
    type EntryRecord,
    type KavuahRecord,
} from '../db';
import { getSettings, saveSettings } from '../db/settingsService';

/**
 * Sync all pending changes to Firebase
 */
export async function syncToFirebase(): Promise<{
    success: boolean;
    error?: string;
}> {
    const user = getCurrentUser();

    if (!user) {
        return {
            success: false,
            error: 'User not authenticated',
        };
    }

    try {
        await markSyncStarted();

        // Get all pending data
        const { entries, kavuahs, settingsPending } = await getAllPendingData();

        // Sync entries
        if (entries.length > 0) {
            const entryDocs = entries.map(entry => ({
                id: entry.id,
                data: {
                    jewishDate: entry.jewishDate,
                    onah: entry.onah,
                    haflaga: entry.haflaga,
                    ignoreForFlaggedDates: entry.ignoreForFlaggedDates,
                    ignoreForKavuah: entry.ignoreForKavuah,
                    comments: entry.comments,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                    deleted: entry.deleted || false,
                },
            }));

            await batchSetDocuments(user.uid, 'entries', entryDocs);
        }

        // Sync kavuahs
        if (kavuahs.length > 0) {
            const kavuahDocs = kavuahs.map(kavuah => ({
                id: kavuah.id,
                data: {
                    kavuahType: kavuah.kavuahType,
                    settingEntryId: kavuah.settingEntryId,
                    specialNumber: kavuah.specialNumber,
                    cancelsOnahBeinunis: kavuah.cancelsOnahBeinunis,
                    active: kavuah.active,
                    ignore: kavuah.ignore,
                    createdAt: kavuah.createdAt,
                    updatedAt: kavuah.updatedAt,
                    deleted: kavuah.deleted || false,
                },
            }));

            await batchSetDocuments(user.uid, 'kavuahs', kavuahDocs);
        }

        // Sync settings
        if (settingsPending) {
            const settings = await getSettings();
            await setDocument(user.uid, 'settings', 'user-settings', settings);
        }

        // Mark all as synced
        await markAllSynced(
            entries.map(e => e.id),
            kavuahs.map(k => k.id)
        );

        return { success: true };
    } catch (error) {
        console.error('Sync to Firebase failed:', error);
        await markSyncFailed();
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Pull data from Firebase to IndexedDB
 * This is typically done on first login or when restoring data
 */
export async function pullFromFirebase(): Promise<{
    success: boolean;
    error?: string;
}> {
    const user = getCurrentUser();

    if (!user) {
        return {
            success: false,
            error: 'User not authenticated',
        };
    }

    try {
        // Import IndexedDB services
        const { createEntry, updateEntry } = await import('../db/entryService');
        const { createKavuah, updateKavuah } = await import('../db/kavuahService');

        // Pull entries
        const entries = await getUserDocuments<EntryRecord>(user.uid, 'entries');
        for (const entry of entries) {
            try {
                await createEntry({
                    id: entry.id,
                    jewishDate: entry.jewishDate,
                    onah: entry.onah,
                    haflaga: entry.haflaga,
                    ignoreForFlaggedDates: entry.ignoreForFlaggedDates,
                    ignoreForKavuah: entry.ignoreForKavuah,
                    comments: entry.comments,
                });
            } catch {
                // Entry might already exist, try updating
                await updateEntry(entry.id, {
                    jewishDate: entry.jewishDate,
                    onah: entry.onah,
                    haflaga: entry.haflaga,
                    ignoreForFlaggedDates: entry.ignoreForFlaggedDates,
                    ignoreForKavuah: entry.ignoreForKavuah,
                    comments: entry.comments,
                });
            }
        }

        // Pull kavuahs
        const kavuahs = await getUserDocuments<KavuahRecord>(user.uid, 'kavuahs');
        for (const kavuah of kavuahs) {
            try {
                await createKavuah({
                    id: kavuah.id,
                    kavuahType: kavuah.kavuahType,
                    settingEntryId: kavuah.settingEntryId,
                    specialNumber: kavuah.specialNumber,
                    cancelsOnahBeinunis: kavuah.cancelsOnahBeinunis,
                    active: kavuah.active,
                    ignore: kavuah.ignore,
                });
            } catch {
                // Kavuah might already exist, try updating
                await updateKavuah(kavuah.id, {
                    kavuahType: kavuah.kavuahType,
                    settingEntryId: kavuah.settingEntryId,
                    specialNumber: kavuah.specialNumber,
                    cancelsOnahBeinunis: kavuah.cancelsOnahBeinunis,
                    active: kavuah.active,
                    ignore: kavuah.ignore,
                });
            }
        }

        // Pull settings
        const settings = await getUserDocuments(user.uid, 'settings');
        if (settings.length > 0) {
            await saveSettings(settings[0] as any); // Type assertion needed for Firebase data
        }

        await markSyncSuccess();

        return { success: true };
    } catch (error) {
        console.error('Pull from Firebase failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Full sync - pull from Firebase then push any local changes
 */
export async function fullSync(): Promise<{
    success: boolean;
    error?: string;
}> {
    // First pull from Firebase
    const pullResult = await pullFromFirebase();
    if (!pullResult.success) {
        return pullResult;
    }

    // Then push any pending changes
    return syncToFirebase();
}

/**
 * Auto-sync - runs periodically
 */
let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoSync(intervalMs: number = 5 * 60 * 1000): void {
    if (syncInterval) {
        clearInterval(syncInterval);
    }

    syncInterval = setInterval(async () => {
        if (getCurrentUser()) {
            await syncToFirebase();
        }
    }, intervalMs);
}

export function stopAutoSync(): void {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}
