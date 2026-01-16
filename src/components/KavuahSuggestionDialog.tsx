import React from 'react';
import { Modal } from './Modal';
import { type KavuahSuggestion } from '../lib/chashavshavon/Kavuah';
import { Droplet } from 'lucide-react';

interface KavuahSuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: KavuahSuggestion[];
  onAccept: (suggestion: KavuahSuggestion) => void;
  onIgnore: (suggestion: KavuahSuggestion) => void;
  lang: 'en' | 'he';
}

export const KavuahSuggestionDialog: React.FC<KavuahSuggestionDialogProps> = ({
  isOpen,
  onClose,
  suggestions,
  onAccept,
  onIgnore,
  lang,
}) => {
  if (!suggestions.length) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'he' ? 'וסתות חדשות נמצאו' : 'New Kavuahs Detected'}
      subtitle={
        lang === 'he'
          ? 'המערכת זיהתה דפוסים חדשים בנתונים שלך'
          : 'The system detected new patterns in your data'
      }
    >
      <div className="flex flex-col gap-6">
        {suggestions.map((s, idx) => (
          <div key={idx} className="bg-glass-overlay p-4 rounded-xl border border-glass-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-accent-amber">
                <Droplet size={20} />
              </div>
              <div className="font-bold text-lg">
                {lang === 'he' ? s.kavuah.toStringHebrew() : s.kavuah.toString()}
              </div>
            </div>
            <div className="text-sm opacity-80 mb-4">
              {lang === 'he' ? 'מבוסס על הראיות ב:' : 'Based on entries on:'}
              <ul className="list-disc list-inside mt-1">
                {s.entries.map(e => (
                  <li key={e.id}>{e.date.toString()}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-glass-surface hover:bg-glass-hover text-sm"
                onClick={() => onIgnore(s)}
              >
                {lang === 'he' ? 'התעלם' : 'Ignore'}
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-accent-amber text-white shadow-lg hover:shadow-xl hover:brightness-110 transition-all text-sm font-bold"
                onClick={() => onAccept(s)}
              >
                {lang === 'he' ? 'קבע וסת' : 'Set Kavuah'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
