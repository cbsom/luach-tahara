# IndexedDB Service

Offline-first data storage using IndexedDB with sync capabilities.

## Features

- ✅ Offline-first architecture
- ✅ CRUD operations for entries, kavuahs, and settings
- ✅ Sync status tracking
- ✅ React hooks for easy integration
- ✅ TypeScript type safety
- ✅ Automatic indexing for fast queries

## Database Schema

### Stores

1. **entries** - Menstrual cycle entries (ראיות)
   - Indexed by: date, sync status, updated time
2. **kavuahs** - Kavuah patterns (וסתות)
   - Indexed by: active status, sync status, updated time
3. **taharaEvents** - Tahara events (הפסק טהרה, בדיקות, מקווה)
   - Indexed by: date, type, sync status, updated time
4. **settings** - User settings
5. **syncMeta** - Synchronization metadata

## Usage

### Basic Operations

```typescript
import { createEntry, getAllEntries, updateEntry, deleteEntry } from '@/services/db';

// Create an entry
const entry = await createEntry({
  jewishDate: { year: 5784, month: 1, day: 15 },
  onah: 'day',
  haflaga: 30,
  ignoreForFlaggedDates: false,
  ignoreForKavuah: false,
});

// Get all entries
const entries = await getAllEntries();

// Update an entry
await updateEntry(entry.id, {
  comments: 'Updated comment',
});

// Delete an entry (soft delete)
await deleteEntry(entry.id);
```

### Using React Hooks

```typescript
import { useEntries, useKavuahs, useSettings } from '@/services/db/hooks';

function MyComponent() {
  const { entries, loading, addEntry, removeEntry } = useEntries();
  const { kavuahs, toggleActive } = useKavuahs(true); // active only
  const { settings, updateSettings } = useSettings();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Entries: {entries.length}</h2>
      <h2>Active Kavuahs: {kavuahs.length}</h2>
    </div>
  );
}
```

### Sync Management

```typescript
import { isSyncNeeded, getAllPendingData, markAllSynced } from '@/services/db';

// Check if sync is needed
const needsSync = await isSyncNeeded();

// Get all pending changes
const { entries, kavuahs, settingsPending } = await getAllPendingData();

// After successful Firebase sync
await markAllSynced(
  entries.map(e => e.id),
  kavuahs.map(k => k.id)
);
```

### Settings

```typescript
import { getSettings, updateSetting } from '@/services/db';

// Get settings
const settings = await getSettings();

// Update a single setting
await updateSetting('keepThirtyOne', true);

// Update multiple settings
await saveSettings({
  keepThirtyOne: true,
  onahBeinunis24Hours: false,
});
```

### Date Queries

```typescript
import { getEntriesByDate, getEntriesInRange } from '@/services/db';

// Get entries for a specific date
const entries = await getEntriesByDate({
  year: 5784,
  month: 1,
  day: 15,
});

// Get entries in a date range
const rangeEntries = await getEntriesInRange(
  { year: 5784, month: 1, day: 1 },
  { year: 5784, month: 1, day: 30 }
);
```

## Sync Status

Each record has a `syncStatus` field:

- `'synced'` - Synchronized with Firebase
- `'pending'` - Waiting to be synced
- `'conflict'` - Sync conflict detected

## Soft Deletes

Records are soft-deleted by default (marked with `deleted: true`). This allows:

- Sync with Firebase before permanent deletion
- Undo functionality
- Audit trail

Use `permanentlyDelete*` functions for hard deletes.

## Database Initialization

The database is automatically initialized on first use. You can also manually initialize:

```typescript
import { initDB } from '@/services/db';

const db = await initDB();
```

## Error Handling

All functions throw errors that should be caught:

```typescript
try {
  await createEntry(data);
} catch (error) {
  console.error('Failed to create entry:', error);
  // Handle error
}
```

## Testing

For testing, you can clear stores:

```typescript
import { clearAllEntries, clearAllKavuahs } from '@/services/db';

await clearAllEntries();
await clearAllKavuahs();
```

## Performance

- Indexed queries are fast (O(log n))
- Bulk operations use transactions
- Lazy initialization (database opens on first use)
- Automatic connection pooling

## Browser Support

IndexedDB is supported in all modern browsers:

- Chrome/Edge 24+
- Firefox 16+
- Safari 10+
- iOS Safari 10+

## Migration

Database schema version is tracked. When incrementing `DB_VERSION`:

1. Add upgrade logic in `schema.ts`
2. Test migration with existing data
3. Document breaking changes

## Best Practices

1. **Always use hooks in React components** for automatic state management
2. **Batch operations** when possible for better performance
3. **Handle offline scenarios** gracefully
4. **Sync regularly** to prevent data loss
5. **Validate data** before saving to IndexedDB
