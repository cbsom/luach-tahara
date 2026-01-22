// React hooks for IndexedDB operations
import { useState, useEffect, useCallback } from 'react';
import {
    getAllEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntriesByDate,
    type EntryRecord,
    type EntryData,
} from './entryService';
import {
    getAllKavuahs,
    getActiveKavuahs,
    createKavuah,
    updateKavuah,
    deleteKavuah,
    toggleKavuahActive,
    type KavuahRecord,
    type KavuahData,
} from './kavuahService';
import {
    getSettings,
    saveSettings,
    updateSetting,
} from './settingsService';
import {
    getSyncMetadata,
    isSyncNeeded,
    type SyncMetadata,
} from './syncService';
import {
    getAllTaharaEvents,
    createTaharaEvent,
    updateTaharaEvent,
    deleteTaharaEvent,
    type TaharaEventRecord,
    type TaharaEventData,
} from './taharaEventService';
import type { JewishDate, Settings } from '@/types';

/**
 * Hook to manage entries
 */
export function useEntries() {
    const [entries, setEntries] = useState<EntryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadEntries = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllEntries();
            setEntries(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    const addEntry = useCallback(async (data: EntryData) => {
        const entry = await createEntry(data);
        setEntries(prev => [...prev, entry]);
        return entry;
    }, []);

    const modifyEntry = useCallback(async (id: string, updates: Partial<EntryData>) => {
        const updated = await updateEntry(id, updates);
        setEntries(prev => prev.map(e => e.id === id ? updated : e));
        return updated;
    }, []);

    const removeEntry = useCallback(async (id: string) => {
        await deleteEntry(id);
        setEntries(prev => prev.filter(e => e.id !== id));
    }, []);

    return {
        entries,
        loading,
        error,
        addEntry,
        modifyEntry,
        removeEntry,
        reload: loadEntries,
    };
}

/**
 * Hook to get entries for a specific date
 */
export function useEntriesForDate(jewishDate: JewishDate) {
    const [entries, setEntries] = useState<EntryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                const data = await getEntriesByDate(jewishDate);
                if (!cancelled) {
                    setEntries(data);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [jewishDate.year, jewishDate.month, jewishDate.day]);

    return { entries, loading };
}

/**
 * Hook to manage tahara events
 */
export function useTaharaEvents() {
    const [taharaEvents, setTaharaEvents] = useState<TaharaEventRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadTaharaEvents = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllTaharaEvents();
            setTaharaEvents(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTaharaEvents();
    }, [loadTaharaEvents]);

    const addTaharaEvent = useCallback(async (data: TaharaEventData) => {
        const event = await createTaharaEvent(data);
        setTaharaEvents(prev => [...prev, event]);
        return event;
    }, []);

    const modifyTaharaEvent = useCallback(async (id: string, updates: Partial<TaharaEventData>) => {
        const updated = await updateTaharaEvent(id, updates);
        setTaharaEvents(prev => prev.map(e => e.id === id ? updated : e));
        return updated;
    }, []);

    const removeTaharaEvent = useCallback(async (id: string) => {
        await deleteTaharaEvent(id);
        setTaharaEvents(prev => prev.filter(e => e.id !== id));
    }, []);

    return {
        taharaEvents,
        loading,
        error,
        addTaharaEvent,
        modifyTaharaEvent,
        removeTaharaEvent,
        reload: loadTaharaEvents,
    };
}

/**
 * Hook to manage kavuahs
 */
export function useKavuahs(activeOnly = false) {
    const [kavuahs, setKavuahs] = useState<KavuahRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadKavuahs = useCallback(async () => {
        try {
            setLoading(true);
            const data = activeOnly ? await getActiveKavuahs() : await getAllKavuahs();
            setKavuahs(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [activeOnly]);

    useEffect(() => {
        loadKavuahs();
    }, [loadKavuahs]);

    const addKavuah = useCallback(async (data: KavuahData) => {
        const kavuah = await createKavuah(data);
        setKavuahs(prev => [...prev, kavuah]);
        return kavuah;
    }, []);

    const modifyKavuah = useCallback(async (id: string, updates: Partial<KavuahData>) => {
        const updated = await updateKavuah(id, updates);
        setKavuahs(prev => prev.map(k => k.id === id ? updated : k));
        return updated;
    }, []);

    const removeKavuah = useCallback(async (id: string) => {
        await deleteKavuah(id);
        setKavuahs(prev => prev.filter(k => k.id !== id));
    }, []);

    const toggleActive = useCallback(async (id: string) => {
        const updated = await toggleKavuahActive(id);
        setKavuahs(prev => prev.map(k => k.id === id ? updated : k));
        return updated;
    }, []);

    return {
        kavuahs,
        loading,
        error,
        addKavuah,
        modifyKavuah,
        removeKavuah,
        toggleActive,
        reload: loadKavuahs,
    };
}

/**
 * Hook to manage settings
 */
export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSettings();
            setSettings(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const updateSettings = useCallback(async (updates: Partial<Settings>) => {
        const updated = await saveSettings(updates);
        setSettings(updated);
        return updated;
    }, []);

    const updateSingleSetting = useCallback(async <K extends keyof Settings>(
        key: K,
        value: Settings[K]
    ) => {
        const updated = await updateSetting(key, value);
        setSettings(updated);
        return updated;
    }, []);

    return {
        settings,
        loading,
        error,
        updateSettings,
        updateSingleSetting,
        reload: loadSettings,
    };
}

/**
 * Hook to monitor sync status
 */
export function useSyncStatus() {
    const [syncMeta, setSyncMeta] = useState<SyncMetadata | null>(null);
    const [needsSync, setNeedsSync] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadSyncStatus = useCallback(async () => {
        try {
            setLoading(true);
            const [meta, needed] = await Promise.all([
                getSyncMetadata(),
                isSyncNeeded(),
            ]);
            setSyncMeta(meta);
            setNeedsSync(needed);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSyncStatus();

        // Poll every 30 seconds
        const interval = setInterval(loadSyncStatus, 30000);

        return () => clearInterval(interval);
    }, [loadSyncStatus]);

    return {
        syncMeta,
        needsSync,
        loading,
        reload: loadSyncStatus,
    };
}
