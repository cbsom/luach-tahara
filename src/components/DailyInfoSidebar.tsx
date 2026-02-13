import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  HandHelping,
  Plus,
  Trash,
  X,
  AlertTriangle,
  Droplet,
  Heart,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Dafyomi, Utils, jDate, Location } from 'jcal-zmanim';
import { UserEvent } from '../types-luach-web';
import { Entry, TaharaEvent } from '../types';
import { ProblemOnah } from '../lib/chashavshavon/ProblemOnah';
import {
  formatTime,
  getAnniversaryNumber,
  getRelativeDescription,
  injectLineBreak,
} from '../utils';

interface DailyInfoSidebarProps {
  lang: 'en' | 'he';
  textInLanguage?: Record<string, string>; // Optional now since we might remove it
  selectedJDate: jDate;
  selectedEvents: UserEvent[];
  selectedZmanim: any[];
  selectedNotes: { dayNotes: string[]; tefillahNotes: string[] };
  location: Location;

  // Niddah Specific
  entries: Entry[];
  taharaEvents: TaharaEvent[];
  flaggedOnahs: ProblemOnah[];

  handleEditEvent: (item: any, date: jDate) => void;
  deleteEvent: (id: string, type: 'user' | 'entry' | 'tahara') => void;
  handleAddNewEventForDate: (e: React.MouseEvent, date: jDate) => void;

  isOpen: boolean;
  onClose: () => void;
  isDesktopHidden?: boolean;
  onToggleDesktopMode?: () => void;
}

