// Simplified Mobile Footer for luach-tahara
import { Home, Calendar, List, Settings } from 'lucide-react';

interface MobileFooterProps {
  onTodayClick: () => void;
  onCalendarClick: () => void;
  onEventsClick: () => void;
  onSettingsClick: () => void;
  lang: 'en' | 'he';
}

export function MobileFooter({
  onTodayClick,
  onCalendarClick,
  onEventsClick,
  onSettingsClick,
  lang,
}: MobileFooterProps) {
  return (
    <footer className="mobile-footer glass-panel border-t">
      <div className="flex items-center justify-around w-full p-2 px-4 h-full">
        <button
          onClick={onTodayClick}
          className="p-2 btn-warm rounded-xl flex flex-col items-center gap-1"
          title={lang === 'he' ? 'היום' : 'Today'}
        >
          <Home size={20} />
          <span className="text-xs">{lang === 'he' ? 'היום' : 'Today'}</span>
        </button>

        <button
          onClick={onCalendarClick}
          className="p-2 btn-warm rounded-xl flex flex-col items-center gap-1"
          title={lang === 'he' ? 'לוח' : 'Calendar'}
        >
          <Calendar size={20} />
          <span className="text-xs">{lang === 'he' ? 'לוח' : 'Calendar'}</span>
        </button>

        <button
          onClick={onEventsClick}
          className="p-2 btn-warm rounded-xl flex flex-col items-center gap-1"
          title={lang === 'he' ? 'רשימה' : 'Entries'}
        >
          <List size={20} />
          <span className="text-xs">{lang === 'he' ? 'רשימה' : 'Entries'}</span>
        </button>

        <button
          onClick={onSettingsClick}
          className="p-2 btn-warm rounded-xl flex flex-col items-center gap-1"
          title={lang === 'he' ? 'הגדרות' : 'Settings'}
        >
          <Settings size={20} />
          <span className="text-xs">{lang === 'he' ? 'הגדרות' : 'Settings'}</span>
        </button>
      </div>
    </footer>
  );
}
