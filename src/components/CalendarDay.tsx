// Calendar Day Component with Niddah-specific coloring and labels
import { jDate } from 'jcal-zmanim';
import { Plus, Droplet, HelpCircle, Calendar as CalendarIcon, Waves } from 'lucide-react';
import type { Entry, TaharaEvent, TaharaEventType } from '@/types';
import { UserEvent, Themes } from '@/types-luach-web';
import { NightDay } from '@/types';
import { ProblemOnah } from '@/lib/chashavshavon/ProblemOnah';
import { NiddahStatus } from '@/lib/chashavshavon/StatusCalculator';
import { toHebrewNumber } from '@/lib/jcal/hebrewNumbers';
import { translateFlagDescription } from '@/lib/chashavshavon/FlaggedDatesTranslations';
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
  userEvents?: UserEvent[]; // Regular events (from luach-web)
  isHoliday?: boolean;
  isShabbos?: boolean;
  holidayName?: string;
  calendarView: 'jewish' | 'secular';
  lang: 'en' | 'he';
  onDayClick: () => void;
  onAddEntry: () => void;
  onAddHefsek: () => void;
  onAddBedika: () => void;
  onAddShailah: () => void;
  onAddMikvah: () => void;
  onAddUserEvent?: () => void;
  onAddTaharaEvent: (type: TaharaEventType) => void;
  onRemoveTaharaEvent: (event: TaharaEvent) => void;
  onEditEntry?: (entry: Entry) => void;
  onEditUserEvent?: (event: UserEvent) => void;
  status?: NiddahStatus;
  theme?: Themes;
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
  onAddBedika,
  onAddShailah,
  onAddMikvah,
  onAddTaharaEvent,
  onRemoveTaharaEvent,
  onEditEntry,
  onEditUserEvent,
  onAddUserEvent,
  status,
  theme,
}: CalendarDayProps) {
  const hasNightEntry = entry && entry.onah === NightDay.Night;
  const hasDayEntry = entry && entry.onah === NightDay.Day;

  const hasNightFlag = flaggedOnahs?.some(f => f.nightDay === NightDay.Night);
  const hasDayFlag = flaggedOnahs?.some(f => f.nightDay === NightDay.Day);

  // Determine background styling
  const getBackgroundStyle = () => {
    // For entry days: show a very subtle split-half indicator
    if (entry || hasNightFlag || hasDayFlag) {
      const direction = lang === 'he' ? 'to left' : 'to right';
      const entryAlpha = 'rgba(252, 165, 165, 0.08)';
      const flagAlpha = 'rgba(251, 191, 36, 0.07)';
      const niddahAlpha = 'rgba(252, 165, 165, 0.05)';
      const none = 'transparent';

      const nightHalf = hasNightEntry
        ? entryAlpha
        : hasNightFlag
          ? flagAlpha
          : status === NiddahStatus.Niddah
            ? niddahAlpha
            : none;
      const dayHalf = hasDayEntry
        ? entryAlpha
        : hasDayFlag
          ? flagAlpha
          : status === NiddahStatus.Niddah
            ? niddahAlpha
            : none;

      return {
        background: `linear-gradient(${direction}, ${nightHalf} 0%, ${nightHalf} 50%, ${dayHalf} 50%, ${dayHalf} 100%)`,
      };
    }

    if (status === NiddahStatus.Niddah) {
      return { backgroundColor: 'rgba(252, 165, 165, 0.04)' };
    }

    if (userEvents.length > 0 && userEvents[0].backColor) {
      return { backgroundColor: userEvents[0].backColor + '33' };
    }

    if (isHoliday || isShabbos) {
      return { backgroundColor: 'rgba(251, 191, 36, 0.04)' };
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
    // Join all flags with labels, translating each one if necessary
    return flag.flagsList.map(f => translateFlagDescription(f, lang)).join(', ');
  };

  return (
    <div
      className={`calendar-day-niddah ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${isOtherMonth ? 'is-other-month' : ''}`}
      style={getBackgroundStyle()}
      onClick={onDayClick}
    >
      {/* Astroid overlay for today */}
      {isToday && (
        <div className="astroid-overlay" style={{ zIndex: 1, pointerEvents: 'none' }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ width: '200%', height: '120%' }}
          >
            <path
              d="M 50 0 Q 50 50 100 50 Q 50 50 50 100 Q 50 50 0 50 Q 50 50 50 0"
              fill={
                theme === Themes.Dark || theme === Themes.Warm
                  ? 'rgba(200, 200, 255, 0.25)'
                  : 'rgba(0, 0, 100, 0.50)'
              }
            />
          </svg>
        </div>
      )}
      {/* Date Number */}
      <div className="day-number-container">
        {calendarView === 'jewish' ? (
          <>
            <span className="hebrew-day">
              {lang === 'he' ? toHebrewNumber(date.Day) : date.Day}
            </span>
            <span className="secular-day">{date.getDate().getDate()}</span>
          </>
        ) : (
          <>
            <span className="secular-day-primary">{date.getDate().getDate()}</span>
            <span className="hebrew-day-secondary">
              {lang === 'he' ? toHebrewNumber(date.Day) : date.Day}
            </span>
          </>
        )}
      </div>

      {/* Entry Label */}
      {entry && (
        <div
          className="entry-label"
          onClick={e => {
            e.stopPropagation();
            onEditEntry?.(entry);
          }}
          style={{ cursor: 'pointer' }}
        >
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
          {taharaEvents.map((event, idx) => {
            const isGenerated = event.id?.startsWith('generated-');
            return (
              <button
                key={event.id || idx}
                className={`tahara-event-badge ${isGenerated ? 'is-generated' : ''}`}
                onClick={e => {
                  e.stopPropagation();
                  if (isGenerated) {
                    onAddTaharaEvent(event.type);
                  } else {
                    onRemoveTaharaEvent(event);
                  }
                }}
                title={
                  isGenerated
                    ? `${lang === 'he' ? 'אשר: ' : 'Confirm: '}${getTaharaEventLabel(event)}`
                    : `${lang === 'he' ? 'מחק: ' : 'Delete: '}${getTaharaEventLabel(event)}`
                }
              >
                {getTaharaEventIcon(event)}
              </button>
            );
          })}
        </div>
      )}

      {/* User Events */}
      {userEvents && userEvents.length > 0 && (
        <div className="user-events flex flex-col gap-1 mt-1">
          {userEvents.map(event => (
            <div
              key={event.id}
              className="user-event-badge px-1 py-0.5 rounded textxs cursor-pointer hover:opacity-80 transition-opacity truncate"
              style={{
                backgroundColor: event.backColor || 'var(--accent-amber)',
                color: event.textColor || '#000000',
                fontSize: '0.7rem',
              }}
              onClick={e => {
                e.stopPropagation();
                onEditUserEvent?.(event);
              }}
              title={event.notes || event.name}
            >
              {event.name}
            </div>
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

            // Close all other open menus
            document.querySelectorAll('.add-menu.show').forEach(el => {
              if (el !== e.currentTarget.nextElementSibling) {
                el.classList.remove('show');
              }
            });

            // Toggle this menu
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
              e.currentTarget.parentElement?.classList.remove('show');
            }}
          >
            {lang === 'he' ? 'ראייה' : 'Entry'}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddHefsek();
              e.currentTarget.parentElement?.classList.remove('show');
            }}
          >
            {lang === 'he' ? 'הפסק טהרה' : 'Hefsek'}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddBedika();
              e.currentTarget.parentElement?.classList.remove('show');
            }}
          >
            {lang === 'he' ? 'בדיקה' : 'Bedika'}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddShailah();
              e.currentTarget.parentElement?.classList.remove('show');
            }}
          >
            {lang === 'he' ? 'שאלה' : 'Shailah'}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddMikvah();
              e.currentTarget.parentElement?.classList.remove('show');
            }}
          >
            {lang === 'he' ? 'מקווה' : 'Mikvah'}
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              if (onAddUserEvent) onAddUserEvent();
              e.currentTarget.parentElement?.classList.remove('show');
            }}
          >
            {lang === 'he' ? 'אירוע' : 'Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
