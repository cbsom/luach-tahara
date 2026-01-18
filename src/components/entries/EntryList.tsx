import React, { useMemo } from 'react';
import { jDate } from 'jcal-zmanim';
import { Modal } from '../Modal';
import type { Entry as EntryData } from '../../types';
import { Edit2, Trash2, Sun, Moon } from 'lucide-react';
import { NightDay } from '../../types';

interface EntryListProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'he';
  onEdit: (entry: EntryData) => void;
  entries: any[]; // Todo: Type strictly EntryRecord[]
  onRemove: (id: string) => Promise<void>;
}

export const EntryList: React.FC<EntryListProps> = ({
  isOpen,
  onClose,
  lang,
  onEdit,
  entries,
  onRemove,
}) => {
  const loading = false; // Managed by parent

  // Sort entries descending with safety check
  const sortedEntries = useMemo(() => {
    if (!entries || !Array.isArray(entries)) return [];
    return [...entries].sort((a, b) => {
      // Handle missing jewishDate (or checks for 'date' if using Class)
      const jd_a = a.jewishDate || a.date;
      const jd_b = b.jewishDate || b.date;

      if (!jd_a || !jd_b) {
        console.warn('EntryList: Missing date for entry', { a, b });
        return 0;
      }

      // Handle jDate vs JewishDate interface
      const abs_a = jd_a.Abs || new jDate(jd_a.year, jd_a.month, jd_a.day).Abs;
      const abs_b = jd_b.Abs || new jDate(jd_b.year, jd_b.month, jd_b.day).Abs;

      return abs_b - abs_a;
    });
  }, [entries]);

  if (!isOpen) return null;

  const getOnahLabel = (onah: NightDay) => {
    if (onah === NightDay.Night) return lang === 'he' ? 'לילה' : 'Night';
    return lang === 'he' ? 'יום' : 'Day';
  };

  const getOnahIcon = (onah: NightDay) => {
    if (onah === NightDay.Night) return <Moon size={16} className="text-indigo-400" />;
    return <Sun size={16} className="text-orange-400" />;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(lang === 'he' ? 'האם למחוק ראייה זו?' : 'Delete this entry?')) {
      await onRemove(id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'he' ? 'רשימת ראיות' : 'Entry List'}
      maxWidth="700px"
      height="80vh"
    >
      <div className="flex flex-col gap-3">
        {loading && <div className="text-center p-4">Loading...</div>}

        {!loading && sortedEntries.length === 0 && (
          <div className="text-center opacity-70 p-8">
            {lang === 'he' ? 'אין ראיות' : 'No entries found.'}
          </div>
        )}

        {sortedEntries.map(entry => {
          const displayDate = entry.jewishDate || entry.date;
          if (!displayDate) return null;

          return (
            <div
              key={entry.id}
              className="bg-glass-overlay p-4 rounded-xl flex items-center justify-between group hover:bg-glass-hover transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Date Box */}
                <div className="flex flex-col items-center bg-glass-surface rounded-lg p-2 min-w-[60px]">
                  <span className="font-bold text-lg">{displayDate.day || displayDate.Day}</span>
                  <span className="text-xs opacity-70">
                    {displayDate.month || displayDate.Month} /{' '}
                    {displayDate.year || displayDate.Year}
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-medium">
                    {getOnahIcon(entry.onah)}
                    <span>{getOnahLabel(entry.onah)}</span>
                  </div>
                  {entry.haflaga !== undefined && entry.haflaga > 0 && (
                    <div className="text-sm opacity-70 flex items-center gap-1">
                      <span className="text-accent-coral">Haflaga: {entry.haflaga}</span>
                    </div>
                  )}
                  {entry.comments && (
                    <div className="text-xs opacity-60 italic mt-1 max-w-[200px] truncate">
                      {entry.comments}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    onEdit({
                      id: entry.id,
                      date: displayDate, // Use found date property
                      onah: entry.onah,
                      haflaga: entry.haflaga,
                      ignoreForFlaggedDates: entry.ignoreForFlaggedDates,
                      ignoreForKavuah: entry.ignoreForKavuah,
                      notes: entry.comments,
                      createdAt: entry.createdAt || 0,
                      updatedAt: entry.updatedAt || 0,
                    })
                  }
                  className="p-2 rounded-full hover:bg-glass-surface text-accent-cyan"
                  title={lang === 'he' ? 'ערוך' : 'Edit'}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 rounded-full hover:bg-glass-surface text-red-400"
                  title={lang === 'he' ? 'מחק' : 'Delete'}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
