// Entry Form Component - For creating and editing entries (ראיות)
import { useState, useEffect } from 'react';
import { jDate } from 'jcal-zmanim';
import { X } from 'lucide-react';
import { NightDay } from '@/types';
import type { Entry, JewishDate } from '@/types';
import { toJDate, fromJDate } from '@/lib/jcal';
import { nanoid } from 'nanoid';
import './EntryForm.css';

interface EntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Entry) => Promise<void>;
  onDelete?: (entry: Entry) => Promise<void>;
  initialDate?: jDate;
  existingEntry?: Entry;
  previousEntry?: Entry; // For haflaga calculation
  lang: 'en' | 'he';
  location: any; // Location for sunrise/sunset
}

export function EntryForm({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  existingEntry,
  previousEntry,
  lang,
  location,
}: EntryFormProps) {
  const [date, setDate] = useState<JewishDate>(
    existingEntry?.date || (initialDate ? fromJDate(initialDate) : fromJDate(new jDate()))
  );
  const [onah, setOnah] = useState<NightDay>(existingEntry?.onah || NightDay.Night);
  const [comments, setComments] = useState(existingEntry?.notes || '');
  const [ignoreForFlaggedDates, setIgnoreForFlaggedDates] = useState(
    existingEntry?.ignoreForFlaggedDates || false
  );
  const [ignoreForKavuah, setIgnoreForKavuah] = useState(existingEntry?.ignoreForKavuah || false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(
    existingEntry ? existingEntry.ignoreForFlaggedDates || existingEntry.ignoreForKavuah : false
  );
  const [enableHefsekReminder, setEnableHefsekReminder] = useState(
    !!existingEntry?.hefsekTaharaReminder || !existingEntry
  );
  const [hefsekDaysAfter, setHefsekDaysAfter] = useState(
    existingEntry?.hefsekTaharaReminder?.daysAfter || 5
  );
  const [hefsekTimeOfDay, setHefsekTimeOfDay] = useState(
    existingEntry?.hefsekTaharaReminder?.timeOfDay || '18:00'
  );

  // Reset form when modal opens/closes or entry changes
  useEffect(() => {
    if (isOpen) {
      if (existingEntry) {
        let validDate = existingEntry.date;
        try {
          const jd = toJDate(existingEntry.date);
          if (!jd || !jd.Year || isNaN(jd.Year)) throw new Error('Invalid date');
        } catch (e) {
          console.warn('EntryForm received invalid date, falling back to today');
          validDate = fromJDate(new jDate());
        }
        setDate(validDate);
        setOnah(existingEntry.onah);
        setComments(existingEntry.notes || '');
        setIgnoreForFlaggedDates(existingEntry.ignoreForFlaggedDates);
        setIgnoreForKavuah(existingEntry.ignoreForKavuah);
        setShowAdvancedOptions(
          existingEntry.ignoreForFlaggedDates || existingEntry.ignoreForKavuah
        );
        setEnableHefsekReminder(!!existingEntry.hefsekTaharaReminder);
        setHefsekDaysAfter(existingEntry.hefsekTaharaReminder?.daysAfter || 5);
        setHefsekTimeOfDay(existingEntry.hefsekTaharaReminder?.timeOfDay || '18:00');
      } else if (initialDate) {
        setDate(fromJDate(initialDate));
        setOnah(NightDay.Night);
        setComments('');
        setIgnoreForFlaggedDates(false);
        setIgnoreForKavuah(false);
        setShowAdvancedOptions(false);
        setEnableHefsekReminder(true);
        setHefsekDaysAfter(5);
        setHefsekTimeOfDay('18:00');
      }
    }
  }, [isOpen, existingEntry, initialDate]);

  // Calculate haflaga automatically
  const calculateHaflaga = (): number | undefined => {
    if (!previousEntry) return undefined;

    // This will be implemented using Onah.diffOnahs
    // For now, return undefined
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const entry: Entry = {
      id: existingEntry?.id || nanoid(),
      date,
      onah,
      haflaga: calculateHaflaga(),
      ignoreForFlaggedDates,
      ignoreForKavuah,
      notes: comments.trim() || undefined,
      hefsekTaharaReminder: enableHefsekReminder
        ? {
            daysAfter: hefsekDaysAfter,
            timeOfDay: hefsekTimeOfDay,
          }
        : undefined,
      createdAt: existingEntry?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await onSave(entry);
    onClose();
  };

  const handleDelete = async () => {
    if (!existingEntry || !onDelete) return;

    const confirmMsg =
      lang === 'he'
        ? 'האם אתה בטוח שברצונך להסיר לחלוטין את הראייה הזו?'
        : 'Are you sure that you want to completely remove this Entry?';

    if (confirm(confirmMsg)) {
      await onDelete(existingEntry);
      onClose();
    }
  };

  const handleDateChange = (field: 'year' | 'month' | 'day', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    setDate({
      ...date,
      [field]: numValue,
    });
  };

  if (!isOpen) return null;

  /* Safe Sunrise/Sunset Calculation */
  let sunriseText = lang === 'he' ? '--:--' : '--:--';
  let sunsetText = lang === 'he' ? '--:--' : '--:--';

  try {
    const jDateObj = toJDate(date);
    const secularDate = jDateObj.getDate();
    // Ensure location is valid if processed, or rely on jcal default
    if (location) {
      const { sunrise, sunset } = jDateObj.getSunriseSunset(location);

      const formatTime = (time: any) => {
        if (!time) return lang === 'he' ? 'אף פעם' : 'Never';
        const hour = Math.floor(time.hour);
        const minute = Math.floor(time.minute);
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      };

      sunriseText = formatTime(sunrise);
      sunsetText = formatTime(sunset);
    }
  } catch (e) {
    console.error('Error calculating times:', e);
  }

  // Date display helper
  const formatDateDisplay = () => {
    try {
      const jd = toJDate(date);
      return {
        hebrew: jd.toString(),
        secular: jd.getDate().toLocaleDateString(),
      };
    } catch {
      return { hebrew: '-', secular: '-' };
    }
  };
  const { hebrew: hebrewDate, secular: secularDateDisplay } = formatDateDisplay();

  const t = {
    title: existingEntry
      ? lang === 'he'
        ? 'ערוך ראייה'
        : 'Edit Entry'
      : lang === 'he'
        ? 'ראייה חדשה'
        : 'New Entry',
    close: lang === 'he' ? 'סגור' : 'Close',
    date: lang === 'he' ? 'תאריך' : 'Date',
    jewishDate: lang === 'he' ? 'תאריך עברי' : 'Jewish Date',
    secularDate: lang === 'he' ? 'תאריך לועזי' : 'Secular Date',
    year: lang === 'he' ? 'שנה' : 'Year',
    month: lang === 'he' ? 'חודש' : 'Month',
    day: lang === 'he' ? 'יום' : 'Day',
    onah: lang === 'he' ? 'עונה - יום או לילה?' : 'Onah - Day or Night?',
    night: lang === 'he' ? 'לילה' : 'Night',
    dayOnah: lang === 'he' ? 'יום' : 'Day',
    nightWarning: lang === 'he' ? 'בחרת עונת לילה' : 'You have selected the night Onah',
    pleaseMakeSure: lang === 'he' ? 'אנא וודא' : 'Please make sure',
    sunrise: lang === 'he' ? 'נץ החמה' : 'Sunrise',
    sunset: lang === 'he' ? 'שקיעה' : 'Sunset',
    comments: lang === 'he' ? 'הערות' : 'Comments',
    commentsPlaceholder: lang === 'he' ? 'הערות נוספות...' : 'Additional notes...',
    showAdvanced: lang === 'he' ? 'הצג אפשרויות מתקדמות' : 'Show Advanced Entry Options',
    hideAdvanced: lang === 'he' ? 'הסתר אפשרויות מתקדמות' : 'Hide Advanced Options',
    advancedOptions: lang === 'he' ? 'אפשרויות מתקדמות' : 'Advanced Options',
    ignoreFlagged:
      lang === 'he'
        ? 'לא תקופה הלכתית. לא צריך ליצור זמני שמירה'
        : 'Not a halachic Vesset period. Should not generate Flagged Dates',
    ignoreKavuah:
      lang === 'he' ? 'התעלם מראייה זו בחישובי וסת' : 'Ignore this Entry in Kavuah calculations',
    hefsekReminder: lang === 'he' ? 'תזכורת הפסק טהרה' : 'Hefsek Tahara Reminder',
    enableReminder: lang === 'he' ? 'הפעל תזכורת' : 'Enable Reminder',
    daysAfter: lang === 'he' ? 'ימים אחרי' : 'Days After',
    time: lang === 'he' ? 'שעה' : 'Time',
    reviewBeforeSave:
      lang === 'he'
        ? 'לפני המשך, אנא בדוק את התאריך והעונה....'
        : 'Before continuing, please review the Date and Onah....',
    cancel: lang === 'he' ? 'ביטול' : 'Cancel',
    save: existingEntry ? (lang === 'he' ? 'עדכן' : 'Update') : lang === 'he' ? 'שמור' : 'Save',
    delete: lang === 'he' ? 'מחק' : 'Delete',
    dateChangesNote:
      lang === 'he'
        ? 'אל תשכח שאחרי השקיעה, התאריך העברי משתנה.'
        : 'Do not forget that after sunset, the Jewish Date changes.',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content entry-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{t.title}</h2>
          <button className="modal-close-btn" onClick={onClose} title={t.close}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          {/* Date Section */}
          <div className="form-section">
            <h3 className="section-title">{t.date}</h3>

            <div className="date-inputs">
              <div className="form-group">
                <label className="form-label">{t.year}</label>
                <input
                  type="number"
                  className="form-input"
                  value={date.year}
                  onChange={e => handleDateChange('year', e.target.value)}
                  required
                  min={5000}
                  max={6000}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.month}</label>
                <input
                  type="number"
                  className="form-input"
                  value={date.month}
                  onChange={e => handleDateChange('month', e.target.value)}
                  required
                  min={1}
                  max={13}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.day}</label>
                <input
                  type="number"
                  className="form-input"
                  value={date.day}
                  onChange={e => handleDateChange('day', e.target.value)}
                  required
                  min={1}
                  max={30}
                />
              </div>
            </div>

            <div className="date-display">
              <span className="hebrew-date">{hebrewDate}</span>
              <span className="secular-date">{secularDateDisplay}</span>
            </div>

            <div className="sunrise-sunset-info">
              <p>
                {t.sunrise}: <strong>{sunriseText}</strong>
                {'    '}
                {t.sunset}: <strong>{sunsetText}</strong>
              </p>
              <p className="date-note">{t.dateChangesNote}</p>
            </div>
          </div>

          {/* Onah Section */}
          <div className="form-section">
            <h3 className="section-title">{t.onah}</h3>
            <div className="onah-selector">
              <button
                type="button"
                className={`onah-button ${onah === NightDay.Night ? 'active' : ''}`}
                onClick={() => setOnah(NightDay.Night)}
              >
                {t.night}
              </button>
              <button
                type="button"
                className={`onah-button ${onah === NightDay.Day ? 'active' : ''}`}
                onClick={() => setOnah(NightDay.Day)}
              >
                {t.dayOnah}
              </button>
            </div>

            {onah === NightDay.Night && (
              <div className="night-warning">
                <p>
                  <strong>{t.pleaseMakeSure}</strong> {t.nightWarning}
                </p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="form-section">
            <h3 className="section-title">{t.comments}</h3>
            <textarea
              className="form-textarea"
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder={t.commentsPlaceholder}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Advanced Options */}
          <div className="form-section">
            <button
              type="button"
              className="toggle-advanced-btn"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions ? t.hideAdvanced : t.showAdvanced}
            </button>

            {showAdvancedOptions && (
              <div className="advanced-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={ignoreForFlaggedDates}
                    onChange={e => setIgnoreForFlaggedDates(e.target.checked)}
                  />
                  <span>{t.ignoreFlagged}</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={ignoreForKavuah}
                    onChange={e => setIgnoreForKavuah(e.target.checked)}
                  />
                  <span>{t.ignoreKavuah}</span>
                </label>
              </div>
            )}
          </div>

          {/* Hefsek Tahara Reminder */}
          <div className="form-section">
            <h3 className="section-title">{t.hefsekReminder}</h3>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={enableHefsekReminder}
                onChange={e => setEnableHefsekReminder(e.target.checked)}
              />
              <span>{t.enableReminder}</span>
            </label>

            {enableHefsekReminder && (
              <div className="reminder-settings">
                <div className="form-group">
                  <label className="form-label">{t.daysAfter}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={hefsekDaysAfter}
                    onChange={e => setHefsekDaysAfter(parseInt(e.target.value, 10))}
                    min={1}
                    max={15}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.time}</label>
                  <input
                    type="time"
                    className="form-input"
                    value={hefsekTimeOfDay}
                    onChange={e => setHefsekTimeOfDay(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Review Note */}
          <div className="review-note">
            <p>{t.reviewBeforeSave}</p>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            {existingEntry && onDelete && (
              <button type="button" className="btn-danger" onClick={handleDelete}>
                {t.delete}
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn-primary">
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
