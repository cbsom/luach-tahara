import React from 'react';
import { jDate, type Location } from 'jcal-zmanim';
import { UserEvent, Themes } from '../types-luach-web';
import { CalendarDay } from './CalendarDay';
import { Entry } from '../types';
import { fromJDate } from '../lib/jcal';
import { ProblemOnah } from '../lib/chashavshavon/ProblemOnah';
import { NiddahStatus } from '../lib/chashavshavon/StatusCalculator';
import type { TaharaEvent } from '../types';
import './calendar/Calendar.css';

interface CalendarProps {
  lang: 'en' | 'he';
  textInLanguage: Record<string, string>;
  currentJDate: jDate;
  monthInfo: { days: jDate[]; year: number; month: number; weeksNeeded: number };
  selectedJDate: jDate;
  location: Location;
  setSelectedJDate: (date: jDate) => void;
  handleAddNewEventForDate: (e: React.MouseEvent, date: jDate) => void;
  handleEditEvent: (event: UserEvent | Entry, date: jDate) => void;
  getEventsForDate: (date: jDate) => UserEvent[];
  today: jDate;
  calendarView: 'jewish' | 'secular';
  theme: Themes;
  entries?: Entry[];
  flaggedOnahs?: ProblemOnah[];
  taharaEvents?: TaharaEvent[];
  dayStatus?: Map<number, NiddahStatus>;
  onAddTaharaEvent: (type: 'hefsek' | 'bedika' | 'shailah' | 'mikvah', date: jDate) => void;
  onRemoveTaharaEvent: (event: TaharaEvent) => void;
  onAddUserEvent: (date: jDate) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  lang,
  currentJDate,
  monthInfo,
  selectedJDate,
  location,
  setSelectedJDate,
  handleAddNewEventForDate,
  handleEditEvent,
  getEventsForDate,
  today,
  calendarView,
  entries,
  flaggedOnahs,
  taharaEvents,
  dayStatus,
  onAddTaharaEvent,
  onRemoveTaharaEvent,
  onAddUserEvent,
}) => {
  return (
    <main className="calendar-container">
      <section className="flex flex-col gap-4 mb-4">
        <div className="calendar-body">
          <div className="calendar-weekdays">
            {(lang === 'he'
              ? ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
              : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbos']
            ).map(d => (
              <div
                key={d}
                className={`calendar-weekday ${d === (lang === 'he' ? 'שבת' : 'Shabbos') ? 'text-accent-amber' : ''}`}
              >
                {d}
              </div>
            ))}
          </div>

          <div
            className="calendar-days"
            style={
              {
                gridTemplateRows: `repeat(${monthInfo.weeksNeeded}, 1fr)`,
                '--weeks': monthInfo.weeksNeeded,
              } as React.CSSProperties
            }
          >
            {monthInfo.days.map((date: jDate, i: number) => {
              const isToday = date.Abs === today.Abs;
              const isSelected = date.Abs === selectedJDate.Abs;
              const isOtherMonth =
                calendarView === 'jewish'
                  ? date.Month !== currentJDate.Month
                  : date.getDate().getMonth() !== currentJDate.getDate().getMonth();

              // Niddah Data Logic
              const targetDate = fromJDate(date);
              const entry = entries?.find(
                e =>
                  e.date.year === targetDate.year &&
                  e.date.month === targetDate.month &&
                  e.date.day === targetDate.day
              );

              // Filter Flagged Dates
              // Use simplified comparison to avoid issues with different jDate instances
              const dayFlaggedOnahs = flaggedOnahs?.filter(po => po.jdate.Abs === date.Abs) || [];

              // Filter user events
              const dayEvents = getEventsForDate(date);

              // Holiday info
              const isYomTov = date.isYomTov(location.Israel);
              const isShabbos = date.getDayOfWeek() === 6;
              const holidayName = undefined;

              // Filter Tahara events for this day
              const dayTaharaEvents =
                taharaEvents?.filter(
                  e =>
                    e.date.year === date.Year &&
                    e.date.month === date.Month &&
                    e.date.day === date.Day
                ) || [];

              const status = dayStatus?.get(date.Abs);

              return (
                <CalendarDay
                  key={i}
                  date={date}
                  isToday={isToday}
                  isSelected={isSelected}
                  isOtherMonth={isOtherMonth}
                  entry={entry}
                  daysSinceEntry={entry ? 1 : undefined} // Logic for daysSinceEntry needed? CalendarDay uses it.
                  // Note: CalendarDay logic for daysSinceEntry was not fully implemented in wrapper yet, but prop exists.
                  // We'll leave it undefined for MVP or implement simple logic if entry exists.
                  // Actually, daysSinceEntry implies calculation from PREVIOUS entry. Here current entry makes it Day 1.

                  calendarView={calendarView}
                  lang={lang as 'en' | 'he'}
                  taharaEvents={dayTaharaEvents}
                  flaggedOnahs={dayFlaggedOnahs}
                  userEvents={dayEvents}
                  isHoliday={isYomTov}
                  isShabbos={isShabbos}
                  holidayName={holidayName}
                  status={status}
                  onDayClick={() => setSelectedJDate(date)}
                  onAddEntry={() =>
                    handleAddNewEventForDate(
                      { stopPropagation: () => {} } as React.MouseEvent,
                      date
                    )
                  }
                  onEditEntry={entry => handleEditEvent(entry, date)}
                  onAddHefsek={() => onAddTaharaEvent('hefsek', date)}
                  onAddBedika={() => onAddTaharaEvent('bedika', date)}
                  onAddShailah={() => onAddTaharaEvent('shailah', date)}
                  onAddMikvah={() => onAddTaharaEvent('mikvah', date)}
                  onAddTaharaEvent={type => onAddTaharaEvent(type, date)}
                  onRemoveTaharaEvent={onRemoveTaharaEvent}
                  onAddUserEvent={() => onAddUserEvent(date)}
                />
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};
