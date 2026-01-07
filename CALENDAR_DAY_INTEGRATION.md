# Integrating CalendarDay Component

## Overview

The `CalendarDay` component is now ready to use. Here's how to integrate it into the calendar grid.

## Usage Example

```typescript
import { CalendarDay } from './components/CalendarDay';
import { ProblemOnah } from './lib/chashavshavon/ProblemOnah';
import type { Entry, TaharaEvent } from './types';

// In your calendar rendering logic:
<CalendarDay
  date={jDateForThisDay}
  isToday={jDateForThisDay.Abs === today.Abs}
  isSelected={jDateForThisDay.Abs === selectedDate.Abs}
  isOtherMonth={jDateForThisDay.Month !== currentMonth}

  // Niddah-specific data
  entry={getEntryForDate(jDateForThisDay)}
  daysSinceEntry={getDaysSinceEntry(jDateForThisDay)}
  flaggedOnahs={getFlaggedOnahsForDate(jDateForThisDay)}
  taharaEvents={getTaharaEventsForDate(jDateForThisDay)}

  // Regular calendar data
  userEvents={getUserEventsForDate(jDateForThisDay)}
  isHoliday={jDateForThisDay.isYomTov()}
  isShabbos={jDateForThisDay.getDayOfWeek() === 6}
  holidayName={getHolidayName(jDateForThisDay)}

  // Display settings
  calendarView="jewish"
  lang="en"

  // Event handlers
  onDayClick={() => handleDayClick(jDateForThisDay)}
  onAddEntry={() => handleAddEntry(jDateForThisDay)}
  onAddHefsek={() => handleAddHefsek(jDateForThisDay)}
  onAddShailah={() => handleAddShailah(jDateForThisDay)}
  onAddEvent={() => handleAddEvent(jDateForThisDay)}
  onAddMikvah={() => handleAddMikvah(jDateForThisDay)}
  onRemoveTaharaEvent={(event) => handleRemoveTaharaEvent(event)}
/>
```

## Required Helper Functions

### 1. Get Entry for Date

```typescript
function getEntryForDate(date: jDate): Entry | undefined {
  // Check if an entry started on this date
  const entries = await db.entries.toArray();
  return entries.find(entry => {
    const entryDate = toJDate(entry.date);
    return entryDate.Abs === date.Abs;
  });
}
```

### 2. Get Days Since Entry

```typescript
function getDaysSinceEntry(date: jDate): number | undefined {
  // Find the most recent entry before this date
  const entries = await db.entries.orderBy('date.year').reverse().toArray();

  const previousEntry = entries.find(entry => {
    const entryDate = toJDate(entry.date);
    return entryDate.Abs < date.Abs;
  });

  if (!previousEntry) return undefined;

  const entryDate = toJDate(previousEntry.date);
  const daysSince = date.Abs - entryDate.Abs + 1; // +1 because day of entry is day 1

  return daysSince;
}
```

### 3. Get Flagged Onahs for Date

```typescript
import { FlaggedDatesGenerator } from './lib/chashavshavon/FlaggedDatesGenerator';
import { Settings } from './types';

async function getFlaggedOnahsForDate(date: jDate): Promise<ProblemOnah[]> {
  const entries = await db.entries.toArray();
  const kavuahs = await db.kavuahs.where({ active: true }).toArray();
  const settings = await db.settings.get(1);

  if (!settings) return [];

  const generator = new FlaggedDatesGenerator(entries, kavuahs, settings);

  const flaggedDates = generator.getFlaggedDates();

  // Filter for this specific date
  return ProblemOnah.getProbsForDate(date, flaggedDates) || [];
}
```

### 4. Get Tahara Events for Date

```typescript
function getTaharaEventsForDate(date: jDate): TaharaEvent[] {
  const events = await db.taharaEvents.toArray();
  return events.filter(event => {
    const eventDate = toJDate(event.date);
    return eventDate.Abs === date.Abs;
  });
}
```

### 5. Event Handlers

```typescript
const handleAddEntry = (date: jDate) => {
  // Open entry form modal with pre-filled date
  setEntryFormDate(date);
  setEntryFormOpen(true);
};

const handleAddHefsek = (date: jDate) => {
  // Create hefsek tahara event
  const event: TaharaEvent = {
    id: nanoid(),
    type: 'hefsek',
    date: fromJDate(date),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.taharaEvents.add(event);
};

const handleAddShailah = (date: jDate) => {
  // Create shailah event
  const event: TaharaEvent = {
    id: nanoid(),
    type: 'shailah',
    date: fromJDate(date),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.taharaEvents.add(event);
};

const handleAddMikvah = (date: jDate) => {
  // Create mikvah event
  const event: TaharaEvent = {
    id: nanoid(),
    type: 'mikvah',
    date: fromJDate(date),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.taharaEvents.add(event);
};

const handleRemoveTaharaEvent = async (event: TaharaEvent) => {
  await db.taharaEvents.delete(event.id);
};
```

## Integration into Calendar Grid

Replace the existing day cell rendering in `Calendar.tsx` or `CalendarWrapper.tsx`:

```typescript
// Old way (from luach-web):
<div className="day-cell" onClick={() => setSelectedDate(date)}>
  {/* ... */}
</div>

// New way (with CalendarDay):
<CalendarDay
  date={date}
  isToday={date.Abs === today.Abs}
  isSelected={date.Abs === selectedDate.Abs}
  isOtherMonth={date.Month !== currentMonth}
  entry={getEntryForDate(date)}
  daysSinceEntry={getDaysSinceEntry(date)}
  flaggedOnahs={getFlaggedOnahsForDate(date)}
  taharaEvents={getTaharaEventsForDate(date)}
  userEvents={getUserEventsForDate(date)}
  isHoliday={date.isYomTov()}
  isShabbos={date.getDayOfWeek() === 6}
  holidayName={getHolidayName(date)}
  calendarView={calendarView}
  lang={lang}
  onDayClick={() => setSelectedDate(date)}
  onAddEntry={() => handleAddEntry(date)}
  onAddHefsek={() => handleAddHefsek(date)}
  onAddShailah={() => handleAddShailah(date)}
  onAddEvent={() => handleAddEvent(date)}
  onAddMikvah={() => handleAddMikvah(date)}
  onRemoveTaharaEvent={handleRemoveTaharaEvent}
/>
```

## Performance Optimization

Since we're calculating flagged dates for every day, consider:

1. **Memoization**: Calculate flagged dates once per month and cache
2. **Lazy Loading**: Only calculate for visible days
3. **Web Workers**: Move heavy calculations to background thread

```typescript
const flaggedDatesCache = useMemo(() => {
  const generator = new FlaggedDatesGenerator(entries, kavuahs, settings);
  return generator.getFlaggedDates();
}, [entries, kavuahs, settings]);

// Then in render:
flaggedOnahs={ProblemOnah.getProbsForDate(date, flaggedDatesCache) || []}
```

## Next Steps

1. Create entry form modal
2. Implement data fetching hooks
3. Add state management for entries/events
4. Test calendar day rendering
5. Add animations/transitions
