// Simplified Calendar wrapper for luach-tahara
import { useState, useMemo, useEffect } from 'react';
import { jDate } from 'jcal-zmanim';
import { fromJDate } from '../lib/jcal';
import { Calendar as LuachWebCalendar } from './Calendar';
import { Themes, type UserEvent } from '../types-luach-web';
import type { Location } from 'jcal-zmanim';
import { EntryForm } from './EntryForm';
import { useEntries, useKavuahs, useSettings } from '../services/db/hooks';
import type { Entry as EntryData } from '../types';
import Entry from '../lib/chashavshavon/Entry';
import FlaggedDatesGenerator from '../lib/chashavshavon/FlaggedDatesGenerator';
import Kavuah, { type KavuahSuggestion } from '../lib/chashavshavon/Kavuah';
import { ProblemOnah } from '../lib/chashavshavon/ProblemOnah';
import { KavuahSuggestionDialog } from './KavuahSuggestionDialog';
import { SettingsPanel } from './settings/SettingsPanel';
import { EntryList } from './entries/EntryList';
import { KavuahList } from './kavuah/KavuahList';
import TaharaEventGenerator from '../lib/chashavshavon/TaharaEventGenerator';

import { toJDate } from '../lib/jcal';

interface CalendarWrapperProps {
  currentJDate: jDate;
  selectedJDate: jDate;
  calendarView: 'jewish' | 'secular';
  onCalendarViewChange: (view: 'jewish' | 'secular') => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onDayClick: (date: jDate) => void;
  location: Location;
  lang: string;
  events?: UserEvent[];
  getEventsForDate?: (date: jDate) => UserEvent[];
  isSettingsOpen?: boolean;
  onCloseSettings?: () => void;
  isEntryListOpen?: boolean;
  onCloseEntryList?: () => void;
  isKavuahListOpen?: boolean;
  onCloseKavuahList?: () => void;
}

