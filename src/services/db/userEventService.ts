
import { getDB } from './schema';
import { nanoid } from 'nanoid';
import { UserEvent } from '../../types-luach-web';

/**
 * Get all user events
 */
export async function getAllUserEvents(): Promise<UserEvent[]> {
    const db = await getDB();
    const events = await db.getAll('userEvents');
    return events.filter(e => !e.deleted);
}

/**
 * Create a new user event
 */
export async function createUserEvent(data: UserEvent): Promise<UserEvent> {
    const db = await getDB();

    const record: UserEvent = {
        ...data,
        id: data.id || nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await db.put('userEvents', record);
    return record;
}

/**
 * Update a user event
 */
export async function updateUserEvent(id: string, updates: Partial<UserEvent>): Promise<UserEvent> {
    const db = await getDB();
    const existing = await db.get('userEvents', id);

    if (!existing) {
        throw new Error(`User event with ID ${id} not found`);
    }

    const updated: UserEvent = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await db.put('userEvents', updated);
    return updated;
}

/**
 * Delete a user event (soft delete)
 */
export async function deleteUserEvent(id: string): Promise<void> {
    const db = await getDB();
    const existing = await db.get('userEvents', id);

    if (!existing) return;

    const deleted: UserEvent = {
        ...existing,
        deleted: true,
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await db.put('userEvents', deleted);
}

/**
 * Save multiple user events (used for import/migration)
 */
export async function saveUserEvents(events: UserEvent[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('userEvents', 'readwrite');
    const store = tx.objectStore('userEvents');

    for (const event of events) {
        await store.put({
            ...event,
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });
    }

    await tx.done;
}
