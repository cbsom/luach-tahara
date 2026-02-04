import React, { useState } from 'react';
import { jDate } from 'jcal-zmanim';
import { useEntries } from '../../services/db/hooks';
import { KavuahTypes } from '../../lib/chashavshavon/Kavuah';
import { NightDay } from '../../lib/chashavshavon/Onah';
import { Save, X } from 'lucide-react';
import { KavuahData } from '../../services/db/kavuahService';

interface KavuahFormProps {
  initialData?: Partial<KavuahData>;
  onSave: (data: KavuahData) => Promise<void>;
  onCancel: () => void;
  lang: 'en' | 'he';
}

export const KavuahForm: React.FC<KavuahFormProps> = ({ initialData, onSave, onCancel, lang }) => {
  const { entries } = useEntries();
  const [formData, setFormData] = useState<Partial<KavuahData>>({
    active: true,
    ignore: false,
    cancelsOnahBeinunis: false,
    kavuahType: KavuahTypes.Haflagah,
    specialNumber: 30, // Default
    ...initialData,
  });

  const t = (en: string, he: string) => (lang === 'he' ? he : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.settingEntryId || !formData.kavuahType || !formData.specialNumber) {
      alert(t('Please fill in all required fields.', 'נא למלא את כל שדות החובה.'));
      return;
    }
    await onSave(formData as KavuahData);
  };

  // Helper to format entry for dropdown
  const formatEntryOption = (entry: any) => {
    // Reconstruct jDate from the stored object
    const dateObj = entry.jewishDate || entry.date;
    if (!dateObj) return 'Invalid Date';

    const jd = new jDate(dateObj.year, dateObj.month, dateObj.day);
    const dateStr = lang === 'he' ? jd.toStringHeb() : jd.toString();

    const onahStr =
      entry.onah === NightDay.Night
        ? lang === 'he'
          ? 'לילה'
          : 'Night'
        : lang === 'he'
          ? 'יום'
          : 'Day';

    return `${dateStr} - ${onahStr}`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1">
      {/* Type Selector */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium opacity-80">{t('Kavuah Type', 'סוג וסת')}</label>
        <select
          value={formData.kavuahType}
          onChange={e => setFormData({ ...formData, kavuahType: Number(e.target.value) })}
          className="bg-glass-surface rounded-lg p-2 border border-glass-border focus:border-accent-amber focus:outline-none"
        >
          <option value={KavuahTypes.Haflagah}>{t('Haflaga', 'הפלגה')}</option>
          <option value={KavuahTypes.DayOfMonth}>{t('Day of Month', 'יום החודש')}</option>
          <option value={KavuahTypes.DayOfWeek}>{t('Day of Week', 'יום בשבוע')}</option>
          <option value={KavuahTypes.Sirug}>{t('Sirug', 'סירוג')}</option>
          <option value={KavuahTypes.DilugHaflaga}>{t('Dilug Haflaga', 'דילוג הפלגה')}</option>
          <option value={KavuahTypes.DilugDayOfMonth}>
            {t('Dilug Day of Month', 'דילוג יום החודש')}
          </option>
        </select>
      </div>

      {/* Setting Entry */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium opacity-80">
          {t('Setting Entry', 'ראייה מכוננת')}
        </label>
        <select
          value={formData.settingEntryId || ''}
          onChange={e => setFormData({ ...formData, settingEntryId: e.target.value })}
          className="bg-glass-surface rounded-lg p-2 border border-glass-border focus:border-accent-amber focus:outline-none"
          required
        >
          <option value="" disabled>
            {t('Select an entry...', 'בחר ראייה...')}
          </option>
          {entries.map(entry => (
            <option key={entry.id} value={entry.id}>
              {formatEntryOption(entry)}
            </option>
          ))}
        </select>
        <p className="text-xs opacity-60">
          {t('The entry that established this pattern.', 'הראייה שקבעה את הוסת הזה.')}
        </p>
      </div>

      {/* Special Number */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium opacity-80">
          {formData.kavuahType === KavuahTypes.Haflagah
            ? t('Interval (Days)', 'הפרש (ימים)')
            : formData.kavuahType === KavuahTypes.DayOfMonth
              ? t('Day of Month', 'יום בחודש')
              : formData.kavuahType === KavuahTypes.DayOfWeek
                ? t('Days Interval', 'מרווח ימים')
                : t('Special Number', 'מספר מיוחד')}
        </label>
        <input
          type="number"
          value={formData.specialNumber}
          onChange={e => setFormData({ ...formData, specialNumber: Number(e.target.value) })}
          className="bg-glass-surface rounded-lg p-2 border border-glass-border focus:border-accent-amber focus:outline-none"
          required
        />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2 mt-2">
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-glass-overlay transition-colors">
          <input
            type="checkbox"
            checked={formData.cancelsOnahBeinunis}
            onChange={e => setFormData({ ...formData, cancelsOnahBeinunis: e.target.checked })}
            className="w-4 h-4 rounded border-glass-border text-accent-amber focus:ring-accent-amber"
          />
          <span className="text-sm">{t('Cancels Onah Beinunis', 'מבטל עונה בינונית')}</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-glass-overlay transition-colors">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={e => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 rounded border-glass-border text-accent-teal focus:ring-accent-teal"
          />
          <span className="text-sm">{t('Active', 'פעיל')}</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-glass-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg hover:bg-glass-hover text-text-secondary flex items-center gap-2"
        >
          <X size={18} />
          {t('Cancel', 'ביטול')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent-amber text-white font-medium hover:bg-opacity-90 flex items-center gap-2"
        >
          <Save size={18} />
          {t('Save Kavuah', 'שמור וסת')}
        </button>
      </div>
    </form>
  );
};