export const DailyInfoSidebar: React.FC<DailyInfoSidebarProps> = ({
  lang,
  // textInLanguage, // not used
  selectedJDate,
  selectedEvents,
  selectedZmanim,
  selectedNotes,
  location,
  entries,
  taharaEvents,
  flaggedOnahs,
  handleEditEvent,
  deleteEvent,
  handleAddNewEventForDate,
  isOpen,
  onClose,
  isDesktopHidden,
  onToggleDesktopMode,
}) => {
  const prakim = selectedJDate.getPirkeiAvos(location.Israel);
  const scrollRef = useRef<HTMLElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      setIsAtBottom(atBottom);
    }
  };

  useEffect(() => {
    setTimeout(checkScroll, 100);
  }, [isOpen, selectedJDate]);

  const t = (en: string, he: string) => (lang === 'he' ? he : en);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside
        className={`sidebar daily-info-sidebar glass-panel scroll-affordance ${
          isAtBottom ? 'at-bottom' : 'has-more'
        } ${isOpen ? 'sidebar-mobile-open' : ''} ${isDesktopHidden ? 'desktop-hidden' : ''}`}
      >
        <div className="p-6 flex flex-col gap-4 overflow-hidden h-full">
          {/* Header with selected date */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-row justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accent-amber/20 text-accent-amber">
                  <Calendar size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black leading-tight">
                    {injectLineBreak(
                      lang === 'he'
                        ? selectedJDate.toStringHeb(false)
                        : selectedJDate.toString(false, false),
                      ','
                    )}
                  </h2>
                  <p className="text-text-secondary text-xs font-semibold opacity-70">
                    {selectedJDate.getDate().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <button
                className="close-btn sidebar-close-btn p-2 rounded-full hover:bg-white/10"
                onClick={() => {
                  if (window.innerWidth > 1024 && !isDesktopHidden) {
                    onToggleDesktopMode?.();
                  } else {
                    onClose();
                  }
                }}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-1 flex items-center gap-1.5 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-md">
                {getRelativeDescription(selectedJDate, lang)}
              </p>
              {selectedJDate.isYomTov(location.Israel) && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent-rose bg-accent-rose/10 px-2 py-0.5 rounded-md">
                  {lang === 'he' ? 'יום טוב' : 'Yom Tov'}
                </p>
              )}
            </div>
          </div>

          <div className="divider"></div>

          {/* Add Event Button */}
          <button
            onClick={e => handleAddNewEventForDate(e, selectedJDate)}
            className="group relative w-full overflow-hidden rounded-xl p-[1px] shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] mb-3"
          >
            <div className="bg-gradient-to-r from-accent-amber via-accent-coral to-accent-rose opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-row h-full items-center justify-center gap-2 rounded-xl bg-bg-primary/90 px-6 py-4 text-sm font-bold text-text-primary backdrop-blur-xl transition-all group-hover:bg-bg-primary/80 cursor-pointer">
              <Plus size={16} className="text-accent-amber" />
              <span>{lang === 'he' ? 'הוסף ראייה' : 'Add Entry'}</span>
            </div>
          </button>

          <section
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex-grow overflow-y-auto pr-1 flex flex-col gap-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* Empty State */}
            {entries.length === 0 &&
              taharaEvents.length === 0 &&
              flaggedOnahs.length === 0 &&
              selectedEvents.length === 0 &&
              selectedNotes.dayNotes.length === 0 &&
              selectedNotes.tefillahNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 opacity-40 animate-slide-up delay-100">
                  <BookOpen size={40} className="mb-2" />
                  <p className="text-sm font-medium">
                    {t('No events for this day', 'אין אירועים ליום זה')}
                  </p>
                </div>
              )}

            {/* DAILY NOTES (Halachic specific info from jcal-zmanim) */}
            {(selectedNotes.dayNotes.length > 0 || selectedNotes.tefillahNotes.length > 0) && (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {selectedNotes.dayNotes.map((note: string, idx: number) => (
                    <span
                      key={idx}
                      className="font-bold text-accent-rose border border-accent-rose/10 leading-none shadow-sm text-[11px]"
                      style={{
                        backgroundColor: 'rgba(252, 165, 165, 0.15)',
                        padding: '5px 10px',
                        borderRadius: '100px',
                      }}
                    >
                      {note}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNotes.tefillahNotes.map((note: string, idx: number) => (
                    <span
                      key={idx}
                      className="font-bold text-accent-amber border border-accent-amber/10 leading-none shadow-sm text-[11px]"
                      style={{
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
                        padding: '5px 10px',
                        borderRadius: '100px',
                      }}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ENTRIES */}
            {entries.length > 0 && (
              <div className="flex flex-col gap-2 animate-slide-up delay-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-1">
                  {t('Entries', 'ראיות')}
                </h3>
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-accent-coral/10 border border-accent-coral/20 flex flex-col gap-2 group hover:bg-accent-coral/20 transition-all cursor-pointer glass-card"
                    onClick={() => handleEditEvent(entry, selectedJDate)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Heart size={16} className="text-accent-coral" />
                        <span className="font-bold text-sm">
                          {t('Period Entry', 'ראייה')} (
                          {entry.onah === -1 ? t('Night', 'לילה') : t('Day', 'יום')})
                        </span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteEvent(entry.id, 'entry');
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded transition-opacity"
                      >
                        <Trash size={14} className="text-accent-coral" />
                      </button>
                    </div>
                    {entry.haflaga && (
                      <span className="text-xs opacity-70">
                        {t('Haflaga', 'הפלגה')}: {entry.haflaga}
                      </span>
                    )}
                    {entry.notes && (
                      <p className="text-xs italic opacity-60 truncate">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAHARA EVENTS */}
            {taharaEvents.length > 0 && (
              <div className="flex flex-col gap-2 animate-slide-up delay-200">
                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-1">
                  {t('Tahara Events', 'אירועי טהרה')}
                </h3>
                {taharaEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex flex-col gap-1 group hover:bg-accent-teal/20 transition-all cursor-pointer glass-card"
                    onClick={() => handleEditEvent(event, selectedJDate)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-accent-teal/20">
                          <Droplet size={14} className="text-accent-teal" />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wide">
                          {event.type}
                        </span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteEvent(event.id, 'tahara');
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded transition-opacity"
                      >
                        <Trash size={14} className="text-accent-teal" />
                      </button>
                    </div>
                    {event.notes && (
                      <p className="text-xs italic opacity-60 truncate">{event.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* FLAGGED DATES (Zmanei Shemira) */}
            {flaggedOnahs.length > 0 && (
              <div className="flex flex-col gap-2 animate-slide-up delay-300">
                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-1">
                  {t('Flagged Onahs', 'זמני פרישה')}
                </h3>
                {flaggedOnahs.map((po, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gradient-amber border border-accent-amber/20 flex flex-col gap-2 glass-card"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-accent-amber/20">
                        <AlertTriangle size={14} className="text-accent-amber" />
                      </div>
                      <span className="font-bold text-sm">
                        {po.nightDay === -1
                          ? t('Night Onah', 'עונת הלילה')
                          : t('Day Onah', 'עונת היום')}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 pl-7">
                      {po.flagsList.map((flag: string, fidx: number) => (
                        <span key={fidx} className="text-xs opacity-90 leading-tight">
                          • {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* USER EVENTS */}
            {selectedEvents.length > 0 && (
              <div className="flex flex-col gap-2 animate-slide-up delay-300">
                <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-1">
                  {t('Occasions', 'אירועים')}
                </h3>
                {selectedEvents.map(event => {
                  const anniv = getAnniversaryNumber(event, selectedJDate);
                  return (
                    <div
                      key={event.id}
                      className="relative p-3 rounded-xl border border-glass-border group hover:brightness-105 transition-all shadow-md cursor-pointer"
                      style={{
                        backgroundColor: event.backColor || 'var(--accent-amber)',
                        color: event.textColor || '#ffffff',
                      }}
                      onClick={() => handleEditEvent(event, selectedJDate)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold flex gap-2 items-center flex-grow text-sm">
                          {event.name}
                          {anniv > 0 && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider opacity-80"
                              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            >
                              {anniv}
                            </span>
                          )}
                        </h4>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteEvent(event.id, 'user');
                          }}
                          className="p-1 hover:bg-black/10 rounded-md transition-all"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PARASHA & DAF YOMI */}
            <div className="flex flex-col gap-2 mt-4 animate-slide-up delay-400">
              <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-1">
                {t('Torah Study', 'לימוד')}
              </h3>
              {Dafyomi.toString(selectedJDate) && (
                <div className="p-3 rounded-xl bg-accent-gold/5 border border-accent-gold/20 flex items-center gap-3 glass-card">
                  <BookOpen size={18} className="text-accent-gold flex-shrink-0" />
                  <span className="font-bold text-sm">
                    {lang === 'he'
                      ? Dafyomi.toStringHeb(selectedJDate)
                      : Dafyomi.toString(selectedJDate)}
                  </span>
                </div>
              )}

              {prakim.length > 0 && (
                <div className="p-3 rounded-xl bg-accent-coral/5 border border-accent-coral/20 flex items-center gap-3 glass-card">
                  <BookOpen size={18} className="text-accent-coral flex-shrink-0" />
                  <span className="font-bold text-sm">
                    {lang === 'en'
                      ? 'Pirkei Avos - ' +
                        prakim.map((s: number) => `Perek ${Utils.toJewishNumber(s)}`).join(' & ')
                      : 'פרקי אבות - ' +
                        prakim.map((s: number) => `פרק ${Utils.toJewishNumber(s)}`).join(' ו')}
                  </span>
                </div>
              )}

              {(() => {
                const candles = selectedJDate.getCandleLighting(location, true);
                if (!candles) return null;
                return (
                  <div className="p-3 rounded-xl bg-accent-amber/10 border border-accent-amber/30 flex items-center gap-3 glass-card">
                    <HandHelping size={20} className="text-accent-amber flex-shrink-0" />
                    <span className="font-black text-sm">
                      {t('Candle Lighting', 'הדלקת נרות')}: {formatTime(candles)}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* ZMANIM */}
            <div className="mt-4 flex flex-col gap-2 animate-slide-up delay-500">
              <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50 px-1 flex justify-between items-center">
                <span>{t('Zmanim', 'זמנים')}</span>
                <span className="flex items-center gap-1 opacity-70">
                  <MapPin size={10} />
                  {location.NameHebrew ?? location.Name}
                </span>
              </h3>
              {selectedZmanim.map((zman: any, idx: number) => {
                const isSolarEvent = [5, 15].includes(Number(zman.zmanType.id));

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-1 ${
                      isSolarEvent ? 'solar-zman-highlight' : 'bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-bold text-text-secondary">
                      {lang === 'he' ? zman.zmanType.heb : zman.zmanType.eng}
                    </span>
                    <span className="text-sm font-bold font-mono text-accent-amber">
                      {formatTime(zman.time).toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};
