import React, { useMemo } from 'react';
import { jDate } from 'jcal-zmanim';
import { Modal } from '../Modal';
import { ProblemOnah } from '../../lib/chashavshavon/ProblemOnah';
import { NightDay } from '../../lib/chashavshavon/Onah';
import { AlertTriangle, Moon, Sun } from 'lucide-react';

interface FlaggedDatesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'he';
  flaggedOnahs: ProblemOnah[];
}

export const FlaggedDatesSidebar: React.FC<FlaggedDatesSidebarProps> = ({
  isOpen,
  onClose,
  lang,
  flaggedOnahs,
}) => {
  // Sort flagged dates chronologically and filter to show only future dates (or all?)
  // For now, let's show all upcoming from today onwards.
  const relevantFlaggedDates = useMemo(() => {
    if (!flaggedOnahs) return [];

    // Sort all
    const sorted = [...flaggedOnahs].sort((a, b) => {
      const diff = a.jdate.Abs - b.jdate.Abs;
      if (diff !== 0) return diff;
      return a.nightDay - b.nightDay;
    });

    // Determine "today" for filtering past dates if desired
    // For now, we show everything passed in, typically the generator generates for a range.
    // If the generator generates for the visible calendar, we might want to filter?
    // Usually the user wants to see "Upcoming" flagged dates.

    // Let's assume the passed list is what we want to show.
    // But we might want to filter out ancient history if the generator provides it.
    const todayAbs = new jDate().Abs;
    return sorted.filter(po => po.jdate.Abs >= todayAbs - 30); // Show last 30 days and future
  }, [flaggedOnahs]);

  if (!isOpen) return null;

  const getOnahLabel = (onah: NightDay) => {
    if (onah === NightDay.Night) return lang === 'he' ? 'לילה' : 'Night';
    return lang === 'he' ? 'יום' : 'Day';
  };

  const getOnahIcon = (onah: NightDay) => {
    if (onah === NightDay.Night) return <Moon size={16} className="text-indigo-400" />;
    return <Sun size={16} className="text-orange-400" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'he' ? 'זמני פרישה' : 'Flagged Dates'}
      maxWidth="600px"
      height="80vh"
    >
      <div className="flex flex-col gap-3">
        {relevantFlaggedDates.length === 0 && (
          <div className="text-center opacity-70 p-8">
            {lang === 'he' ? 'אין זמני פרישה קרובים' : 'No upcoming flagged dates.'}
          </div>
        )}

        {relevantFlaggedDates.map((po, index) => {
          return (
            <div
              key={`${po.jdate.Abs}-${po.nightDay}-${index}`}
              className="bg-glass-overlay p-4 rounded-xl flex items-start gap-4 hover:bg-glass-hover transition-colors"
            >
              <div className="flex-shrink-0 mt-1 text-accent-amber">
                <AlertTriangle size={20} />
              </div>

              <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">
                    {lang === 'he' ? po.jdate.toStringHeb() : po.jdate.toString()}
                  </span>
                  <span className="text-xs opacity-60 bg-glass-surface px-2 py-0.5 rounded-full">
                    {lang === 'he' ? getOnahLabel(po.nightDay) : getOnahLabel(po.nightDay)}
                    <span className="inline-block mx-1 transform translate-y-0.5">
                      {getOnahIcon(po.nightDay)}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  {po.flagsList.map((flag, i) => (
                    <div key={i} className="text-sm opacity-90 flex items-start gap-2">
                      <span className="text-accent-amber opacity-60">•</span>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