export function Calendar({
  currentJDate,
  selectedJDate,
  calendarView,
  onDayClick,
  location,
  lang,
  getEventsForDate,
  isSettingsOpen = false,
  onCloseSettings = () => {},
  isEntryListOpen = false,
  onCloseEntryList = () => {},
  isKavuahListOpen = false,
  onCloseKavuahList = () => {},
}: CalendarWrapperProps) {
  const today = new jDate();

  // DB Hooks
  const { entries: entryRecords, addEntry, modifyEntry, removeEntry } = useEntries();
  const { kavuahs: kavuahRecords, addKavuah } = useKavuahs(true);
  const { settings } = useSettings();

  // 1. Logic Objects: Transform EntryRecord to Entry Class Instances
  const entryInstances = useMemo(
    () =>
      entryRecords.map(r => {
        // Sanitize onah
        let onahVal = (r as any).onah;
        if (typeof onahVal === 'object' && onahVal !== null && 'nightDay' in onahVal) {
          onahVal = onahVal.nightDay;
        }

        // NightDay Enum: Night = -1, Day = 1.
        // If we see 0, assume it meant Night.
        if (onahVal === 0) onahVal = -1;

        if (onahVal !== -1 && onahVal !== 1) {
          console.warn('Invalid onah value in entryRecords, defaulting to Night(-1)', {
            id: r.id,
            onah: onahVal,
          });
          onahVal = -1;
        }

        return Entry.fromJewishDate(
          r.jewishDate,
          onahVal,
          r.id,
          r.ignoreForFlaggedDates,
          r.ignoreForKavuah,
          r.comments,
          r.haflaga
        );
      }),
    [entryRecords]
  );

  // 2. View Objects: Transform EntryRecord to Entry interface for Calendar UI
  const entriesForView: EntryData[] = useMemo(
    () =>
      entryRecords.map(r => ({
        id: r.id,
        date: r.jewishDate,
        onah: r.onah,
        haflaga: r.haflaga,
        ignoreForFlaggedDates: r.ignoreForFlaggedDates,
        ignoreForKavuah: r.ignoreForKavuah,
        notes: r.comments,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    [entryRecords]
  );

  // 3. Logic Objects: Transform KavuahRecord to Kavuah Class Instances
  const kavuahs: Kavuah[] = useMemo(() => {
    return kavuahRecords
      .map(r => {
        const settingEntry = entryInstances.find(e => e.id === r.settingEntryId);
        if (!settingEntry) return null;
        return new Kavuah(
          r.kavuahType,
          settingEntry,
          r.specialNumber,
          r.cancelsOnahBeinunis,
          r.active,
          r.ignore,
          r.id
        );
      })
      .filter(k => k !== null) as Kavuah[];
  }, [kavuahRecords, entryInstances]);

  // Calculate Flagged Dates using Logic Objects
  const flaggedOnahs: ProblemOnah[] = useMemo(() => {
    if (!settings) return [];
    try {
      const generator = new FlaggedDatesGenerator(entryInstances, kavuahs, settings);
      return generator.getProblemOnahs();
    } catch (e) {
      console.error('Error calculating flagged dates:', e);
      return [];
    }
  }, [entryInstances, kavuahs, settings]);

  // Kavuah Suggestions using Logic Objects
  const kavuahSuggestions = useMemo(() => {
    if (entryInstances.length > 0 && kavuahs && settings) {
      try {
        return Kavuah.getPossibleNewKavuahs(entryInstances, kavuahs, settings);
      } catch (e) {
        console.error('Error detecting kavuahs:', e);
        return [];
      }
    }
    return [];
  }, [entryInstances, kavuahs, settings]);

  // Calculate Tahara Events
  const taharaEvents = useMemo(() => {
    if (!settings || entryInstances.length === 0) return [];
    try {
      // Use robust entryInstances directly (they are already Entry Class Instances)
      const entryClasses = entryInstances;

      const rawEvents = TaharaEventGenerator.generate(entryClasses, settings as any);

      // Map class instances to Interface expected by Calendar
      return rawEvents.map(e => ({
        id: e.taharaEventId || `generated-${e.jdate.Abs}-${e.taharaEventType}`,
        date: fromJDate(e.jdate), // Interface expects 'date' as JewishDate
        type: e.toTypeString() as 'hefsek' | 'bedika' | 'shailah' | 'mikvah',
        createdAt: 0, // Using 0 for calculated events
        updatedAt: 0,
      }));
    } catch (e) {
      console.error('Error generating tahara events:', e);
      return [];
    }
  }, [entryInstances, settings]);

  const handleCreateKavuah = async (suggestion: KavuahSuggestion, isIgnored: boolean) => {
    const kData = {
      kavuahType: suggestion.kavuah.kavuahType,
      settingEntryId: suggestion.kavuah.settingEntry.id,
      specialNumber: suggestion.kavuah.specialNumber,
      cancelsOnahBeinunis: suggestion.kavuah.cancelsOnahBeinunis || false,
      active: true,
      ignore: isIgnored,
    };
    await addKavuah(kData);
  };

  // Entry Form State
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [entryFormInitialDate, setEntryFormInitialDate] = useState<jDate | undefined>(undefined);
  const [editingEntry, setEditingEntry] = useState<EntryData | undefined>(undefined);
  const [suggestionsSnoozed, setSuggestionsSnoozed] = useState(false);

  // Reset snooze when entries change
  useEffect(() => {
    setSuggestionsSnoozed(false);
  }, [entryRecords]);

  // Calculate month info
  const monthInfo = useMemo(() => {
    let firstOfMonth: jDate, lastOfMonth: jDate;

    if (calendarView === 'jewish') {
      const year = currentJDate.Year;
      const month = currentJDate.Month;
      firstOfMonth = new jDate(year, month, 1);
      lastOfMonth = new jDate(year, month, jDate.daysJMonth(year, month));
    } else {
      const sDate = currentJDate.getDate();
      const firstSDate = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
      const lastSDate = new Date(sDate.getFullYear(), sDate.getMonth() + 1, 0);
      firstOfMonth = new jDate(firstSDate);
      lastOfMonth = new jDate(lastSDate);
    }

    const dayOfWeek = firstOfMonth.getDayOfWeek();
    const firstDayShown = firstOfMonth.addDays(-dayOfWeek);
    const lastDayOfWeek = lastOfMonth.getDayOfWeek();
    const daysAfterMonth = lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek;
    const lastDayShown = lastOfMonth.addDays(daysAfterMonth);

    const totalDays = lastDayShown.Abs - firstDayShown.Abs + 1;
    const weeksNeeded = Math.ceil(totalDays / 7);

    const days = [];
    const daysToShow = weeksNeeded * 7;
    for (let i = 0; i < daysToShow; i++) {
      days.push(firstDayShown.addDays(i));
    }

    return {
      days,
      weeksNeeded,
      year: firstOfMonth.Year,
      month: firstOfMonth.Month,
    };
  }, [currentJDate, calendarView]);

  // Open form for new entry
  const handleAddNewEntry = (date: jDate) => {
    setEntryFormInitialDate(date);
    setEditingEntry(undefined);
    setIsEntryFormOpen(true);
  };

  // Open form for existing entry
  const handleEditEntry = (entry: EntryData) => {
    setEditingEntry(entry);
    setEntryFormInitialDate(undefined);
    setIsEntryFormOpen(true);
  };

  // Handle form save
  const handleSaveEntry = async (entry: EntryData) => {
    // Calculate Haflaga
    // 1. Convert current date
    const currentDate = (entry.date as any).Abs
      ? (entry.date as unknown as jDate)
      : toJDate(entry.date);

    // 2. Sort all entries
    const otherEntries = entryInstances.filter(e => e.id !== entry.id);
    const sorted = [...otherEntries].sort((a, b) => {
      const dateA = toJDate((a as any).date || (a as any).jewishDate);
      const dateB = toJDate((b as any).date || (b as any).jewishDate);
      return dateA.Abs - dateB.Abs;
    });

    // 3. Find previous
    const prevEntry = sorted
      .filter(e => {
        const d = toJDate((e as any).date || (e as any).jewishDate);
        return d.Abs < currentDate.Abs;
      })
      .pop();

    // 4. Calculate haflaga
    let haflaga = 0;
    if (prevEntry) {
      const prevDate = toJDate((prevEntry as any).date || (prevEntry as any).jewishDate);
      haflaga = prevDate.diffDays(currentDate) + 1;
      console.log('Calculated Haflaga:', {
        current: currentDate.toString(),
        prev: prevDate.toString(),
        diff: haflaga,
      });
    } else {
      console.log('No previous entry found for Haflaga calculation', {
        current: currentDate.toString(),
      });
    }

    // Map to EntryData format handling Onah object vs enum
    const onahVal =
      (entry.onah as any).nightDay !== undefined ? (entry.onah as any).nightDay : entry.onah;

    const entryData = {
      id: entry.id,
      jewishDate: entry.date,
      onah: onahVal,
      haflaga: haflaga,
      ignoreForFlaggedDates: entry.ignoreForFlaggedDates,
      ignoreForKavuah: entry.ignoreForKavuah,
      comments: (entry as any).notes || (entry as any).comments,
    };

    // Ensure jewishDate is plain object (convert class or reference)
    const plainJewishDate = {
      year: currentDate.Year,
      month: currentDate.Month,
      day: currentDate.Day,
    };
    (entryData as any).jewishDate = plainJewishDate;

    // Check if entry exists to determine Add vs Modify
    const exists = entryInstances.some(e => e.id === entry.id);
    if (exists) {
      await modifyEntry(entry.id, entryData);
    } else {
      await addEntry(entryData);
    }

    // 5. Update NEXT entry's haflaga
    const nextEntry = sorted.find(e => {
      const d = toJDate((e as any).date || (e as any).jewishDate);
      return d.Abs > currentDate.Abs;
    });

    if (nextEntry) {
      const nextDate = toJDate((nextEntry as any).date || (nextEntry as any).jewishDate);
      const newNextHaflaga = currentDate.diffDays(nextDate) + 1;
      if ((nextEntry as any).haflaga !== newNextHaflaga) {
        // Prepare update for next entry
        const nextEntryData = {
          ...nextEntry,
          haflaga: newNextHaflaga,
        };
        // Ensure structure validity for update
        if ((nextEntryData as any).date) {
          const jd = toJDate((nextEntryData as any).date);
          (nextEntryData as any).jewishDate = { year: jd.Year, month: jd.Month, day: jd.Day };
        }
        await modifyEntry(nextEntry.id, nextEntryData);
      }
    }

    setIsEntryFormOpen(false);
  };

  // Handle delete
  const handleDeleteEntry = async (entry: EntryData) => {
    await removeEntry(entry.id);
  };

  const textInLanguage = {
    addEvent: lang === 'he' ? 'הוסף ראייה' : 'Add Entry',
  };

  return (
    <>
      <LuachWebCalendar
        lang={lang as 'en' | 'he'}
        textInLanguage={textInLanguage}
        currentJDate={currentJDate}
        monthInfo={monthInfo}
        selectedJDate={selectedJDate}
        location={location}
        setSelectedJDate={onDayClick}
        handleAddNewEventForDate={(e, date) => {
          e?.stopPropagation();
          handleAddNewEntry(date);
        }}
        handleEditEvent={(event: UserEvent | EntryData) => {
          // Check if it's an entry
          if ('date' in event) {
            handleEditEntry(event as EntryData);
          }
        }}
        getEventsForDate={getEventsForDate || (() => [])}
        navigateMonth={() => {}}
        today={today}
        calendarView={calendarView}
        theme={Themes.Warm}
        entries={entriesForView}
        flaggedOnahs={flaggedOnahs}
        taharaEvents={taharaEvents}
      />

      <EntryForm
        isOpen={isEntryFormOpen}
        onClose={() => setIsEntryFormOpen(false)}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        initialDate={entryFormInitialDate}
        existingEntry={editingEntry}
        lang={lang as 'en' | 'he'}
        location={location}
      />

      <KavuahSuggestionDialog
        isOpen={!suggestionsSnoozed && kavuahSuggestions.length > 0}
        onClose={() => setSuggestionsSnoozed(true)}
        suggestions={kavuahSuggestions}
        onAccept={s => handleCreateKavuah(s, false)}
        onIgnore={s => handleCreateKavuah(s, true)}
        lang={lang as 'en' | 'he'}
      />

      <SettingsPanel isOpen={isSettingsOpen} onClose={onCloseSettings} lang={lang as 'en' | 'he'} />

      <EntryList
        isOpen={isEntryListOpen}
        onClose={onCloseEntryList}
        lang={lang as 'en' | 'he'}
        onEdit={entry => {
          handleEditEntry(entry);
          onCloseEntryList();
        }}
        entries={entryInstances}
        onRemove={removeEntry}
      />

      <KavuahList
        isOpen={isKavuahListOpen}
        onClose={onCloseKavuahList}
        lang={lang as 'en' | 'he'}
      />
    </>
  );
}
