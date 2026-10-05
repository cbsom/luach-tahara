import React, { useState } from 'react';
import { jDate } from 'jcal-zmanim';
import { Modal } from './Modal';
import { NightDay } from '../types';
import type { EntryData } from '../services/db/entryService';
import './EntryForm.css'; // Reusing onah-selector styles

interface EndFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: EntryData, date: jDate, endOnah: NightDay) => void;
  entry?: EntryData;
  date?: jDate;
  lang: 'en' | 'he';
}

export function EndFlowModal({ isOpen, onClose, onSave, entry, date, lang }: EndFlowModalProps) {
  const [endOnah, setEndOnah] = useState<NightDay>(entry?.onah ?? NightDay.Night);

  if (!isOpen || !entry || !date) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'he' ? 'סיום ראייה' : 'End Flow'}
      maxWidth="350px"
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {lang === 'he' ? 'ביטול' : 'Cancel'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onSave(entry, date, endOnah);
              onClose();
            }}
          >
            {lang === 'he' ? 'שמור' : 'Save'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-2">
        <p className="text-base text-center">
          {lang === 'he'
            ? `הגדרת סיום הראייה לתאריך ${date.toStringHeb()}`
            : `Setting flow end to ${date.toString()}`}
        </p>
        
        <div>
          <h3 className="section-title text-center mb-4">
            {lang === 'he' ? 'עונה - יום או לילה?' : 'Onah - Day or Night?'}
          </h3>
          <div className="onah-selector">
            <button
              type="button"
              className={`onah-button ${endOnah === NightDay.Night ? 'active' : ''}`}
              onClick={() => setEndOnah(NightDay.Night)}
            >
              {lang === 'he' ? 'לילה' : 'Night'}
            </button>
            <button
              type="button"
              className={`onah-button ${endOnah === NightDay.Day ? 'active' : ''}`}
              onClick={() => setEndOnah(NightDay.Day)}
            >
              {lang === 'he' ? 'יום' : 'Day'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
