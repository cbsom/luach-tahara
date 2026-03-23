import { 
    collection, 
    doc, 
    onSnapshot, 
    setDoc, 
    getDocs, 
    query, 
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';
import {
    getAllPendingData,
    markAllSynced,
    getSettings,
    saveSettings,
    markSyncStarted,
    markSyncFailed,
    markEverythingPending,
} from '../db';
import { batchSetDocuments } from './firestore';

// Global unsubscribe functions to prevent multiple listeners
let unsubSettings: (() => void) | null = null;
let unsubEntries: (() => void) | null = null;
let unsubKavuahs: (() => void) | null = null;
let unsubEvents: (() => void) | null = null;
let unsubTaharaEvents: (() => void) | null = null;
let autoSyncInterval: any = null;

/**
 * Start real-time sync listeners
 */
export async function startOnSnapshotSync(userId: string) {
    stopOnSnapshotSync();

    const { getDB } = await import('../db/schema');
    const dbInstance = await getDB();

    // Settings Listener
    const settingsRef = doc(db, 'users', userId, 'settings', 'general');
    unsubSettings = onSnapshot(settingsRef, async (snapshot) => {
        if (snapshot.exists()) {
            const cloudSettings = snapshot.data();
            await saveSettings(cloudSettings as any);
            console.log('☁️ Settings updated from Cloud');
            window.dispatchEvent(new CustomEvent('db-updated-settings'));
        }
    });

    // Entries Listener
    const entriesRef = collection(doc(db, 'users', userId), 'entries');
    unsubEntries = onSnapshot(entriesRef, async (snapshot) => {
        const changes = snapshot.docChanges();
        for (const change of changes) {
            const data = change.doc.data() as any;
            data.id = change.doc.id;
            data.syncStatus = 'synced';

            if (change.type === 'added' || change.type === 'modified') {
                await dbInstance.put('entries', data);
            } else if (change.type === 'removed') {
                await dbInstance.delete('entries', change.doc.id);
            }
        }
        if (changes.length > 0) {
            console.log(`☁️ ${changes.length} Entries updated from Cloud`);
            window.dispatchEvent(new CustomEvent('db-updated-entries'));
        }
    });

    // Kavuahs Listener
    const kavuahsRef = collection(doc(db, 'users', userId), 'kavuahs');
    unsubKavuahs = onSnapshot(kavuahsRef, async (snapshot) => {
        const changes = snapshot.docChanges();
        for (const change of changes) {
            const data = change.doc.data() as any;
            data.id = change.doc.id;
            data.syncStatus = 'synced';

            if (change.type === 'added' || change.type === 'modified') {
                await dbInstance.put('kavuahs', data);
            } else if (change.type === 'removed') {
                await dbInstance.delete('kavuahs', change.doc.id);
            }
        }
        if (changes.length > 0) {
            console.log(`☁️ ${changes.length} Kavuahs updated from Cloud`);
            window.dispatchEvent(new CustomEvent('db-updated-kavuahs'));
        }
    });

    // Events (Occasions) Listener
    const eventsRef = collection(doc(db, 'users', userId), 'events');
    unsubEvents = onSnapshot(eventsRef, async (snapshot) => {
        const changes = snapshot.docChanges();
        for (const change of changes) {
            const data = change.doc.data() as any;
            data.id = change.doc.id;
            data.syncStatus = 'synced';

            if (change.type === 'added' || change.type === 'modified') {
                await dbInstance.put('userEvents', data);
            } else if (change.type === 'removed') {
                await dbInstance.delete('userEvents', change.doc.id);
            }
        }
        if (changes.length > 0) {
            console.log(`☁️ ${changes.length} Events updated from Cloud`);
            window.dispatchEvent(new CustomEvent('db-updated-events'));
        }
    });

    // Tahara Events Listener
    const taharaRef = collection(doc(db, 'users', userId), 'tahara-events');
    unsubTaharaEvents = onSnapshot(taharaRef, async (snapshot) => {
        const changes = snapshot.docChanges();
        for (const change of changes) {
            const data = change.doc.data() as any;
            data.id = change.doc.id;
            data.syncStatus = 'synced';

            if (change.type === 'added' || change.type === 'modified') {
                await dbInstance.put('taharaEvents', data);
            } else if (change.type === 'removed') {
                await dbInstance.delete('taharaEvents', change.doc.id);
            }
        }
        if (changes.length > 0) {
            console.log(`☁️ ${changes.length} Tahara Events updated from Cloud`);
            window.dispatchEvent(new CustomEvent('db-updated-tahara'));
        }
    });
}

/**
 * Stop all real-time sync listeners
 */
export function stopOnSnapshotSync() {
    if (unsubSettings) unsubSettings();
    if (unsubEntries) unsubEntries();
    if (unsubKavuahs) unsubKavuahs();
    if (unsubEvents) unsubEvents();
    if (unsubTaharaEvents) unsubTaharaEvents();
    
    unsubSettings = null;
    unsubEntries = null;
    unsubKavuahs = null;
    unsubEvents = null;
    unsubTaharaEvents = null;
}

/**
 * Sync all pending local changes UP to Firebase
 */
export async function syncToFirebase(): Promise<{ success: boolean; error?: string }> {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        await markSyncStarted();

        // Get all pending data
        const { entries, kavuahs, events, taharaEvents, settingsPending } = await getAllPendingData();

        // Sync entries
        if (entries.length > 0) {
            const entryDocs = entries.map(entry => ({
                id: entry.id,
                data: {
                    jewishDate: entry.jewishDate,
                    onah: entry.onah,
                    comments: entry.comments,
                    haflaga: entry.haflaga,
                    ignoreForFlaggedDates: entry.ignoreForFlaggedDates,
                    ignoreForKavuah: entry.ignoreForKavuah,
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

        // Sync user events (occasions)
        if (events && events.length > 0) {
            const eventDocs = events.map(event => ({
                id: event.id,
                data: {
                    name: event.name || (event as any).title || "Occasion",
                    notes: event.notes,
                    type: event.type,
                    jAbs: event.jAbs,
                    jYear: event.jYear,
                    jMonth: event.jMonth,
                    jDay: event.jDay,
                    sDate: event.sDate,
                    backColor: event.backColor || (event as any).color,
                    textColor: event.textColor,
                    remindDayOf: event.remindDayOf,
                    remindDayBefore: event.remindDayBefore,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    deleted: event.deleted || false,
                },
            }));
            await batchSetDocuments(user.uid, 'events', eventDocs);
        }

        // Sync tahara events
        if (taharaEvents && taharaEvents.length > 0) {
            const taharaDocs = taharaEvents.map(event => ({
                id: event.id,
                data: {
                    jewishDate: event.jewishDate,
                    type: event.type,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt,
                    deleted: event.deleted || false,
                },
            }));
            await batchSetDocuments(user.uid, 'tahara-events', taharaDocs);
        }

        // Sync settings
        if (settingsPending) {
            const settings = await getSettings();
            const settingsRef = doc(db, 'users', user.uid, 'settings', 'general');
            await setDoc(settingsRef, { ...settings, updatedAt: Date.now() }, { merge: true });
        }

        await markAllSynced(
            entries.map(e => e.id),
            kavuahs.map(k => k.id),
            events ? events.map(e => e.id) : [],
            taharaEvents ? taharaEvents.map(t => t.id) : []
        );

        return { success: true };
    } catch (error) {
        console.error('Push sync failed:', error);
        await markSyncFailed();
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Pull all data from Firebase (Full Pull)
 */
export async function pullFromFirebase(): Promise<{ success: boolean; error?: string }> {
    const user = getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };

    try {
        const { getDB } = await import('../db/schema');
        const dbInstance = await getDB();

        // Pull Settings
        const settingsSnap = await getDocs(query(collection(db, 'users', user.uid, 'settings')));
        const cloudSettings = settingsSnap.docs.find(d => d.id === 'general')?.data();
        if (cloudSettings) {
            await saveSettings(cloudSettings as any);
        }

        // Pull Entries
        const entriesSnap = await getDocs(collection(db, 'users', user.uid, 'entries'));
        for (const docSnap of entriesSnap.docs) {
            const data = docSnap.data() as any;
            data.id = docSnap.id;
            data.syncStatus = 'synced';
            await dbInstance.put('entries', data);
        }

        // Pull Kavuahs
        const kavuahsSnap = await getDocs(collection(db, 'users', user.uid, 'kavuahs'));
        for (const docSnap of kavuahsSnap.docs) {
            const data = docSnap.data() as any;
            data.id = docSnap.id;
            data.syncStatus = 'synced';
            await dbInstance.put('kavuahs', data);
        }

        // Pull Events
        const eventsSnap = await getDocs(collection(db, 'users', user.uid, 'events'));
        for (const docSnap of eventsSnap.docs) {
            const data = docSnap.data() as any;
            data.id = docSnap.id;
            data.syncStatus = 'synced';
            await dbInstance.put('userEvents', data);
        }

        // Pull Tahara Events
        const taharaSnap = await getDocs(collection(db, 'users', user.uid, 'tahara-events'));
        for (const docSnap of taharaSnap.docs) {
            const data = docSnap.data() as any;
            data.id = docSnap.id;
            data.syncStatus = 'synced';
            await dbInstance.put('taharaEvents', data);
        }

        // Notify UI that EVERYTHING has been updated
        window.dispatchEvent(new CustomEvent('db-updated-settings'));
        window.dispatchEvent(new CustomEvent('db-updated-entries'));
        window.dispatchEvent(new CustomEvent('db-updated-kavuahs'));
        window.dispatchEvent(new CustomEvent('db-updated-events'));
        window.dispatchEvent(new CustomEvent('db-updated-tahara'));

        return { success: true };
    } catch (error) {
        console.error('Pull sync failed:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Perform a full two-way sync
 */
export async function fullSync(): Promise<{ success: boolean; error?: string }> {
    const pushResult = await syncToFirebase();
    if (!pushResult.success) return pushResult;
    return await pullFromFirebase();
}

/**
 * Start periodic auto-sync
 */
export function startAutoSync(intervalMs = 30000) {
    stopAutoSync();
    autoSyncInterval = setInterval(async () => {
        const user = getCurrentUser();
        if (user) {
            await syncToFirebase();
        }
    }, intervalMs);
}

/**
 * Stop periodic auto-sync
 */
export function stopAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
}

/**
 * Force mark everything as pending
 */
export async function forceMarkEverythingPending(): Promise<void> {
    await markEverythingPending();
}
