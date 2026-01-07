// Calendar Day Component with Niddah-specific coloring and labels
import { jDate } from 'jcal-zmanim';
import { Plus, Droplet, HelpCircle, Calendar as CalendarIcon, Waves } from 'lucide-react';
import type { Entry, TaharaEvent } from '@/types';
import { NightDay } from '@/types';
import { ProblemOnah } from '@/lib/chashavshavon/ProblemOnah';
import './CalendarDay.css';

interface CalendarDayProps {
  date: jDate;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
  entry?: Entry; // Entry that started on this day
  daysSinceEntry?: number; // Days since previous entry
  flaggedOnahs?: ProblemOnah[]; // Flagged onahs for this day
  taharaEvents?: TaharaEvent[]; // Tahara events on this day
  userEvents?: any[]; // Regular events (from luach-web)
  isHoliday?: boolean;
  isShabbos?: boolean;
  holidayName?: string;
  calendarView: 'jewish' | 'secular';
  lang: 'en' | 'he';
  onDayClick: () => void;
  onAddEntry: () => void;
  onAddHefsek: () => void;
  onAddShailah: () => void;
  onAddEvent: () => void;
  onAddMikvah: () => void;
  onRemoveTaharaEvent: (event: TaharaEvent) => void;
}

export function CalendarDay({
  date,
  isToday,
  isSelected,
  isOtherMonth,
  entry,
  daysSinceEntry,
  flaggedOnahs,
  taharaEvents = [],
  userEvents = [],
  isHoliday,
  isShabbos,
  holidayName,
  calendarView,
  lang,
  onDayClick,
  onAddEntry,
  onAddHefsek,
  onAddShailah,
  onAddEvent,
  onAddMikvah,
  onRemoveTaharaEvent,
}: CalendarDayProps) {
  const hasNightEntry = entry && entry.onah === NightDay.Night;
  const hasDayEntry = entry && entry.onah === NightDay.Day;

  const hasNightFlag = flaggedOnahs?.some(f => f.nightDay === NightDay.Night);
  const hasDayFlag = flaggedOnahs?.some(f => f.nightDay === NightDay.Day);

  // Determine background styling
  const getBackgroundStyle = () => {
    // Priority: Entry > Flagged Date > User Event > Holiday/Shabbos

    if (entry || hasNightFlag || hasDayFlag) {
      // Split background for entry or flagged dates
      return {
        background: `linear-gradient(to right, 
          ${hasNightEntry ? 'rgba(255, 200, 200, 0.3)' : hasNightFlag ? 'rgba(255, 235, 205, 0.3)' : 'transparent'} 0%, 
          ${hasNightEntry ? 'rgba(255, 200, 200, 0.3)' : hasNightFlag ? 'rgba(255, 235, 205, 0.3)' : 'transparent'} 50%, 
          ${hasDayEntry ? 'rgba(255, 200, 200, 0.3)' : hasDayFlag ? 'rgba(255, 235, 205, 0.3)' : 'transparent'} 50%, 
          ${hasDayEntry ? 'rgba(255, 200, 200, 0.3)' : hasDayFlag ? 'rgba(255, 235, 205, 0.3)' : 'transparent'} 100%
        )`,
      };
    }

    if (userEvents.length > 0 && userEvents[0].backColor) {
      return { backgroundColor: userEvents[0].backColor };
    }

    if (isHoliday || isShabbos) {
      return { backgroundColor: 'var(--holiday-bg)' };
    }

    return {};
  };

  const getTaharaEventIcon = (event: TaharaEvent) => {
    switch (event.type) {
      case 'hefsek':
        return <Droplet size={14} />;
      case 'bedika':
        return <span style={{ fontSize: '14px' }}>✓</span>;
      case 'shailah':
        return <HelpCircle size={14} />;
      case 'mikvah':
        return <Waves size={14} />;
      default:
        return <CalendarIcon size={14} />;
    }
  };

  const getTaharaEventLabel = (event: TaharaEvent) => {
    const labels = {
      hefsek: lang === 'he' ? 'הפסק טהרה' : 'Hefsek Tahara',
      bedika: lang === 'he' ? 'בדיקה' : 'Bedika',
      shailah: lang === 'he' ? 'שאלה' : 'Shailah',
      mikvah: lang === 'he' ? 'מקווה' : 'Mikvah',
    };
    return labels[event.type] || event.type;
  };

  const getFlagDescription = (flag: ProblemOnah): string => {
    // Join all flags with line breaks
    return flag.flagsList.join(', ');
  };

  return (
    <div
      className={`calendar-day-niddah ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${isOtherMonth ? 'is-other-month' : ''}`}
      style={getBackgroundStyle()}
      onClick={onDayClick}
    >
      {/* Date Number */}
      <div className="day-number-container">
        {calendarView === 'jewish' ? (
          <>
            <span className="hebrew-day">{date.Day}</span>
            <span className="secular-day">{date.getDate().getDate()}</span>
          </>
        ) : (
          <>
            <span className="secular-day-primary">{date.getDate().getDate()}</span>
            <span className="hebrew-day-secondary">{date.Day}</span>
          </>
        )}
      </div>

      {/* Entry Label */}
      {entry && (
        <div className="entry-label">
          <div className="entry-text">
            {lang === 'he' ? 'ראייה - ' : 'Entry - '}
            {entry.onah === NightDay.Night
              ? lang === 'he'
                ? 'עונת לילה'
                : 'Night'
              : lang === 'he'
                ? 'עונת יום'
                : 'Day'}
          </div>
          {entry.haflaga !== undefined && (
            <div className="entry-haflaga">
              {lang === 'he' ? 'הפלגה: ' : 'Haflaga: '}
              {entry.haflaga}
            </div>
          )}
        </div>
      )}

      {/* Days Since Entry */}
      {daysSinceEntry && daysSinceEntry > 1 && (
        <div className="days-since-entry">
          {lang === 'he' ? `יום ${daysSinceEntry}` : `Day ${daysSinceEntry}`}
        </div>
      )}

      {/* Flagged Date Labels */}
      {flaggedOnahs && flaggedOnahs.length > 0 && (
        <div className="flagged-labels">
          {flaggedOnahs.map((flag, idx) => (
            <div key={idx} className="flagged-label">
              <span className="flagged-onah">
                {flag.nightDay === NightDay.Night
                  ? lang === 'he'
                    ? 'לילה: '
                    : 'Night: '
                  : lang === 'he'
                    ? 'יום: '
                    : 'Day: '}
              </span>
              <span className="flagged-description">{getFlagDescription(flag)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tahara Events */}
      {taharaEvents.length > 0 && (
        <div className="tahara-events">
          {taharaEvents.map((event, idx) => (
            <button
              key={idx}
              className="tahara-event-badge"
              onClick={e => {
                e.stopPropagation();
                onRemoveTaharaEvent(event);
              }}
              title={getTaharaEventLabel(event)}
            >
              {getTaharaEventIcon(event)}
            </button>
          ))}
        </div>
      )}

      {/* Holiday/Shabbos Name */}
      {(isHoliday || isShabbos) && holidayName && !entry && !flaggedOnahs?.length && (
        <div className="holiday-name">{holidayName}</div>
      )}

      {/* Add Button with Menu */}
      <div className="add-menu-container">
        <button
          className="add-button"
          onClick={e => {
            e.stopPropagation();
            // Toggle menu
            const menu = e.currentTarget.nextElementSibling;
            if (menu) {
              menu.classList.toggle('show');
            }
          }}
          title={lang === 'he' ? 'הוסף' : 'Add'}
        >
          <Plus size={14} />
        </button>
        <div className="add-menu">
          <button
            onClick={e => {
              e.stopPropagation();
              onAddEntry();
            }}
          >
            {lang === 'he' ? 'ראייה' : 'Entry'}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddHefsek();
            }}
          >
            {lang === 'he' ? 'הפסק טהרה' : 'Hefsek'}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddShailah();
            }}
          >
            {lang === 'he' ? 'שאלה' : 'Shailah'}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddEvent();
            }}
          >
            {lang === 'he' ? 'אירוע' : 'Event'}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddMikvah();
            }}
          >
            {lang === 'he' ? 'מקווה' : 'Mikvah'}
          </button>
        </div>
      </div>
    </div>
  );
}
