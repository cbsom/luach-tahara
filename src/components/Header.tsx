import { Menu, List, Repeat, AlertTriangle } from 'lucide-react';
import { getThemeIcon, cycleTheme } from '../utils.tsx';
import { Themes } from '../types-luach-web';
import type { User } from 'firebase/auth';

interface HeaderProps {
  theme: Themes;
  onThemeChange: (theme: Themes) => void;
  lang: string;
  onLangChange: (lang: 'en' | 'he') => void;
  onSettingsClick: () => void;
  onEntriesClick: () => void;
  onKavuahsClick: () => void;
  onFlaggedDatesClick: () => void;
  onLogin: () => void;
  onLogout: () => void;
  user: User | null;
}

export function Header({
  theme,
  onThemeChange,
  lang,
  onSettingsClick,
  onEntriesClick,
  onKavuahsClick,
  onFlaggedDatesClick,
  user,
}: HeaderProps) {
  return (
    <header className="glass-panel p-4 px-6 flex items-center justify-between main-header">
      <div className="flex items-center gap-4">
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
          <div className="p-1 bg-accent-amber/10 rounded-xl overflow-hidden shadow-inner">
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
          <h1 className="text-xl font-black tracking-tight">
            {lang === 'he' ? 'לוח טהרה' : 'Luach Tahara'}
          </h1>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2 mr-auto ml-4">
        <button
          onClick={onEntriesClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-glass-hover transition-colors text-sm font-medium opacity-80 hover:opacity-100"
          title={lang === 'he' ? 'ראיות' : 'Entries'}
        >
          <List size={18} />
          <span>{lang === 'he' ? 'ראיות' : 'Entries'}</span>
        </button>
        <button
          onClick={onFlaggedDatesClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-glass-hover transition-colors text-sm font-medium opacity-80 hover:opacity-100"
          title={lang === 'he' ? 'זמני פרישה' : 'Flagged Dates'}
        >
          <AlertTriangle size={18} />
          <span>{lang === 'he' ? 'התראות' : 'Alerts'}</span>
        </button>
        <button
          onClick={onKavuahsClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-glass-hover transition-colors text-sm font-medium opacity-80 hover:opacity-100"
          title={lang === 'he' ? 'וסתות' : 'Kavuahs'}
        >
          <Repeat size={18} />
          <span>{lang === 'he' ? 'וסתות' : 'Kavuahs'}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => cycleTheme(theme, onThemeChange)}
          className="no-border no-background cursor-pointer"
          style={{
            paddingBottom: '3px',
          }}
          title={lang === 'he' ? 'ערכת צבעים' : 'Color Theme'}
        >
          {getThemeIcon(theme)}
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary hidden sm:inline">
              {user.displayName || user.email}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
