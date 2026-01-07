// Kavuah Service - CRUD operations for kavuahs
import { getDB, type LuachTaharaDB } from './schema';
import { nanoid } from 'nanoid';

export interface KavuahData {
    id?: string;
    kavuahType: number;
    settingEntryId: string;
    specialNumber: number;
    cancelsOnahBeinunis: boolean;
    active: boolean;
    ignore: boolean;
}

export type KavuahRecord = LuachTaharaDB['kavuahs']['value'];

/**
 * Create a new kavuah
 */
export async function createKavuah(data: KavuahData): Promise<KavuahRecord> {
    const db = await getDB();
    const now = Date.now();

    const kavuah: KavuahRecord = {
        id: data.id || nanoid(),
        kavuahType: data.kavuahType,
        settingEntryId: data.settingEntryId,
        specialNumber: data.specialNumber,
        cancelsOnahBeinunis: data.cancelsOnahBeinunis,
        active: data.active,
        ignore: data.ignore,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
    };

    await db.put('kavuahs', kavuah);
    return kavuah;
}

/**
 * Get kavuah by ID
 */
export async function getKavuah(id: string): Promise<KavuahRecord | undefined> {
    const db = await getDB();
    return db.get('kavuahs', id);
}

/**
 * Get all kavuahs (excluding deleted)
 */
export async function getAllKavuahs(): Promise<KavuahRecord[]> {
    const db = await getDB();
    const kavuahs = await db.getAll('kavuahs');
    return kavuahs.filter(k => !k.deleted);
}

/**
 * Get active kavuahs only
 */
export async function getActiveKavuahs(): Promise<KavuahRecord[]> {
    const db = await getDB();
    const kavuahs = await db.getAllFromIndex('kavuahs', 'by-active', 1);
    return kavuahs.filter(k => !k.deleted);
}

/**
 * Update a kavuah
 */
export async function updateKavuah(
    id: string,
    updates: Partial<KavuahData>
): Promise<KavuahRecord> {
    const db = await getDB();
    const existing = await db.get('kavuahs', id);

    if (!existing) {
        throw new Error(`Kavuah ${id} not found`);
    }

    const updated: KavuahRecord = {
        ...existing,
        ...updates,
        id: existing.id, // Ensure ID doesn't change
        updatedAt: Date.now(),
        syncStatus: 'pending',
    };

    await db.put('kavuahs', updated);
    return updated;
}

/**
 * Toggle kavuah active status
 */
export async function toggleKavuahActive(id: string): Promise<KavuahRecord> {
    const db = await getDB();
    const kavuah = await db.get('kavuahs', id);

    if (!kavuah) {
        throw new Error(`Kavuah ${id} not found`);
    }

    return updateKavuah(id, { active: !kavuah.active });
}

/**
 * Delete a kavuah (soft delete)
 */
export async function deleteKavuah(id: string): Promise<void> {
    const db = await getDB();
    const existing = await db.get('kavuahs', id);

    if (!existing) {
        throw new Error(`Kavuah ${id} not found`);
    }

    const deleted: KavuahRecord = {
        ...existing,
        deleted: true,
        updatedAt: Date.now(),
        syncStatus: 'pending',
    };

    await db.put('kavuahs', deleted);
}

/**
 * Permanently delete a kavuah
 */
export async function permanentlyDeleteKavuah(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('kavuahs', id);
}

/**
 * Get kavuahs pending sync
 */
export async function getPendingKavuahs(): Promise<KavuahRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('kavuahs', 'by-sync-status', 'pending');
}

/**
 * Mark kavuah as synced
 */
export async function markKavuahSynced(id: string): Promise<void> {
    const db = await getDB();
    const kavuah = await db.get('kavuahs', id);

    if (kavuah) {
        kavuah.syncStatus = 'synced';
        await db.put('kavuahs', kavuah);
    }
}

/**
 * Clear all kavuahs (for testing/reset)
 */
export async function clearAllKavuahs(): Promise<void> {
    const db = await getDB();
    await db.clear('kavuahs');
}
