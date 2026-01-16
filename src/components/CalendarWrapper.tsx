// Simplified Calendar wrapper for luach-tahara
import { useState, useMemo } from 'react';
import { jDate } from 'jcal-zmanim';
import { Calendar as LuachWebCalendar } from './Calendar';
import { Themes, type UserEvent } from '../types-luach-web';
import type { Location } from 'jcal-zmanim';
import { EntryForm } from './EntryForm';
import { useEntries } from '../services/db/hooks';
import type { Entry } from '../types';

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
  events?: any[];
  getEventsForDate?: (date: jDate) => any[];
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

  // Transform EntryRecord to Entry
  const entries: Entry[] = useMemo(
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

  // Entry Form State
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [entryFormInitialDate, setEntryFormInitialDate] = useState<jDate | undefined>(undefined);
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>(undefined);

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
  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setEntryFormInitialDate(undefined);
    setIsEntryFormOpen(true);
  };

  // Handle form save
  const handleSaveEntry = async (entry: Entry) => {
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
  const handleDeleteEntry = async (entry: Entry) => {
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
        handleEditEvent={(event: UserEvent | Entry, date: jDate) => {
          // Check if it's an entry
          if ('date' in event) {
            handleEditEntry(event as Entry);
          }
        }}
        getEventsForDate={getEventsForDate || (() => [])}
        navigateMonth={() => {}}
        today={today}
        calendarView={calendarView}
        theme={Themes.Warm}
        entries={entries}
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
    </>
  );
}
