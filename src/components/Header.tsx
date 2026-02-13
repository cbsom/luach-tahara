import {
  Menu,
  List,
  Repeat,
  AlertTriangle,
  Calendar as CalendarIcon,
  Languages,
  CalendarDays,
  Info,
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
    <header className="glass-panel p-2 md:p-4 px-3 md:px-6 flex flex-row items-center justify-between main-header gap-3 md:gap-4">
      {/* Top Row / Left Side */}
      <div className="flex items-center justify-between w-full md:w-auto gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onSettingsClick}
            className=""
            style={{
              border: '0',
              color: 'var(--accent-amber)',
              backgroundColor: 'transparent',
            }}
            title={lang === 'he' ? 'הגדרות' : 'Settings'}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-1 bg-accent-amber/10 rounded-xl overflow-hidden shadow-inner hidden sm:block">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--accent-coral)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                💧
              </div>
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block">
              {lang === 'he' ? 'לוח טהרה' : 'Luach Tahara'}
            </h1>
          </div>
        </div>

        {/* Mobile: Date & Title handled differently or stacked? For now keeping flexible */}
      </div>

      {/* Date Navigation Center */}
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 w-full md:w-auto justify-center">
        <DateNavigation
          className="nav-controls"
          lang={lang as 'en' | 'he'}
          textInLanguage={textInLanguage}
          navigateMonth={navigateMonth}
          navigateYear={navigateYear}
          handleGoToToday={handleGoToToday}
          setIsJumpModalOpen={setIsJumpModalOpen}
        />
        <h1 className="flex gap-2 md:gap-4 flex-row justify-between items-center calendar-month-year text-lg md:text-xl">
          <div className="font-bold">
            {currentMonthName} {currentYearName}
          </div>
          <div className="secondary-month-year text-sm opacity-60 font-medium">
            {secondaryDateRange}
          </div>
        </h1>
      </div>

      {/* Right Side: Tools & Auth */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Helper Navigation Icons (Hidden on very small screens or moved to bottom/sidebar ideally) */}
        {!user ? null : (
          <div className="hidden xl:flex items-center gap-1 mr-2 bg-glass-overlay rounded-xl p-1">
            <button
              onClick={onEntriesClick}
              className="p-2 hover:bg-glass-hover rounded-lg"
              title={lang === 'he' ? 'ראיות' : 'Entries'}
            >
              <List size={18} />
            </button>
            <button
              onClick={onFlaggedDatesClick}
              className="p-2 hover:bg-glass-hover rounded-lg"
              title={lang === 'he' ? 'התראות' : 'Alerts'}
            >
              <AlertTriangle size={18} />
            </button>
            <button
              onClick={onKavuahsClick}
              className="p-2 hover:bg-glass-hover rounded-lg"
              title={lang === 'he' ? 'וסתות' : 'Kavuahs'}
            >
              <Repeat size={18} />
            </button>
            <button
              onClick={onDailyInfoClick}
              className="p-2 hover:bg-glass-hover rounded-lg"
              title={lang === 'he' ? 'מידע יומי' : 'Daily Info'}
            >
              <Info size={18} />
            </button>
          </div>
        )}

        <button
          onClick={() => setCalendarView(calendarView === 'jewish' ? 'secular' : 'jewish')}
          className="p-2 no-border no-background cursor-pointer btn-warm rounded-lg hover:bg-glass-hover"
          title={
            calendarView === 'jewish' ? textInLanguage.secularMonth : textInLanguage.jewishMonth
          }
        >
          <CalendarDays size={18} />
        </button>

        <button
          onClick={() => onLangChange(lang === 'en' ? 'he' : 'en')}
          className="p-2 rounded-lg hover:bg-glass-hover transition-colors opacity-80 hover:opacity-100"
          title={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
        >
          <Languages size={18} />
          <span className="sr-only">{lang === 'he' ? 'En' : 'He'}</span>
        </button>

        <button
          onClick={() => cycleTheme(theme, onThemeChange)}
          className="p-2 no-border no-background cursor-pointer hover:bg-glass-hover rounded-lg"
          title={textInLanguage.colorTheme}
        >
          {getThemeIcon(theme)}
        </button>

        {/* Auth Button */}
        <div className="flex items-center gap-2 border-l border-glass-border pl-2 ml-1">
          <button
            onClick={user ? onUserEventsClick : onLogin}
            className={`flex items-center justify-center p-2 rounded-lg transition-colors ${user ? 'hover:bg-glass-hover' : 'bg-accent-amber text-white hover:bg-amber-600'}`}
            title={
              user ? (lang === 'he' ? 'אירועים' : 'User Events') : lang === 'he' ? 'התחבר' : 'Login'
            }
          >
            {user ? <CalendarIcon size={18} /> : lang === 'he' ? 'התחבר' : 'Login'}
          </button>
          {user && (
            <button
              onClick={onLogout}
              className="text-xs font-semibold px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors hidden sm:block"
            >
              {lang === 'he' ? 'התנתק' : 'Logout'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
