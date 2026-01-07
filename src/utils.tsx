// Utility functions for luach-tahara
import { jDate, type Time } from 'jcal-zmanim';
import { Themes, UserEvent, UserEventTypes } from './types-luach-web';
import { Sun, Moon, Flame, Droplets } from 'lucide-react';

/**
 * Format time object to HH:MM string
 */
export function formatTime(time: Time | undefined): string {
  if (!time) return '--:--';
  const minutes = Math.floor(time.minute);
  return `${time.hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get anniversary number for recurring events
 */
export function getAnniversaryNumber(event: UserEvent, date: jDate): number {
  const startYear = event.jAbs ? new jDate(event.jAbs).Year : event.jYear;

  switch (event.type) {
    case UserEventTypes.HebrewDateRecurringYearly:
      return date.Year - startYear;
    case UserEventTypes.HebrewDateRecurringMonthly: {
      let months = 0;
      for (let y = event.jYear; y < date.Year; y++) {
        months += jDate.isJdLeapY(y) ? 13 : 12;
      }
      months += date.Month - event.jMonth;
      return months;
    }
    case UserEventTypes.SecularDateRecurringYearly:
      return date.getDate().getFullYear() - new Date(event.sDate).getFullYear();
    case UserEventTypes.SecularDateRecurringMonthly: {
      const d1 = new Date(event.sDate);
      const d2 = date.getDate();
      return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    }
    default:
      return 0;
  }
}

/**
 * Get theme icon component
 */
export function getThemeIcon(theme: Themes) {
  const iconProps = { size: 18, color: 'var(--accent-amber)' };

  switch (theme) {
    case Themes.Warm:
      return <Flame {...iconProps} />;
    case Themes.Dark:
      return <Moon {...iconProps} />;
    case Themes.Light:
      return <Sun {...iconProps} />;
    case Themes.Tcheles:
      return <Droplets {...iconProps} />;
    default:
      return <Flame {...iconProps} />;
  }
}

/**
 * Cycle through themes
 */
export function cycleTheme(currentTheme: Themes, setTheme: (theme: Themes) => void) {
  const themes = [Themes.Warm, Themes.Dark, Themes.Light, Themes.Tcheles];
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
}
