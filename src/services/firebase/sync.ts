// Firebase Sync Service - Syncs IndexedDB with Firebase
import { getCurrentUser } from './auth';
import { db as firestore } from './config';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { setDocument, batchSetDocuments } from './firestore';
import {
    getAllPendingData,
    markAllSynced,
    markSyncStarted,
    markSyncSuccess,
    markSyncFailed,
    type EntryRecord,
    type KavuahRecord,
} from '../db';
import {
    createEntry,
    updateEntry,
} from '../db/entryService';
import {
    createKavuah,
    updateKavuah,
} from '../db/kavuahService';
import { getSettings, saveSettings } from '../db/settingsService';
import { createUserEvent, updateUserEvent } from '../db/userEventService';
import type { UserEvent } from '@/types-luach-web';

// Store unsubscribers so we can clean up
let unsubEntries: (() => void) | null = null;
let unsubKavuahs: (() => void) | null = null;
let unsubEvents: (() => void) | null = null;
let unsubSettings: (() => void) | null = null;
let activeSyncInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize robust real-time synchronization with Firestore
 */
export function startOnSnapshotSync(userId: string) {
    if (unsubSettings) return; // Already started

    // 1. Listen for Settings
    const settingsRef = collection(firestore, 'users', userId, 'settings');
    unsubSettings = onSnapshot(query(settingsRef), async (snapshot) => {
        const docSettings = snapshot.docs.find(d => d.id === 'user-settings');
        if (docSettings) {
             const data = docSettings.data();
             await saveSettings(data as Parameters<typeof saveSettings>[0]);
             console.log('☁️ Settings updated from Cloud');
        }
    });

    // 2. Listen for Entries
    const entriesRef = collection(firestore, 'users', userId, 'entries');
    unsubEntries = onSnapshot(query(entriesRef), async (snapshot) => {
        const changes = snapshot.docChanges();
        for (const change of changes) {
            const data = change.doc.data() as EntryRecord;
            const entryData = {
                id: change.doc.id,
                jewishDate: data.jewishDate,
                onah: data.onah,
                haflaga: data.haflaga,
                ignoreForFlaggedDates: data.ignoreForFlaggedDates,
                ignoreForKavuah: data.ignoreForKavuah,
                comments: data.comments,
            };
            if (change.type === 'added' || change.type === 'modified') {
                try {
                    await createEntry(entryData);
                } catch {
                    await updateEntry(entryData.id, entryData);
                }
            }
        }
        if (changes.length > 0) console.log(`☁️ ${changes.length} Entries updated from Cloud`);
    });

    // 3. Listen for Kavuahs
    const kavuahsRef = collection(firestore, 'users', userId, 'kavuahs');
    unsubKavuahs = onSnapshot(query(kavuahsRef), async (snapshot) => {
        const changes = snapshot.docChanges();
        for (const change of changes) {
            const data = change.doc.data() as KavuahRecord;
            const kavuahData = {
                id: change.doc.id,
                kavuahType: data.kavuahType,
                settingEntryId: data.settingEntryId,
                specialNumber: data.specialNumber,
                cancelsOnahBeinunis: data.cancelsOnahBeinunis,
                active: data.active,
                ignore: data.ignore,
            };
            if (change.type === 'added' || change.type === 'modified') {
                try {
                    await createKavuah(kavuahData);
                } catch {
                    await updateKavuah(kavuahData.id, kavuahData);
                }
            }
        }
        if (changes.length > 0) console.log(`☁️ ${changes.length} Kavuahs updated from Cloud`);
    });

    // 4. Listen for User Events (Occasions)
    const eventsRef = collection(firestore, 'users', userId, 'events');
    unsubEvents = onSnapshot(query(eventsRef), async (snapshot) => {
        const changes = snapshot.docChanges();
        for (const change of changes) {
            const data = change.doc.data() as UserEvent;
            const eventData = { ...data, id: change.doc.id };
            if (change.type === 'added' || change.type === 'modified') {
                try {
                    await createUserEvent(eventData);
                } catch {
                    await updateUserEvent(eventData.id, eventData);
                }
            }
        }
        if (changes.length > 0) console.log(`☁️ ${changes.length} Events updated from Cloud`);
    });
}

function stopOnSnapshotSync() {
    if (unsubSettings) unsubSettings();
    if (unsubEntries) unsubEntries();
    if (unsubKavuahs) unsubKavuahs();
    if (unsubEvents) unsubEvents();
    unsubSettings = null;
    unsubEntries = null;
    unsubKavuahs = null;
    unsubEvents = null;
}

/**
 * Sync all pending local changes UP to Firebase
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
        const { entries, kavuahs, events, settingsPending } = await getAllPendingData();

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

        // Sync user events
        if (events && events.length > 0) {
            const eventDocs = events.map(event => ({
                id: event.id,
                data: {
                    name: event.name || (event as unknown as { title: string }).title || "Occasion", // Fallback for safety
                    notes: event.notes || "",
                    type: event.type !== undefined ? event.type : 1,
                    jYear: event.jYear || (event as unknown as { date: { year: number } }).date?.year,
                    jMonth: event.jMonth || (event as unknown as { date: { month: number } }).date?.month,
                    jDay: event.jDay || (event as unknown as { date: { day: number } }).date?.day,
                    jAbs: event.jAbs,
                    sDate: event.sDate,
                    backColor: event.backColor || (event as unknown as { color: string }).color,
                    textColor: event.textColor || "#ffffff",
                    remindDayOf: event.remindDayOf || false,
                    remindDayBefore: event.remindDayBefore || false,
                    createdAt: event.createdAt || Date.now(),
                    updatedAt: event.updatedAt || Date.now(),
                    deleted: event.deleted || false,
                },
            }));
            await batchSetDocuments(user.uid, 'events', eventDocs);
        }

        // Sync settings
        if (settingsPending) {
            const settings = await getSettings();
            await setDocument(user.uid, 'settings', 'user-settings', settings);
        }

        // Mark all as synced so they aren't pushed repeatedly
        await markAllSynced(
            entries.map(e => e.id),
            kavuahs.map(k => k.id),
            events ? events.map(e => e.id) : []
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
 */
export async function pullFromFirebase(): Promise<{
    success: boolean;
    error?: string;
}> {
    const user = getCurrentUser();

    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    try {
        if (!unsubSettings) {
             startOnSnapshotSync(user.uid);
        }
        await markSyncSuccess();
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Full sync - pull from Firebase then push any local changes
 */
export async function fullSync(): Promise<{
    success: boolean;
    error?: string;
}> {
    // With onSnapshot, "pulling" is automatic. We just need to push pending.
    return syncToFirebase();
}

/**
 * Auto-sync - runs periodically for pushing ONLY. Pulling is real-time via onSnapshot.
 */
export function startAutoSync(intervalMs: number = 30 * 1000): void {
    const user = getCurrentUser();
    
    // Safety check - we shouldn't setup snapshots if unauthenticated
    if (user && !unsubSettings) {
        startOnSnapshotSync(user.uid);
    }

    if (activeSyncInterval) {
        clearInterval(activeSyncInterval);
    }

    // Set a much faster push loop since local changes should be saved immediately
    activeSyncInterval = setInterval(async () => {
        if (getCurrentUser()) {
            await syncToFirebase();
        }
    }, intervalMs);
}

export function stopAutoSync(): void {
    if (activeSyncInterval) {
        clearInterval(activeSyncInterval);
        activeSyncInterval = null;
    }
    stopOnSnapshotSync();
}
