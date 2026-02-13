// Simplified Calendar wrapper for luach-tahara
import { useState, useMemo, useEffect } from 'react';
import { jDate } from 'jcal-zmanim';
import { fromJDate } from '../lib/jcal';
import { Calendar as LuachWebCalendar } from './Calendar';
import { Themes, type UserEvent } from '../types-luach-web';
import type { Location } from 'jcal-zmanim';
import { EntryForm } from './EntryForm';
import { useEntries, useKavuahs, useSettings, useTaharaEvents } from '../services/db/hooks';
import type { Entry as EntryData } from '../types';
import Entry from '../lib/chashavshavon/Entry';
import FlaggedDatesGenerator from '../lib/chashavshavon/FlaggedDatesGenerator';
import Kavuah, { type KavuahSuggestion } from '../lib/chashavshavon/Kavuah';
import { ProblemOnah } from '../lib/chashavshavon/ProblemOnah';
import { KavuahSuggestionDialog } from './KavuahSuggestionDialog';
import { SettingsPanel } from './settings/SettingsPanel';
import { EntryList } from './entries/EntryList';
import { KavuahList } from './kavuah/KavuahList';
import { FlaggedDatesSidebar } from './flagged-dates/FlaggedDatesSidebar';
import type { TaharaEvent, TaharaEventType } from '../types';
import { useUserEvents } from '../services/db/hooks';
import { EventModal } from './events/EventModal';
import { EventsListModal } from './events/EventsListModal';
import { UserEventTypes } from '../types-luach-web';
import { nanoid } from 'nanoid';
import { DailyInfoSidebar } from './DailyInfoSidebar';
import { ZmanimUtils, getNotifications } from 'jcal-zmanim';

import { toJDate } from '../lib/jcal';
import StatusCalculator from '../lib/chashavshavon/StatusCalculator';

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
  isFlaggedDatesListOpen?: boolean;
  onCloseFlaggedDatesList?: () => void;
  isUserEventsListOpen?: boolean;
  onCloseUserEventsList?: () => void;
  isDailyInfoOpen?: boolean;
  onCloseDailyInfo?: () => void;
}

