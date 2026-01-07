// Calendar Component - Jewish/Secular calendar display
import { useState, useMemo } from 'react';
import { jDate } from 'jcal-zmanim';
import { useTranslation } from '@/i18n/hooks';
import { useSettings } from '@/services/db/hooks';
import './Calendar.css';

interface CalendarDay {
  jewishDate: { year: number; month: number; day: number };
  secularDate: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export default function Calendar() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new jDate());

  const showJewish = settings?.calendarDisplaysCurrent === 'jewish';

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const daysInMonth = jDate.daysJMonth(currentDate.Year, currentDate.Month);

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const jd = new jDate(currentDate.Year, currentDate.Month, day);
      const today = new jDate();

      days.push({
        jewishDate: {
          year: jd.Year,
          month: jd.Month,
          day: jd.Day,
        },
        secularDate: jd.getDate(),
        isToday: jd.Abs === today.Abs,
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentDate]);

  const goToPreviousMonth = () => {
    const newDate = currentDate.addMonths(-1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = currentDate.addMonths(1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new jDate());
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="btn btn-secondary btn-sm" onClick={goToToday}>
          {t('calendar.today')}
        </button>

        <div className="calendar-nav">
          <button
            className="btn btn-secondary btn-sm"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>

          <h2 className="calendar-title">
            {showJewish
              ? currentDate.toStringHeb()
              : currentDate
                  .getDate()
                  .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>

          <button
            className="btn btn-secondary btn-sm"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="calendar-view-toggle">
          <span className="label">{t('calendar.showJewish')}</span>
        </div>
      </div>

      <div className="calendar-grid">
        {/* Weekday headers */}
        <div className="calendar-weekdays">
          {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(
            day => (
              <div key={day} className="calendar-weekday">
                {t(`dates.daysOfWeek.${day}`)}
              </div>
            )
          )}
        </div>

        {/* Calendar days */}
        <div className="calendar-days">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${day.isToday ? 'is-today' : ''} ${!day.isCurrentMonth ? 'is-other-month' : ''}`}
            >
              <div className="day-number">
                {showJewish ? day.jewishDate.day : day.secularDate.getDate()}
              </div>
              <div className="day-secondary">
                {showJewish ? day.secularDate.getDate() : day.jewishDate.day}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
