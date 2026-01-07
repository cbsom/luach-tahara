// Entry Service - CRUD operations for entries
import { getDB, type LuachTaharaDB } from './schema';
import type { JewishDate } from '@/types';
import { nanoid } from 'nanoid';

export interface EntryData {
    id?: string;
    jewishDate: JewishDate;
    onah: Onah;
    haflaga: number;
    ignoreForFlaggedDates: boolean;
    ignoreForKavuah: boolean;
    comments?: string;
}

export type EntryRecord = LuachTaharaDB['entries']['value'];

/**
 * Create a new entry
 */
export async function createEntry(data: EntryData): Promise<EntryRecord> {
    const db = await getDB();
    const now = Date.now();

    const entry: EntryRecord = {
        id: data.id || nanoid(),
        jewishDate: data.jewishDate,
        onah: data.onah,
        haflaga: data.haflaga,
        ignoreForFlaggedDates: data.ignoreForFlaggedDates,
        ignoreForKavuah: data.ignoreForKavuah,
        comments: data.comments,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
    };

    await db.put('entries', entry);
    return entry;
}

/**
 * Get entry by ID
 */
export async function getEntry(id: string): Promise<EntryRecord | undefined> {
    const db = await getDB();
    return db.get('entries', id);
}

/**
 * Get all entries (excluding deleted)
 */
export async function getAllEntries(): Promise<EntryRecord[]> {
    const db = await getDB();
    const entries = await db.getAll('entries');
    return entries.filter(e => !e.deleted);
}

/**
 * Get entries for a specific date
 */
export async function getEntriesByDate(jewishDate: JewishDate): Promise<EntryRecord[]> {
    const db = await getDB();
    const entries = await db.getAllFromIndex(
        'entries',
        'by-date',
        [jewishDate.year, jewishDate.month, jewishDate.day]
    );
    return entries.filter(e => !e.deleted);
}

/**
 * Get entries in date range
 */
export async function getEntriesInRange(
    startDate: JewishDate,
    endDate: JewishDate
): Promise<EntryRecord[]> {
    const allEntries = await getAllEntries();

    return allEntries.filter(entry => {
        const { year, month, day } = entry.jewishDate;
        const entryDate = year * 10000 + month * 100 + day;
        const start = startDate.year * 10000 + startDate.month * 100 + startDate.day;
        const end = endDate.year * 10000 + endDate.month * 100 + endDate.day;

        return entryDate >= start && entryDate <= end;
    });
}

/**
 * Update an entry
 */
export async function updateEntry(
    id: string,
    updates: Partial<EntryData>
): Promise<EntryRecord> {
    const db = await getDB();
    const existing = await db.get('entries', id);

    if (!existing) {
        throw new Error(`Entry ${id} not found`);
    }

    const updated: EntryRecord = {
        ...existing,
        ...updates,
        id: existing.id, // Ensure ID doesn't change
        updatedAt: Date.now(),
        syncStatus: 'pending',
    };

    await db.put('entries', updated);
    return updated;
}

/**
 * Delete an entry (soft delete)
 */
export async function deleteEntry(id: string): Promise<void> {
    const db = await getDB();
    const existing = await db.get('entries', id);

    if (!existing) {
        throw new Error(`Entry ${id} not found`);
    }

    const deleted: EntryRecord = {
        ...existing,
        deleted: true,
        updatedAt: Date.now(),
        syncStatus: 'pending',
    };

    await db.put('entries', deleted);
}

/**
 * Permanently delete an entry
 */
export async function permanentlyDeleteEntry(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('entries', id);
}

/**
 * Get entries pending sync
 */
export async function getPendingEntries(): Promise<EntryRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('entries', 'by-sync-status', 'pending');
}

/**
 * Mark entry as synced
 */
export async function markEntrySynced(id: string): Promise<void> {
    const db = await getDB();
    const entry = await db.get('entries', id);

    if (entry) {
        entry.syncStatus = 'synced';
        await db.put('entries', entry);
    }
}

/**
 * Get entry count
 */
export async function getEntryCount(): Promise<number> {
    const entries = await getAllEntries();
    return entries.length;
}

/**
 * Clear all entries (for testing/reset)
 */
export async function clearAllEntries(): Promise<void> {
    const db = await getDB();
    await db.clear('entries');
}