export function Calendar({
  currentJDate,
  selectedJDate,
  calendarView,
  onDayClick,
  location,
  lang,
  isSettingsOpen = false,
  onCloseSettings = () => {},
  isEntryListOpen = false,
  onCloseEntryList = () => {},
  isKavuahListOpen = false,
  onCloseKavuahList = () => {},
  isFlaggedDatesListOpen = false,
  onCloseFlaggedDatesList = () => {},
  isUserEventsListOpen = false,
  onCloseUserEventsList = () => {},
  isDailyInfoOpen = false,
  onCloseDailyInfo = () => {},
}: CalendarWrapperProps) {
  const today = new jDate();

  // DB Hooks
  const { entries: entryRecords, addEntry, modifyEntry, removeEntry } = useEntries();
  const { kavuahs: kavuahRecords, addKavuah } = useKavuahs(true);
  const { settings, updateSingleSetting } = useSettings();
  const { taharaEvents: taharaRecords, addTaharaEvent, removeTaharaEvent } = useTaharaEvents();

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
    // 1. Map DB events to TaharaEvent interface
    const dbEvents: TaharaEvent[] = taharaRecords.map(r => ({
      id: r.id,
      date: r.jewishDate,
      type: r.type,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return [...dbEvents];
  }, [taharaRecords]);

  // Handlers for Tahara Events
  const handleAddTaharaEvent = async (type: TaharaEventType, date: jDate) => {
    const eventData = {
      jewishDate: fromJDate(date),
      type: type,
    };
    await addTaharaEvent(eventData);
  };

  const handleDeleteTaharaEvent = async (event: TaharaEvent) => {
    if (confirm(lang === 'he' ? 'למחוק אירוע זה?' : 'Delete this event?')) {
      if (event.id && !event.id.startsWith('generated-')) {
        await removeTaharaEvent(event.id);
      }
    }
  };

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
    if (suggestionsSnoozed) {
      const timer = setTimeout(() => setSuggestionsSnoozed(false), 0);
      return () => clearTimeout(timer);
    }
  }, [entryRecords, suggestionsSnoozed]);

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

  // Calculate Niddah Status
  const statusMap = useMemo(() => {
    if (!monthInfo.days.length) return new Map();
    // Map DB records to TaharaEvent interface (StatusCalculator expects 'date')
    const eventsForStatus = taharaRecords.map(r => ({
      id: r.id,
      date: r.jewishDate, // DB has jewishDate, interface needs date
      type: r.type,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    const calculator = new StatusCalculator(entryInstances, eventsForStatus);
    return calculator.getStatuses(monthInfo.days);
  }, [entryInstances, taharaRecords, monthInfo.days]);

  // User Events Logic
  const { userEvents, addUserEvent, modifyUserEvent, removeUserEvent } = useUserEvents();
  const [isUserEventModalOpen, setIsUserEventModalOpen] = useState(false);

  // User Event Form State
  const [userEventFormInitialDate, setUserEventFormInitialDate] = useState<jDate>(today);
  const [editingUserEvent, setEditingUserEvent] = useState<UserEvent | null>(null);
  const [userEventFormName, setUserEventFormName] = useState('');
  const [userEventFormNotes, setUserEventFormNotes] = useState('');
  const [userEventFormType, setUserEventFormType] = useState<UserEventTypes>(
    UserEventTypes.HebrewDateRecurringYearly
  );
  const [userEventFormColor, setUserEventFormColor] = useState('#fde047');
  const [userEventFormTextColor, setUserEventFormTextColor] = useState('#1e293b');
  const [userEventFormRemindDayOf, setUserEventFormRemindDayOf] = useState(false);
  const [userEventFormRemindDayBefore, setUserEventFormRemindDayBefore] = useState(false);

  const resetUserEventForm = () => {
    setUserEventFormName('');
    setUserEventFormNotes('');
    setUserEventFormType(UserEventTypes.HebrewDateRecurringYearly);
    setUserEventFormColor('#fde047');
    setUserEventFormTextColor('#1e293b');
    setUserEventFormRemindDayOf(false);
    setUserEventFormRemindDayBefore(false);
    setEditingUserEvent(null);
  };

  const handleEditUserEvent = (event: UserEvent, date?: jDate) => {
    const d = date || new jDate(event.jYear, event.jMonth, event.jDay); // Fallback if date not passed
    setUserEventFormInitialDate(d);
    setEditingUserEvent(event);
    setUserEventFormName(event.name);
    setUserEventFormNotes(event.notes);
    setUserEventFormType(event.type);
    setUserEventFormColor(event.backColor || '#fde047');
    setUserEventFormTextColor(event.textColor || '#1e293b');
    setUserEventFormRemindDayOf(event.remindDayOf || false);
    setUserEventFormRemindDayBefore(event.remindDayBefore || false);
    setIsUserEventModalOpen(true);
  };

  const handleAddNewUserEvent = (date: jDate) => {
    setUserEventFormInitialDate(date);
    resetUserEventForm();
    setIsUserEventModalOpen(true);
  };

  // Helper for matching months (leap years)
  const isMonthMatch = (occMonth: number, occYear: number, currMonth: number, currYear: number) => {
    if (currMonth >= 12 && occMonth >= 12) {
      const isOccLeap = jDate.isJdLeapY(occYear);
      const isCurrLeap = jDate.isJdLeapY(currYear);
      if (isOccLeap !== isCurrLeap) {
        return (
          (isOccLeap && currMonth === 12) || (isCurrLeap && occMonth === 12 && currMonth === 13)
        );
      }
    }
    return occMonth === currMonth;
  };

  const getUserEventsForDate = (date: jDate) => {
    const sDate = date.getDate();
    return userEvents.filter(uo => {
      // ⚡ High Efficiency Match using Absolute Date
      if (uo.type === UserEventTypes.OneTime) {
        return (
          uo.jAbs === date.Abs ||
          (uo.jDay === date.Day && uo.jMonth === date.Month && uo.jYear === date.Year)
        );
      }

      const eventStartAbs = uo.jAbs || jDate.absJd(uo.jYear, uo.jMonth, uo.jDay);
      if (eventStartAbs > date.Abs) return false;

      switch (uo.type) {
        case UserEventTypes.HebrewDateRecurringYearly:
          return uo.jDay === date.Day && isMonthMatch(uo.jMonth, uo.jYear, date.Month, date.Year);
        case UserEventTypes.HebrewDateRecurringMonthly:
          return uo.jDay === date.Day;
        case UserEventTypes.SecularDateRecurringYearly: {
          const occSDate = new Date(uo.sDate);
          return occSDate.getDate() === sDate.getDate() && occSDate.getMonth() === sDate.getMonth();
        }
        case UserEventTypes.SecularDateRecurringMonthly: {
          const occSDate = new Date(uo.sDate);
          return occSDate.getDate() === sDate.getDate();
        }
        default:
          return false;
      }
    });
  };

  const handleSaveUserEvent = async () => {
    const newId = editingUserEvent?.id || nanoid();
    // determine date from form or initial
    // If editing, keep original date unless we want to support changing date (not implemented in this form yet)
    // Actually EventModal has date change support but we need to implement it.
    // For now assume date is preserved from initial or editing.
    const baseDate = editingUserEvent
      ? new jDate(editingUserEvent.jYear, editingUserEvent.jMonth, editingUserEvent.jDay)
      : userEventFormInitialDate;

    // We need jAbs.
    const jAbs = editingUserEvent?.jAbs ?? baseDate.Abs;
    const sDate = baseDate.getDate();

    const newEvent: UserEvent = {
      id: newId,
      name: userEventFormName || 'New Event',
      notes: userEventFormNotes,
      type: userEventFormType,
      jYear: baseDate.Year,
      jMonth: baseDate.Month,
      jDay: baseDate.Day,
      jAbs: jAbs,
      sDate: sDate.toISOString(),
      backColor: userEventFormColor,
      textColor: userEventFormTextColor,
      remindDayOf: userEventFormRemindDayOf,
      remindDayBefore: userEventFormRemindDayBefore,
    };

    if (editingUserEvent) {
      await modifyUserEvent(editingUserEvent.id, newEvent);
    } else {
      await addUserEvent(newEvent);
    }

    setIsUserEventModalOpen(false);
    resetUserEventForm();
  };

  const handleDeleteUserEvent = async (id: string) => {
    await removeUserEvent(id);
    setIsUserEventModalOpen(false);
    resetUserEventForm();
  };

  // -------------------------------------------------------------------------
  // Daily Info Sidebar Data
  // -------------------------------------------------------------------------
  const selectedEntries = useMemo(() => {
    return entryRecords
      .filter(r => {
        const d = r.jewishDate;
        return (
          d.day === selectedJDate.Day &&
          d.month === selectedJDate.Month &&
          d.year === selectedJDate.Year
        );
      })
      .map(r => ({
        id: r.id,
        date: r.jewishDate,
        onah: r.onah,
        haflaga: r.haflaga,
        ignoreForFlaggedDates: r.ignoreForFlaggedDates,
        ignoreForKavuah: r.ignoreForKavuah,
        notes: r.comments,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
  }, [entryRecords, selectedJDate]);

  const selectedTaharaEvents = useMemo(() => {
    return taharaEvents.filter(
      e =>
        e.date.day === selectedJDate.Day &&
        e.date.month === selectedJDate.Month &&
        e.date.year === selectedJDate.Year
    );
  }, [taharaEvents, selectedJDate]);

  const selectedFlags = useMemo(() => {
    return flaggedOnahs.filter(po => po.jdate.Abs === selectedJDate.Abs);
  }, [flaggedOnahs, selectedJDate]);

  const selectedUserEvents = useMemo(
    () => getUserEventsForDate(selectedJDate),
    [userEvents, selectedJDate]
  );

  const selectedZmanim = useMemo(() => {
    return ZmanimUtils.getAllZmanim(selectedJDate, location);
  }, [selectedJDate, location]);

  const selectedDailyNotes = useMemo(() => {
    return getNotifications(
      selectedJDate,
      { hour: 10, minute: 0 },
      location,
      lang === 'en',
      true,
      false
    );
  }, [selectedJDate, location, lang]);

  // Open form for new entry
  const handleAddNewEntry = (date: jDate) => {
    setEntryFormInitialDate(date);
    setEditingEntry(undefined);
    setIsEntryFormOpen(true);
  };

  const textInLanguage = {
    addEvent: lang === 'he' ? 'הוסף ראייה' : 'Add Entry',
    saveEvent: lang === 'he' ? 'שמור' : 'Save',
    addNewEvent: lang === 'he' ? 'הוסף אירוע' : 'Add Event',
    deleteEvent: lang === 'he' ? 'מחק' : 'Delete',
    cancel: lang === 'he' ? 'ביטול' : 'Cancel',
    eventName: lang === 'he' ? 'שם האירוע' : 'Event Name',
    repeatPattern: lang === 'he' ? 'חזור' : 'Repeat',
    notes: lang === 'he' ? 'הערות' : 'Notes',
    colorTheme: lang === 'he' ? 'צבע' : 'Color',
    textColor: lang === 'he' ? 'צבע טקסט' : 'Text Color',
    reminders: lang === 'he' ? 'תזכורות' : 'Reminders',
    dayBefore: lang === 'he' ? 'יום לפני' : 'Day Before',
    dayOf: lang === 'he' ? 'ביום האירוע' : 'Day Of',
    deleteConfirmation:
      lang === 'he' ? 'האם למחוק אירוע זה?' : 'Are you sure you want to delete this event?',
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
        const plainNextEntry = nextEntry.toJewishDateAndOnah();
        const nextEntryData = {
          ...plainNextEntry,
          id: nextEntry.id,
          // Ensure we keep existing creation/update times if they exist (though toJewishDateAndOnah doesn't return them)
          // We rely on modifyEntry to handle timestamps usually, but let's be safe if we need full object
          haflaga: newNextHaflaga,
        };

        // We cast because toJewishDateAndOnah returns id? but we know it has one here
        await modifyEntry(nextEntry.id, nextEntryData as any);
      }
    }

    setIsEntryFormOpen(false);
  };

  // Handle delete
  const handleDeleteEntry = async (entry: EntryData) => {
    await removeEntry(entry.id);
  };

  // Overwrite textInLanguage to include event modal strings handled above

  return (
    <div className="flex flex-row gap-4 h-full w-full overflow-hidden relative">
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
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
          handleEditEvent={(event: UserEvent | EntryData, date: jDate) => {
            // Check if it's an entry
            if ('date' in event) {
              handleEditEntry(event as EntryData);
            } else {
              handleEditUserEvent(event as UserEvent, date);
            }
          }}
          getEventsForDate={getUserEventsForDate}
          today={today}
          calendarView={calendarView}
          theme={Themes.Warm}
          entries={entriesForView}
          flaggedOnahs={flaggedOnahs}
          taharaEvents={taharaEvents}
          dayStatus={statusMap}
          onAddTaharaEvent={handleAddTaharaEvent}
          onRemoveTaharaEvent={handleDeleteTaharaEvent}
          onAddUserEvent={handleAddNewUserEvent}
        />
      </div>

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

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
        lang={lang as 'en' | 'he'}
        settings={settings}
        updateSetting={updateSingleSetting}
      />

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

      <FlaggedDatesSidebar
        isOpen={isFlaggedDatesListOpen}
        onClose={onCloseFlaggedDatesList}
        lang={lang as 'en' | 'he'}
        flaggedOnahs={flaggedOnahs}
      />

      <EventModal
        isOpen={isUserEventModalOpen}
        onClose={() => setIsUserEventModalOpen(false)}
        editingEvent={editingUserEvent}
        textInLanguage={textInLanguage}
        lang={lang as 'en' | 'he'}
        selectedJDate={userEventFormInitialDate}
        formName={userEventFormName}
        setFormName={setUserEventFormName}
        formNotes={userEventFormNotes}
        setFormNotes={setUserEventFormNotes}
        formType={userEventFormType}
        setFormType={setUserEventFormType}
        formColor={userEventFormColor}
        setFormColor={setUserEventFormColor}
        formTextColor={userEventFormTextColor}
        setFormTextColor={setUserEventFormTextColor}
        formRemindDayOf={userEventFormRemindDayOf}
        setFormRemindDayOf={setUserEventFormRemindDayOf}
        formRemindDayBefore={userEventFormRemindDayBefore}
        setFormRemindDayBefore={setUserEventFormRemindDayBefore}
        onSave={handleSaveUserEvent}
        onDelete={handleDeleteUserEvent}
      />

      <EventsListModal
        isOpen={isUserEventsListOpen}
        onClose={() => {
          onCloseUserEventsList();
        }}
        events={userEvents}
        lang={lang as 'en' | 'he'}
        handleEditEvent={(event, date) => {
          handleEditUserEvent(event, date);
        }}
        deleteEvent={handleDeleteUserEvent}
        saveEvents={async () => {
          // Bulk save not implemented for saving order, but import uses it.
          // For now, assume this is mostly for delete/edit.
          // If import logic passes here, we should implement bulk save in hook.
        }}
        navigateToDate={date => {
          onDayClick(date);
          onCloseUserEventsList();
        }}
      />

      <DailyInfoSidebar
        isOpen={isDailyInfoOpen}
        onClose={onCloseDailyInfo}
        isDesktopHidden={!isDailyInfoOpen}
        onToggleDesktopMode={() => onCloseDailyInfo()}
        lang={lang as 'en' | 'he'}
        textInLanguage={textInLanguage}
        selectedJDate={selectedJDate}
        selectedEvents={selectedUserEvents}
        selectedZmanim={selectedZmanim}
        selectedNotes={selectedDailyNotes}
        location={location}
        entries={selectedEntries}
        taharaEvents={selectedTaharaEvents}
        flaggedOnahs={selectedFlags}
        handleEditEvent={(item, date) => {
          if ('onah' in item) {
            handleEditEntry(item as EntryData);
          } else if (
            'type' in item &&
            ['hefsek', 'bedika', 'shailah', 'mikvah'].includes((item as any).type)
          ) {
            // For now just allow deleting/seeing. If editing needed, we add it.
          } else {
            handleEditUserEvent(item as UserEvent, date);
          }
        }}
        deleteEvent={async (id, type) => {
          if (type === 'entry') await removeEntry(id);
          else if (type === 'user') await removeUserEvent(id);
          else if (type === 'tahara') await removeTaharaEvent(id);
        }}
        handleAddNewEventForDate={(e, date) => {
          e.stopPropagation();
          handleAddNewEntry(date);
        }}
      />
    </div>
  );
}
