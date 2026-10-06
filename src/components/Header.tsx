import {
  Menu,
  List,
  Repeat,
  AlertTriangle,
  CalendarClockIcon,
  Languages,
  CalendarDays,
  Info,
  HelpCircle,
  LogOut,
  LogIn,
} from 'lucide-react';
import { getThemeIcon, cycleTheme } from '../utils.tsx';
import { Themes } from '../types-luach-web';
import type { User } from 'firebase/auth';
import { DateNavigation } from './DateNavigation';

interface HeaderProps {
  theme: Themes;
  onThemeChange: (theme: Themes) => void;
  lang: string;
  onLangChange: (lang: 'en' | 'he') => void;
  onSettingsClick: () => void;
  onEntriesClick: () => void;
  onKavuahsClick: () => void;
  onFlaggedDatesClick: () => void;
  onUserEventsClick: () => void;
  onLogin: () => void;
  onLogout: () => void;
  user: User | null;

  // Navigation Props
  currentMonthName: string;
  currentYearName: string;
  secondaryDateRange: string;
  navigateMonth: (direction: number) => void;
  navigateYear: (direction: number) => void;
  handleGoToToday: () => void;
  setIsJumpModalOpen: (isOpen: boolean) => void;
  calendarView: 'jewish' | 'secular';
  setCalendarView: (view: 'jewish' | 'secular') => void;
  onDailyInfoClick: () => void;
  onHelpClick?: () => void;
}

