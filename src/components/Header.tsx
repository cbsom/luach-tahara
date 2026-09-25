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
    <header className="glass-panel main-header flex flex-wrap items-center justify-between gap-3 md:gap-4">
      {/* Brand & Menu Group */}
      <div className="header-brand-group flex items-center gap-3">
        {/* 0. Hamburger Menu */}
        <button
          onClick={onSettingsClick}
          className="header-hamburger"
          style={{
            border: '0',
            color: 'var(--accent-amber)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
          }}
          title={lang === 'he' ? 'הגדרות' : 'Settings'}
        >
          <Menu size={20} />
        </button>

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
            >
            </div>
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
        <h1 className="flex gap-4 flex-row justify-center items-center calendar-month-year">
          <div className="font-bold">
            {currentMonthName} {currentYearName}
          </div>
          <div className="secondary-month-year  opacity-60">
            {secondaryDateRange}
          </div>
        </h1>
      </div>

      {/* Button Section 2: Show Lists */}
      <div className="header-section-2 flex items-center gap-2">
        <div
          className="flex items-center gap-1"
          style={{
            background: 'var(--btn-bg)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--btn-border)',
          }}
        >
          <button
            onClick={onEntriesClick}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
              (e.currentTarget as HTMLElement).style.background = 'var(--btn-bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
            title={lang === 'he' ? 'ראיות' : 'Entries'}
          >
            <List size={18} />
          </button>
          <button
            onClick={onFlaggedDatesClick}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
              (e.currentTarget as HTMLElement).style.background = 'var(--btn-bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
            title={lang === 'he' ? 'התראות' : 'Alerts'}
          >
            <AlertTriangle size={18} />
          </button>
          <button
            onClick={onKavuahsClick}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
              (e.currentTarget as HTMLElement).style.background = 'var(--btn-bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
            title={lang === 'he' ? 'וסתות' : 'Kavuahs'}
          >
            <Repeat size={18} />
          </button>
          <button
            onClick={onDailyInfoClick}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
              (e.currentTarget as HTMLElement).style.background = 'var(--btn-bg-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
            title={lang === 'he' ? 'מידע יומי' : 'Daily Info'}
          >
            <Info size={18} />
          </button>
        </div>

        <button
          onClick={onUserEventsClick}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold"
          style={{
            background: 'var(--btn-bg)',
            border: '1px solid var(--btn-border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-amber)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--btn-border)';
          }}
          title={lang === 'he' ? 'אירועים' : 'User Events'}
        >
          <CalendarIcon size={16} />
          {lang === 'he' ? 'אירועים' : 'Events'}
        </button>
      </div>

      {/* Button Section 3: Change Language / Theme / Calendar View & Auth */}
      <div className="header-section-3 flex items-center gap-2">
        <button
          onClick={() => setCalendarView(calendarView === 'jewish' ? 'secular' : 'jewish')}
          className="p-2 rounded-lg transition-all"
          style={{
            background: 'var(--btn-bg)',
            border: '1px solid var(--btn-border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
          title={
            calendarView === 'jewish' ? textInLanguage.secularMonth : textInLanguage.jewishMonth
          }
        >
          <CalendarDays size={18} />
        </button>

        <button
          onClick={() => onLangChange(lang === 'en' ? 'he' : 'en')}
          className="p-2 rounded-lg transition-all"
          style={{
            background: 'var(--btn-bg)',
            border: '1px solid var(--btn-border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
          title={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
        >
          <Languages size={18} />
          <span className="sr-only">{lang === 'he' ? 'En' : 'He'}</span>
        </button>

        <button
          onClick={() => cycleTheme(theme, onThemeChange)}
          className="p-2 rounded-lg transition-all"
          style={{
            background: 'var(--btn-bg)',
            border: '1px solid var(--btn-border)',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
          title={textInLanguage.colorTheme}
        >
          {getThemeIcon(theme)}
        </button>

        {/* Auth Buttons */}
        <div
          className="flex items-center gap-2 pl-2 ml-1"
          style={{ borderLeft: '1px solid var(--glass-border)' }}
        >
          {user ? (
            <button
              onClick={onLogout}
              className="text-xs font-semibold px-2 py-1.5 rounded-lg transition-all"
              style={{
                background: 'var(--btn-bg)',
                border: '1px solid var(--btn-border)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--accent-coral)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              {lang === 'he' ? 'התנתק' : 'Logout'}
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="text-xs font-semibold px-2 py-1.5 rounded-lg transition-all"
              style={{
                background: 'var(--btn-bg)',
                border: '1px solid var(--accent-amber)',
                color: 'var(--accent-amber)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-amber)';
                (e.currentTarget as HTMLElement).style.color = 'var(--btn-bg)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--btn-bg)';
                (e.currentTarget as HTMLElement).style.color = 'var(--accent-amber)';
              }}
            >
              {lang === 'he' ? 'התחבר' : 'Login'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
