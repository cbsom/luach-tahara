import React from 'react';
import { jDate, type Location, getNotifications, Utils } from 'jcal-zmanim';
import { UserEvent, Themes } from '../types-luach-web';
import { CalendarDay } from './CalendarDay';
import { Entry } from '../types';
import { fromJDate } from '../lib/jcal';
import { ProblemOnah } from '../lib/chashavshavon/ProblemOnah';
import { NiddahStatus } from '../lib/chashavshavon/StatusCalculator';
import type { TaharaEvent } from '../types';
import { formatTime } from '../utils';
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
  theme,
  entries,
  flaggedOnahs,
  taharaEvents,
  dayStatus,
  onAddTaharaEvent,
  onRemoveTaharaEvent,
  onAddUserEvent,
}) => {
  // Memoize sorted entries for daysSinceEntry calculation
  const sortedEntriesDesc = React.useMemo(() => {
    return [...(entries || [])].sort((a, b) => {
      const absA = new jDate(a.date.year, a.date.month, a.date.day).Abs;
      const absB = new jDate(b.date.year, b.date.month, b.date.day).Abs;
      return absB - absA; // Descending (newest first)
    });
  }, [entries]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If the click is not inside an add-menu or add-button, close all open menus
      const target = e.target as HTMLElement;
      if (!target.closest('.add-menu') && !target.closest('.add-button')) {
        document.querySelectorAll('.add-menu.show').forEach(el => {
          el.classList.remove('show');
        });
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <main className="calendar-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <section className="flex flex-col flex-1 min-h-0">
        <div className="calendar-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
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
                flex: 1,
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

              // Holiday info — shade Yom Tov and Chol HaMoed (matches luach-web)
              const isYomTov = date.isYomTovOrCholHamoed(location.Israel);
              const isShabbos = date.getDayOfWeek() === 6; // jcal-zmanim: 0=Sun…6=Shabbos

              // Notifications (same logic as luach-web)
              const notes = getNotifications(
                date,
                { hour: 10, minute: 0 },
                location,
                lang === 'en',
                true,
                false
              );

              // Parasha (Shabbos only, not Yom Tov)
              let parasha: string | undefined;
              if (isShabbos && !date.isYomTovOrCholHamoed(location.Israel)) {
                const sedra = date.getSedra(location.Israel);
                parasha = String(lang === 'he' ? sedra.toStringHeb() : sedra.toString());
              }

              // Candle lighting
              const candlesTime = date.getCandleLighting(location, true);
              const candleLighting = candlesTime ? formatTime(candlesTime) : undefined;

              // Build notification strings
              const allNotes: string[] = [];
              const omerDay = date.getDayOfOmer();
              if (omerDay > 0) {
                allNotes.push(
                  lang === 'he'
                    ? `עומר: ${Utils.toJewishNumber(omerDay)}`
                    : `Omer: ${omerDay}`
                );
              }
              (notes.dayNotes || []).forEach((n: string) => allNotes.push(n));
              const shulNotes = (notes as any).shulNotes || [];
              shulNotes
                .filter((n: string) =>
                  n.includes('Mevarchim') || n.includes('מברכים') ||
                  n.includes('Shkalim')   || n.includes('שקלים') ||
                  n.includes('Zachor')    || n.includes('זכור') ||
                  n.includes('Parah')     || n.includes('פרה') ||
                  n.includes('Hachodesh') || n.includes('החודש') ||
                  n.includes('Hagadol')   || n.includes('הגדול') ||
                  n.includes('Shuva')     || n.includes('שובה') ||
                  n.includes('Chazon')    || n.includes('חזון') ||
                  n.includes('Shira')     || n.includes('שירה')
                )
                .forEach((n: string) => { if (!allNotes.includes(n)) allNotes.push(n); });

              // Filter Tahara events for this day
              const dayTaharaEvents =
                taharaEvents?.filter(
                  e =>
                    e.date.year === date.Year &&
                    e.date.month === date.Month &&
                    e.date.day === date.Day
                ) || [];

              const status = dayStatus?.get(date.Abs);

              // Calculate daysSinceEntry
              let daysSinceEntry: number | undefined = undefined;
              if (status === NiddahStatus.Niddah) {
                const mostRecentEntry = sortedEntriesDesc.find(e => {
                  const eAbs = new jDate(e.date.year, e.date.month, e.date.day).Abs;
                  return eAbs <= date.Abs;
                });

                if (mostRecentEntry) {
                  const eAbs = new jDate(
                    mostRecentEntry.date.year,
                    mostRecentEntry.date.month,
                    mostRecentEntry.date.day
                  ).Abs;
                  daysSinceEntry = date.Abs - eAbs + 1;
                }
              }

              return (
                <CalendarDay
                  key={i}
                  date={date}
                  isToday={isToday}
                  isSelected={isSelected}
                  isOtherMonth={isOtherMonth}
                  entry={entry}
                  daysSinceEntry={daysSinceEntry}
                  calendarView={calendarView}
                  lang={lang as 'en' | 'he'}
                  taharaEvents={dayTaharaEvents}
                  flaggedOnahs={dayFlaggedOnahs}
                  userEvents={dayEvents}
                  isHoliday={isYomTov}
                  isShabbos={isShabbos}
                  parasha={parasha}
                  candleLighting={candleLighting}
                  notifications={allNotes}
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
                  theme={theme}
                />
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};