export function Header({
  theme,
  onThemeChange,
  lang,
  onLangChange,
  onSettingsClick,
  onEntriesClick,
  onKavuahsClick,
  onFlaggedDatesClick,
  onUserEventsClick,
  onLogin,
  onLogout,
  user,
  currentMonthName,
  currentYearName,
  secondaryDateRange,
  navigateMonth,
  navigateYear,
  handleGoToToday,
  setIsJumpModalOpen,
  calendarView,
  setCalendarView,
  onDailyInfoClick,
  onHelpClick,
}: HeaderProps) {
  const textInLanguage = {
    goToDate: lang === 'he' ? 'עבור לתאריך' : 'Go to Date',
    previousYear: lang === 'he' ? 'שנה קודמת' : 'Previous Year',
    previousMonth: lang === 'he' ? 'חודש שעבר' : 'Previous Month',
    today: lang === 'he' ? 'היום' : 'Today',
    nextMonth: lang === 'he' ? 'חודש הבא' : 'Next Month',
    nextYear: lang === 'he' ? 'שנה הבאה' : 'Next Year',
    secularMonth: lang === 'he' ? 'תאריך לועזי' : 'Secular Month',
    jewishMonth: lang === 'he' ? 'תאריך עברי' : 'Jewish Month',
    colorTheme: lang === 'he' ? 'ערכת צבעים' : 'Color Theme',
  };

  return (
    <header className="glass-panel main-header flex flex-wrap items-center justify-between gap-3 md:gap-4">
      {/* Brand & Menu Group */}
      <div className="header-brand-group flex items-center gap-3">
        {/* Brand Logo & Title */}
        <div className="header-logo flex items-center gap-3">
          <div className="p-1 bg-accent-amber/10 rounded-xl overflow-hidden shadow-inner logo-image-wrapper">
            <div
              className="logo-image"
              style={{
                backgroundImage: 'url(icons/logo.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
          </div>
          <h1 className="logo-title text-xl font-black tracking-tight">
            {lang === 'he' ? 'לוח טהרה' : 'Luach Tahara'}
          </h1>
        </div>
      </div>

      {/* Button Section 1: Date Navigation (Current month directly below it) */}
      <div className="header-section-1 flex flex-col items-center justify-center gap-1">
        <DateNavigation
          className="nav-controls"
          lang={lang as 'en' | 'he'}
          textInLanguage={textInLanguage}
          navigateMonth={navigateMonth}
          navigateYear={navigateYear}
          handleGoToToday={handleGoToToday}
          setIsJumpModalOpen={setIsJumpModalOpen}
        />
        <h1 className="flex gap-4 flex-row flex-wrap justify-center items-baseline calendar-month-year">
          <div className="font-bold">
            {currentMonthName} {currentYearName}
          </div>
          <div className="secondary-month-year  opacity-60">{secondaryDateRange}</div>
        </h1>
      </div>

      {/* Button Section 2: Show Lists */}
      <div className="header-section-2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onUserEventsClick}
            className="header-icon-btn"
            title={lang === 'he' ? 'אירועים' : 'User Events'}
          >
            <CalendarClockIcon size={18} />
            {lang === 'he' ? 'אירועים' : 'User Events'}
          </button>
          <button
            onClick={onEntriesClick}
            className="header-icon-btn"
            title={lang === 'he' ? 'ראיות' : 'Entries'}
          >
            <List size={18} />
            {lang === 'he' ? 'ראיות' : 'Entries'}
          </button>
          <button
            onClick={onFlaggedDatesClick}
            className="header-icon-btn"
            title={lang === 'he' ? 'התראות' : 'Alerts'}
          >
            <AlertTriangle size={18} />
            {lang === 'he' ? 'התראות' : 'Alerts'}
          </button>
          <button
            onClick={onKavuahsClick}
            className="header-icon-btn"
            title={lang === 'he' ? 'רשימת וסת קבוע' : 'Kavuahs'}
          >
            <Repeat size={18} />
            {lang === 'he' ? 'רשימת וסת קבוע' : 'Kavuahs'}
          </button>
          <button
            onClick={onDailyInfoClick}
            className="header-icon-btn"
            title={lang === 'he' ? 'מידע יומי' : 'Daily Info'}
          >
            <Info size={18} />
            {lang === 'he' ? 'מידע יומי' : 'Daily Info'}
          </button>
        </div>
      </div>

      {/* Button Section 3: Change Language / Theme / Calendar View & Auth */}
      <div className="header-section-3 flex items-center gap-2">
        <button
          onClick={() => setCalendarView(calendarView === 'jewish' ? 'secular' : 'jewish')}
          className="header-icon-btn"
          title={
            calendarView === 'jewish' ? textInLanguage.secularMonth : textInLanguage.jewishMonth
          }
        >
          <CalendarDays size={18} />
          {calendarView === 'jewish' ? textInLanguage.secularMonth : textInLanguage.jewishMonth}
        </button>

        <button
          onClick={() => onLangChange(lang === 'en' ? 'he' : 'en')}
          className="header-icon-btn"
          title={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
        >
          <Languages size={18} />
          {lang === 'he' ? 'Enlish' : 'עברית'}
        </button>

        <button
          onClick={() => cycleTheme(theme, onThemeChange)}
          className="header-icon-btn"
          title={textInLanguage.colorTheme}
        >
          {getThemeIcon(theme)}
          {textInLanguage.colorTheme}
        </button>

        {onHelpClick && (
          <button
            onClick={onHelpClick}
            className="header-icon-btn"
            title={lang === 'he' ? 'עזרה ומדריך למשתמש' : 'Help & User Guide'}
          >
            <HelpCircle size={18} />
            {lang === 'he' ? 'עזרה' : 'Help'}
          </button>
        )}

        {/* Auth Buttons */}
        <div
          className="flex items-center gap-2 pl-2 ml-1"
          style={{ borderLeft: '1px solid var(--glass-border)' }}
        >
          {user ? (
            <button onClick={onLogout} className="header-icon-btn">
              <LogOut size={18} />
              {lang === 'he' ? 'התנתק' : 'Logout'}
            </button>
          ) : (
            <button onClick={onLogin} className="header-icon-btn">
              <LogIn size={18} />
              {lang === 'he' ? 'התחבר' : 'Login'}
            </button>
          )}
          
          {/* 0. Hamburger Menu */}
          <button
            onClick={onSettingsClick}
            className="header-icon-btn"
            title={lang === 'he' ? 'הגדרות' : 'Settings'}
          >
            <Menu size={20} />
            {lang === 'he' ? 'הגדרות' : 'Settings'}
          </button>
        </div>
      </div>
    </header>
  );
}
