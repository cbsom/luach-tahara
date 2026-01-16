// Simplified Calendar wrapper for luach-tahara
import { useState, useMemo, useEffect } from 'react';
import { jDate } from 'jcal-zmanim';
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
}

export function Calendar({
  currentJDate,
  selectedJDate,
  calendarView,
  onDayClick,
  location,
  lang,
  getEventsForDate,
}: CalendarWrapperProps) {
  const today = new jDate();

  // DB Hooks
  const { entries: entryRecords, addEntry, modifyEntry, removeEntry } = useEntries();
  const { kavuahs: kavuahRecords, addKavuah } = useKavuahs(true);
  const { settings } = useSettings();

  // 1. Logic Objects: Transform EntryRecord to Entry Class Instances
  const entryInstances = useMemo(
    () =>
      entryRecords.map(r =>
        Entry.fromJewishDate(
          r.jewishDate,
          r.onah,
          r.id,
          r.ignoreForFlaggedDates,
          r.ignoreForKavuah,
          r.comments,
          r.haflaga
        )
      ),
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
    // Map to EntryData format expected by hook
    const entryData = {
      id: entry.id,
      jewishDate: entry.date,
      onah: entry.onah,
      haflaga: entry.haflaga || 0,
      ignoreForFlaggedDates: entry.ignoreForFlaggedDates || false,
      ignoreForKavuah: entry.ignoreForKavuah || false,
      comments: entry.notes,
    };

    if (editingEntry) {
      await modifyEntry(entry.id, entryData);
    } else {
      await addEntry(entryData);
    }
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
    </>
  );
}
