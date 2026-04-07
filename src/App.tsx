import { useState, useMemo, useEffect } from 'react';
import { jDate, Utils, Locations, JewishMonthsHeb, JewishMonthsEng } from 'jcal-zmanim';
import { Header } from './components/Header';
import { Calendar } from './components/CalendarWrapper';
import { MobileFooter } from './components/MobileFooter';
import { useTranslation, useCurrentLanguage, useIsRTL } from './i18n/hooks';
import { useSettings } from './services/db/hooks';
import { Themes } from './types-luach-web';
import { useAuth, useAutoSync } from './services/firebase/hooks';
import { AuthModal } from './components/auth/AuthModal';
import { JumpDateModal } from './components/JumpDateModal';
import { clearAllData } from './services/db';

function App() {
  const { i18n } = useTranslation();
  const currentLang = useCurrentLanguage();
  const isRTL = useIsRTL();
  const { user, signOut } = useAuth();

  // Start auto-syncing if user is logged in
  useAutoSync(true);

  // Theme state
  const [theme, setTheme] = useState<Themes>(() => {
    const saved = localStorage.getItem('luach-tahara-theme');
    switch (saved?.toLowerCase()) {
      case 'warm':
        return Themes.Warm;
      case 'dark':
        return Themes.Dark;
      case 'light':
        return Themes.Light;
      case 'tcheles':
        return Themes.Tcheles;
      default:
        return Themes.Warm;
    }
  });

  // Settings from IndexedDB
  const { settings } = useSettings();

  // Location
  const locationName = settings?.locationName || settings?.location?.name || 'Jerusalem';
  const location = useMemo(() => {
    return (
      Locations.find(l => l.Name === locationName) || Locations.find(l => l.Name === 'Jerusalem')!
    );
  }, [locationName]);

  // Today start mode
  const todayStartMode = 'sunset'; // Can be made configurable later

  // Current date
  const today = todayStartMode === 'sunset' ? Utils.nowAtLocation(location) : new jDate();
  const [currentJDate, setCurrentJDate] = useState(today);
  const [selectedJDate, setSelectedJDate] = useState(currentJDate);

  // Calendar view (jewish or secular)
  const [calendarView, setCalendarView] = useState<'jewish' | 'secular'>(() => {
    return (localStorage.getItem('luach-tahara-calendar-view') as 'jewish' | 'secular') || 'jewish';
  });

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEntryListOpen, setIsEntryListOpen] = useState(false);
  const [isKavuahListOpen, setIsKavuahListOpen] = useState(false);
  const [isFlaggedDatesListOpen, setIsFlaggedDatesListOpen] = useState(false);
  const [isUserEventsListOpen, setIsUserEventsListOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isJumpModalOpen, setIsJumpModalOpen] = useState(false);
  const [isDailyInfoOpen, setIsDailyInfoOpen] = useState(() => {
    // Check for window existence (in case of SSR) and width
    if (typeof window !== 'undefined') {
      return window.innerWidth > 1024;
    }
    return false;
  });

  // Jump Date State
  const [jumpGregDate, setJumpGregDate] = useState(new Date().toISOString().split('T')[0]);
  const [jumpJDay, setJumpJDay] = useState(currentJDate.Day);
  const [jumpJMonth, setJumpJMonth] = useState(currentJDate.Month);
  const [jumpJYear, setJumpJYear] = useState(currentJDate.Year);

  // Sync jump state when current date changes
  useEffect(() => {
    setJumpGregDate(currentJDate.getDate().toISOString().split('T')[0]);
    setJumpJDay(currentJDate.Day);
    setJumpJMonth(currentJDate.Month);
    setJumpJYear(currentJDate.Year);
  }, [currentJDate]);

  // Apply theme
  useEffect(() => {
    const themeName = Themes[theme].toLowerCase();
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('luach-tahara-theme', themeName);
  }, [theme]);

  // Apply RTL
  useEffect(() => {
    document.body.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  // Save calendar view preference
  useEffect(() => {
    localStorage.setItem('luach-tahara-calendar-view', calendarView);
  }, [calendarView]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for focused inputs/textareas/selects
      const activeElement = document.activeElement;
      if (
        activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName.toUpperCase())
      ) {
        return;
      }

      // Check for any open modals or overlays
      if (
        isSettingsOpen ||
        isEntryListOpen ||
        isKavuahListOpen ||
        isFlaggedDatesListOpen ||
        isUserEventsListOpen ||
        isAuthModalOpen ||
        isJumpModalOpen ||
        document.querySelector('.modal-overlay')
      ) {
        return;
      }

      let newDate: jDate | null = null;
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          newDate = selectedJDate.addDays(isRTL ? 1 : -1);
          break;
        case 'arrowright':
          newDate = selectedJDate.addDays(isRTL ? -1 : 1);
          break;
        case 'arrowup':
          newDate = selectedJDate.addDays(-7);
          break;
        case 'arrowdown':
          newDate = selectedJDate.addDays(7);
          break;
        case 't':
          handleGoToToday();
          return;
        default:
          return;
      }

      if (newDate) {
        e.preventDefault();
        setSelectedJDate(newDate);

        // Update current month if boundary is crossed
        if (
          newDate.Month !== currentJDate.Month ||
          newDate.Year !== currentJDate.Year ||
          (calendarView === 'secular' &&
            (newDate.getDate().getMonth() !== currentJDate.getDate().getMonth() ||
              newDate.getDate().getFullYear() !== currentJDate.getDate().getFullYear()))
        ) {
          setCurrentJDate(newDate);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedJDate,
    currentJDate,
    calendarView,
    isRTL,
    isSettingsOpen,
    isEntryListOpen,
    isKavuahListOpen,
    isFlaggedDatesListOpen,
    isUserEventsListOpen,
    isAuthModalOpen,
    isJumpModalOpen,
  ]);

  const handleGoToToday = () => {
    const today = todayStartMode === 'sunset' ? Utils.nowAtLocation(location) : new jDate();
    setCurrentJDate(today);
    setSelectedJDate(today);
  };

  const navigateMonth = (direction: number) => {
    if (calendarView === 'jewish') {
      setCurrentJDate(currentJDate.addMonths(direction));
    } else {
      const sDate = currentJDate.getDate();
      const newMonth = new Date(sDate.getFullYear(), sDate.getMonth() + direction, 1);
      setCurrentJDate(new jDate(newMonth));
    }
  };

  const navigateYear = (direction: number) => {
    if (calendarView === 'jewish') {
      setCurrentJDate(
        new jDate(currentJDate.Year + direction, currentJDate.Month, currentJDate.Day)
      );
    } else {
      const sDate = currentJDate.getDate();
      const newYear = new Date(sDate.getFullYear() + direction, sDate.getMonth(), 1);
      setCurrentJDate(new jDate(newYear));
    }
  };

  const handlePrevMonth = () => navigateMonth(-1);
  const handleNextMonth = () => navigateMonth(1);

  const handleDayClick = (date: jDate) => {
    setSelectedJDate(date);
    setIsDailyInfoOpen(true);
  };

  const handleJumpToGregorian = () => {
    const date = new Date(jumpGregDate);
    if (!isNaN(date.getTime())) {
      setCurrentJDate(new jDate(date));
      setIsJumpModalOpen(false);
    }
  };

  const handleJumpToJewish = () => {
    try {
      const date = new jDate(jumpJYear, jumpJMonth, jumpJDay);
      setCurrentJDate(date);
      setIsJumpModalOpen(false);
    } catch (e) {
      console.error('Invalid Jewish date jump', e);
    }
  };

  // Header Info Calculation
  const currentMonthName = useMemo(() => {
    if (calendarView === 'jewish') {
      const monthIndex = currentJDate.Month;
      return currentLang === 'he' ? JewishMonthsHeb[monthIndex] : JewishMonthsEng[monthIndex];
    } else {
      return currentJDate
        .getDate()
        .toLocaleString(currentLang === 'he' ? 'he-IL' : 'en-US', { month: 'long' });
    }
  }, [currentJDate, calendarView, currentLang]);

  const currentYearName = useMemo(() => {
    if (calendarView === 'jewish') {
      return currentJDate.Year.toString();
    } else {
      return currentJDate.getDate().getFullYear().toString();
    }
  }, [currentJDate, calendarView]);

  const secondaryDateRange = useMemo(() => {
    if (calendarView === 'jewish') {
      // Show Secular range for Jewish month
      const firstDay = currentJDate.addDays(-(currentJDate.Day - 1)).getDate();
      const lastDay = currentJDate
        .addDays(jDate.daysJMonth(currentJDate.Year, currentJDate.Month) - currentJDate.Day)
        .getDate();

      const locale = currentLang === 'he' ? 'he-IL' : 'en-US';
      const m1 = firstDay.toLocaleDateString(locale, { month: 'long' });
      const y1 = firstDay.getFullYear();
      const m2 = lastDay.toLocaleDateString(locale, { month: 'long' });
      const y2 = lastDay.getFullYear();

      if (y1 === y2) {
        if (m1 === m2) return `${m1} ${y1}`;
        return `${m1} - ${m2} ${y1}`;
      }
      return `${m1} ${y1} - ${m2} ${y2}`;
    } else {
      // Show Jewish range for Secular month
      const sDate = currentJDate.getDate();
      const firstSDate = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
      const lastSDate = new Date(sDate.getFullYear(), sDate.getMonth() + 1, 0);
      const firstJ = new jDate(firstSDate);
      const lastJ = new jDate(lastSDate);

      const m1 =
        currentLang === 'he' ? JewishMonthsHeb[firstJ.Month] : JewishMonthsEng[firstJ.Month];
      const y1 = firstJ.Year;
      const m2 = currentLang === 'he' ? JewishMonthsHeb[lastJ.Month] : JewishMonthsEng[lastJ.Month];
      const y2 = lastJ.Year;

      if (y1 === y2) {
        if (m1 === m2) return `${m1} ${y1}`;
        return `${m1} - ${m2} ${y1}`;
      }
      return `${m1} ${y1} - ${m2} ${y2}`;
    }
  }, [currentJDate, calendarView, currentLang]);

  const textInLanguage = {
    goToDate: currentLang === 'he' ? 'עבור לתאריך' : 'Go to Date',
    goToJewish: currentLang === 'he' ? 'עבור לתאריך עברי' : 'Go to Jewish Date',
    go: currentLang === 'he' ? 'עבור' : 'Go',
    gregDate: currentLang === 'he' ? 'תאריך לועזי' : 'Gregorian Date',
    jewDate: currentLang === 'he' ? 'תאריך עברי' : 'Jewish Date',
    day: currentLang === 'he' ? 'יום' : 'Day',
    month: currentLang === 'he' ? 'חודש' : 'Month',
    year: currentLang === 'he' ? 'שנה' : 'Year',
  };

  return (
    <div className="app-container">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        lang={currentLang}
        onLangChange={lang => i18n.changeLanguage(lang)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onEntriesClick={() => setIsEntryListOpen(true)}
        onKavuahsClick={() => setIsKavuahListOpen(true)}
        onFlaggedDatesClick={() => setIsFlaggedDatesListOpen(true)}
        onUserEventsClick={() => setIsUserEventsListOpen(true)}
        onLogin={() => setIsAuthModalOpen(true)}
        onLogout={async () => {
          try {
            if (window.confirm(currentLang === 'he' ? 'האם אתה בטוח שברצונך להתנתק? נתונים מקומיים יימחקו.' : 'Are you sure you want to log out? Local data will be cleared.')) {
                await signOut();
                await clearAllData();
                window.location.reload();
            }
          } catch (error) {
            console.error('Logout failed', error);
          }
        }}
        user={user}
        // New Props
        currentMonthName={currentMonthName}
        currentYearName={currentYearName}
        secondaryDateRange={secondaryDateRange}
        navigateMonth={navigateMonth}
        navigateYear={navigateYear}
        handleGoToToday={handleGoToToday}
        setIsJumpModalOpen={setIsJumpModalOpen}
        calendarView={calendarView}
        setCalendarView={setCalendarView}
        onDailyInfoClick={() => setIsDailyInfoOpen(true)}
      />

      <div className="main-layout">
        <div className="calendar-main">
          <Calendar
            currentJDate={currentJDate}
            selectedJDate={selectedJDate}
            calendarView={calendarView}
            onCalendarViewChange={setCalendarView}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onGoToToday={handleGoToToday}
            onDayClick={handleDayClick}
            location={location}
            lang={currentLang}
            isSettingsOpen={isSettingsOpen}
            onCloseSettings={() => setIsSettingsOpen(false)}
            isEntryListOpen={isEntryListOpen}
            onCloseEntryList={() => setIsEntryListOpen(false)}
            isKavuahListOpen={isKavuahListOpen}
            onCloseKavuahList={() => setIsKavuahListOpen(false)}
            isFlaggedDatesListOpen={isFlaggedDatesListOpen}
            onCloseFlaggedDatesList={() => setIsFlaggedDatesListOpen(false)}
            isUserEventsListOpen={isUserEventsListOpen}
            onCloseUserEventsList={() => setIsUserEventsListOpen(false)}
            isDailyInfoOpen={isDailyInfoOpen}
            onCloseDailyInfo={() => setIsDailyInfoOpen(false)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        </div>
      </div>

      <MobileFooter
        onTodayClick={handleGoToToday}
        onCalendarClick={() => {
          setIsJumpModalOpen(true);
        }}
        onEventsClick={() => {
          setIsEntryListOpen(true);
        }}
        onSettingsClick={() => {
          setIsSettingsOpen(true);
        }}
        lang={currentLang as 'en' | 'he'}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <JumpDateModal
        isOpen={isJumpModalOpen}
        onClose={() => setIsJumpModalOpen(false)}
        textInLanguage={textInLanguage}
        lang={currentLang as 'en' | 'he'}
        jumpGregDate={jumpGregDate}
        setJumpGregDate={setJumpGregDate}
        jumpJDay={jumpJDay}
        setJumpJDay={setJumpJDay}
        jumpJMonth={jumpJMonth}
        setJumpJMonth={setJumpJMonth}
        jumpJYear={jumpJYear}
        setJumpJYear={setJumpJYear}
        handleJumpToGregorian={handleJumpToGregorian}
        handleJumpToJewish={handleJumpToJewish}
      />
    </div>
  );
}

export default App;
