// IndexedDB Service - Main exports
export * from './schema';
export * from './entryService';
export * from './kavuahService';
export * from './settingsService';
export * from './syncService';

// Re-export commonly used functions
export { getDB, closeDB, initDB } from './schema';
export {
    createEntry,
    getEntry,
    getAllEntries,
    updateEntry,
    deleteEntry,
    getEntriesByDate,
    getEntriesInRange,
} from './entryService';
export {
    createKavuah,
    getKavuah,
    getAllKavuahs,
    getActiveKavuahs,
    updateKavuah,
    deleteKavuah,
    toggleKavuahActive,
} from './kavuahService';
export {
    getSettings,
    saveSettings,
    updateSetting,
    resetSettings,
    DEFAULT_SETTINGS,
} from './settingsService';
export {
    getSyncMetadata,
    isSyncNeeded,
    getPendingChangesCount,
    markSyncSuccess,
    markSyncFailed,
} from './syncService';
