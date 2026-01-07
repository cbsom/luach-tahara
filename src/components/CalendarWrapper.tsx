// Simplified Calendar wrapper for luach-tahara
import { useMemo } from 'react';
import { jDate } from 'jcal-zmanim';
import { Calendar as LuachWebCalendar } from './Calendar';
import { Themes } from '../types-luach-web';
import type { Location } from 'jcal-zmanim';

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
  events: any[];
  getEventsForDate: (date: jDate) => any[];
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

  const textInLanguage = {
    addEvent: lang === 'he' ? 'הוסף אירוע' : 'Add Event',
  };

  return (
    <LuachWebCalendar
      lang={lang as 'en' | 'he'}
      textInLanguage={textInLanguage}
      currentJDate={currentJDate}
      monthInfo={monthInfo}
      selectedJDate={selectedJDate}
      location={location}
      setSelectedJDate={onDayClick}
      handleAddNewEventForDate={(e, date) => {
        e.stopPropagation();
        console.log('Add event for date:', date.toString());
        // TODO: Open entry form
      }}
      handleEditEvent={(event, date) => {
        console.log('Edit event:', event, 'for date:', date.toString());
        // TODO: Open event edit modal
      }}
      getEventsForDate={getEventsForDate}
      navigateMonth={direction => {
        console.log('Navigate month:', direction);
        // Handled by parent
      }}
      today={today}
      calendarView={calendarView}
      theme={Themes.Warm}
    />
  );
}
