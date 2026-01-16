import React from 'react';
import { jDate } from 'jcal-zmanim';
import { UserEvent, Themes } from '../types-luach-web';
import { CalendarDay } from './CalendarDay';
import { Entry } from '../types';
import { fromJDate } from '../lib/jcal';
import { ProblemOnah } from '../lib/chashavshavon/ProblemOnah';

interface CalendarProps {
  lang: 'en' | 'he';
  textInLanguage: any;
  currentJDate: jDate;
  monthInfo: { days: jDate[]; year: number; month: number; weeksNeeded: number };
  selectedJDate: jDate;
  location: any;
  setSelectedJDate: (date: jDate) => void;
  handleAddNewEventForDate: (e: React.MouseEvent, date: jDate) => void;
  handleEditEvent: (event: UserEvent | Entry, date: jDate) => void;
  getEventsForDate: (date: jDate) => any[];
  navigateMonth: (direction: number) => void;
  today: jDate;
  calendarView: 'jewish' | 'secular';
  theme: Themes;
  entries?: Entry[];
  flaggedOnahs?: ProblemOnah[];
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
}) => {
  return (
    <main className="calendar-container">
      <section className="calendar-body">
        <div className="weekdays-header">
          {(calendarView === 'jewish'
            ? ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
            : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbos']
          ).map(d => (
            <div
              key={d}
              className={d === (lang === 'he' ? 'שבת' : 'Shabbos') ? 'text-accent-amber' : ''}
            >
              {d}
            </div>
          ))}
        </div>

        <div
          className="calendar-grid"
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

            return (
              <CalendarDay
                key={i}
                date={date}
                isToday={isToday}
                isSelected={isSelected}
                isOtherMonth={isOtherMonth}
                entry={entry}
                calendarView={calendarView}
                lang={lang as 'en' | 'he'}
                taharaEvents={[]}
                flaggedOnahs={dayFlaggedOnahs}
                userEvents={dayEvents}
                isHoliday={isYomTov}
                isShabbos={isShabbos}
                holidayName={holidayName}
                onDayClick={() => setSelectedJDate(date)}
                onAddEntry={() =>
                  handleAddNewEventForDate({ stopPropagation: () => {} } as React.MouseEvent, date)
                }
                onEditEntry={entry => handleEditEvent(entry, date)}
                onAddEvent={() =>
                  handleAddNewEventForDate({ stopPropagation: () => {} } as React.MouseEvent, date)
                }
                onAddHefsek={() => console.log('Add Hefsek')}
                onAddShailah={() => console.log('Add Shailah')}
                onAddMikvah={() => console.log('Add Mikvah')}
                onRemoveTaharaEvent={() => {}}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
};
