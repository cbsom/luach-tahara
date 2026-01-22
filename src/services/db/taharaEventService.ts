
import { getDB } from './schema';
import { nanoid } from 'nanoid';
import type { JewishDate } from '@/types';
import type { TaharaEvent } from '@/types'; // Assuming this type is exported from types/index.ts. If not, I'll need to check. It IS in schema.ts as property value but imported from types.

export type TaharaEventRecord = {
    id: string;
    jewishDate: JewishDate;
    type: 'hefsek' | 'bedika' | 'shailah' | 'mikvah';
    createdAt: number;
    updatedAt: number;
    syncStatus: 'synced' | 'pending' | 'conflict';
    deleted?: boolean;
};

export type TaharaEventData = Omit<TaharaEventRecord, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'> & { id?: string };

/**
 * Get all tahara events
 */
export async function getAllTaharaEvents(): Promise<TaharaEventRecord[]> {
    const db = await getDB();
    const events = await db.getAll('taharaEvents');
    return events.filter(e => !e.deleted);
}

/**
 * Get tahara events for a specific date
 */
export async function getTaharaEventsByDate(date: JewishDate): Promise<TaharaEventRecord[]> {
    const db = await getDB();
    const events = await db.getAllFromIndex('taharaEvents', 'by-date', [date.year, date.month, date.day]);
    return events.filter(e => !e.deleted);
}

/**
 * Create a new tahara event
 */
export async function createTaharaEvent(data: TaharaEventData): Promise<TaharaEventRecord> {
    const db = await getDB();

    const record: TaharaEventRecord = {
        id: data.id || nanoid(),
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await db.put('taharaEvents', record);
    return record;
}

/**
 * Update a tahara event
 */
export async function updateTaharaEvent(id: string, updates: Partial<TaharaEventData>): Promise<TaharaEventRecord> {
    const db = await getDB();
    const existing = await db.get('taharaEvents', id);

    if (!existing) {
        throw new Error(`Tahara event with ID ${id} not found`);
    }

    const updated: TaharaEventRecord = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await db.put('taharaEvents', updated);
    return updated;
}

/**
 * Delete a tahara event (soft delete)
 */
export async function deleteTaharaEvent(id: string): Promise<void> {
    const db = await getDB();
    const existing = await db.get('taharaEvents', id);

    if (!existing) return;

    const deleted: TaharaEventRecord = {
        ...existing,
        deleted: true,
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await db.put('taharaEvents', deleted);
}
