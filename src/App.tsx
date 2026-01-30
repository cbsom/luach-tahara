import { useState, useMemo, useEffect } from 'react';
import { jDate, Utils, Locations, type Location } from 'jcal-zmanim';
import { Header } from './components/Header';
import { Calendar } from './components/CalendarWrapper';
import { MobileFooter } from './components/MobileFooter';
import { useTranslation, useCurrentLanguage, useIsRTL } from './i18n/hooks';
import { useSettings } from './services/db/hooks';
import { Themes } from './types-luach-web';
import { useAuth } from './services/firebase/hooks';
import { AuthModal } from './components/auth/AuthModal';

function App() {
  const { i18n } = useTranslation();
  const currentLang = useCurrentLanguage();
  const isRTL = useIsRTL();
  const { user, signOut } = useAuth();

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
  const locationName = settings?.location.name || 'Jerusalem';
  const location = useMemo(() => {
    if (settings?.location) {
      // Map user settings location to jcal-zmanim Location object
      return {
        Name: settings.location.name,
        Latitude: settings.location.latitude,
        Longitude: settings.location.longitude,
        UTCOffset: settings.location.utcOffset,
        Elevation: settings.location.elevation || 0,
        Israel: settings.location.israel || false,
      } as Location;
    }
    return (
      Locations.find(l => l.Name === locationName) || Locations.find(l => l.Name === 'Jerusalem')!
    );
  }, [locationName, settings]);

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const handleGoToToday = () => {
    const today = todayStartMode === 'sunset' ? Utils.nowAtLocation(location) : new jDate();
    setCurrentJDate(today);
    setSelectedJDate(today);
  };

  const handlePrevMonth = () => {
    if (calendarView === 'jewish') {
      setCurrentJDate(currentJDate.addMonths(-1));
    } else {
      const sDate = currentJDate.getDate();
      const prevMonth = new Date(sDate.getFullYear(), sDate.getMonth() - 1, 1);
      setCurrentJDate(new jDate(prevMonth));
    }
  };

  const handleNextMonth = () => {
    if (calendarView === 'jewish') {
      setCurrentJDate(currentJDate.addMonths(1));
    } else {
      const sDate = currentJDate.getDate();
      const nextMonth = new Date(sDate.getFullYear(), sDate.getMonth() + 1, 1);
      setCurrentJDate(new jDate(nextMonth));
    }
  };

  const handleDayClick = (date: jDate) => {
    setSelectedJDate(date);
    // TODO: Open day details sidebar
  };

  return (
    <div className="app-container">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        lang={currentLang}
        onLangChange={lang => i18n.changeLanguage(lang)}
        onSettingsClick={() => {
          setIsSettingsOpen(true);
        }}
        onEntriesClick={() => setIsEntryListOpen(true)}
        onKavuahsClick={() => setIsKavuahListOpen(true)}
        onFlaggedDatesClick={() => setIsFlaggedDatesListOpen(true)}
        onLogin={() => setIsAuthModalOpen(true)}
        onLogout={async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Logout failed', error);
          }
        }}
        user={user}
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
          />
        </div>
      </div>

      <MobileFooter
        onTodayClick={handleGoToToday}
        onCalendarClick={() => {
          // TODO: Open calendar jump modal
          console.log('Calendar clicked');
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
    </div>
  );
}

export default App;
