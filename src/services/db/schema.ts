// IndexedDB Schema and Configuration
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { JewishDate, NightDay, Settings } from '@/types';
import { UserEvent } from '../../types-luach-web';

/**
 * Database version - increment when schema changes
 */
const DB_VERSION = 2;
const DB_NAME = 'luach-tahara-db';

/**
 * Database Schema Definition
 */
export interface LuachTaharaDB extends DBSchema {
    // Entries (ראיות)
    entries: {
        key: string; // entryId
        value: {
            id: string;
            jewishDate: JewishDate;
            onah: NightDay;
            haflaga: number;
            ignoreForFlaggedDates: boolean;
            ignoreForKavuah: boolean;
            comments?: string;
            createdAt: number;
            updatedAt: number;
            syncStatus: 'synced' | 'pending' | 'conflict';
            deleted?: boolean;
        };
        indexes: {
            'by-date': [number, number, number]; // [year, month, day]
            'by-sync-status': string;
            'by-updated': number;
        };
    };

    // Kavuahs (וסתות)
    kavuahs: {
        key: string; // kavuahId
        value: {
            id: string;
            kavuahType: number;
            settingEntryId: string;
            specialNumber: number;
            cancelsOnahBeinunis: boolean;
            active: boolean;
            ignore: boolean;
            createdAt: number;
            updatedAt: number;
            syncStatus: 'synced' | 'pending' | 'conflict';
            deleted?: boolean;
        };
        indexes: {
            'by-active': number; // 1 for active, 0 for inactive
            'by-sync-status': string;
            'by-updated': number;
        };
    };

    // Tahara Events (הפסק טהרה, בדיקות, מקווה)
    taharaEvents: {
        key: string; // eventId
        value: {
            id: string;
            jewishDate: JewishDate;
            type: 'hefsek' | 'bedika' | 'shailah' | 'mikvah';
            createdAt: number;
            updatedAt: number;
            syncStatus: 'synced' | 'pending' | 'conflict';
            deleted?: boolean;
        };
        indexes: {
            'by-date': [number, number, number]; // [year, month, day]
            'by-type': string;
            'by-sync-status': string;
            'by-updated': number;
        };
    };

    // Settings (הגדרות)
    settings: {
        key: string; // 'user-settings'
        value: {
            id: string;
        } & Settings & {
            syncStatus: 'synced' | 'pending' | 'conflict';
        };
    };

    // Sync metadata
    syncMeta: {
        key: string; // metadata key
        value: {
            key: string;
            lastSyncTime: number;
            lastSyncSuccess: boolean;
            pendingChanges: number;
        };
    };

    // User Events
    userEvents: {
        key: string; // eventId
        value: UserEvent;
        indexes: {
            'by-type': number;
        };
    };
}

/**
 * Initialize and open the database
 */
export async function initDB(): Promise<IDBPDatabase<LuachTaharaDB>> {
    return openDB<LuachTaharaDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
            upgradeDB(db, oldVersion, newVersion);
        },
        blocked() {
            console.warn('Database upgrade blocked - please close other tabs');
        },
        blocking() {
            console.warn('This tab is blocking a database upgrade');
        },
    });
}
/**
 * Update logic for database upgrades
 */
async function upgradeDB(db: IDBPDatabase<LuachTaharaDB>, oldVersion: number, newVersion: number | null) {
    console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

    // Create entries store
    if (!db.objectStoreNames.contains('entries')) {
        const entriesStore = db.createObjectStore('entries', { keyPath: 'id' });
        entriesStore.createIndex('by-date', ['jewishDate.year', 'jewishDate.month', 'jewishDate.day']);
        entriesStore.createIndex('by-sync-status', 'syncStatus');
        entriesStore.createIndex('by-updated', 'updatedAt');
    }

    // Create kavuahs store
    if (!db.objectStoreNames.contains('kavuahs')) {
        const kavuahsStore = db.createObjectStore('kavuahs', { keyPath: 'id' });
        kavuahsStore.createIndex('by-active', 'active');
        kavuahsStore.createIndex('by-sync-status', 'syncStatus');
        kavuahsStore.createIndex('by-updated', 'updatedAt');
    }

    // Create tahara events store
    if (!db.objectStoreNames.contains('taharaEvents')) {
        const eventsStore = db.createObjectStore('taharaEvents', { keyPath: 'id' });
        eventsStore.createIndex('by-date', ['jewishDate.year', 'jewishDate.month', 'jewishDate.day']);
        eventsStore.createIndex('by-type', 'type');
        eventsStore.createIndex('by-sync-status', 'syncStatus');
        eventsStore.createIndex('by-updated', 'updatedAt');
    }

    // Create user events store
    if (!db.objectStoreNames.contains('userEvents')) {
        const userEventsStore = db.createObjectStore('userEvents', { keyPath: 'id' });
        userEventsStore.createIndex('by-type', 'type');
        // No sync status for now on user events, or add it if we want consistency
    }

    // Create settings store
    if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
    }

    // Create sync metadata store
    if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'key' });
    }
}

/**
 * Get database instance (singleton pattern)
 */
let dbInstance: IDBPDatabase<LuachTaharaDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<LuachTaharaDB>> {
    if (!dbInstance) {
        dbInstance = await initDB();
    }
    return dbInstance;
}

/**
 * Close database connection
 */
export function closeDB(): void {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
