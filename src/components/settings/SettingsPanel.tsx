import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Settings } from '@/types';

import { Globe, BookOpen, Layout } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'he';
  settings: Settings | null;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<Settings>;
}

type TabType = 'general' | 'halacha' | 'location';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  updateSetting,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Temporary state for Location editing (to allow text input before parsing)
  // Or just bind directly? Binding directly might be jumpy for numbers.
  // For now, simple binding.

  if (!isOpen) return null;

  const t = (en: string, he: string) => (lang === 'he' ? he : en);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Settings', 'הגדרות')}
      className="settings-modal"
      maxWidth="600px"
    >
      {!settings ? (
        <div className="flex items-center justify-center p-8 h-64">
          <div className="text-lg opacity-70 animate-pulse">
            {t('Loading settings...', 'טוען הגדרות...')}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-glass-border mb-4 pb-2 overflow-x-auto">
            <TabButton
              active={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
              icon={<Layout size={18} />}
              label={t('General', 'כללי')}
            />
            <TabButton
              active={activeTab === 'halacha'}
              onClick={() => setActiveTab('halacha')}
              icon={<BookOpen size={18} />}
              label={t('Halacha', 'הלכה')}
            />
            <TabButton
              active={activeTab === 'location'}
              onClick={() => setActiveTab('location')}
              icon={<Globe size={18} />}
              label={t('Location', 'מיקום')}
            />
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto pr-2">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <SectionTitle>{t('Appearance', 'מראה')}</SectionTitle>
                <Toggle
                  label={t('Show Flags on Main Screen', 'הצג התראות במסך הראשי')}
                  checked={settings.showFlagsOnMainScreen}
                  onChange={v => updateSetting('showFlagsOnMainScreen', v)}
                />
                <Toggle
                  label={t('Show Entry Info', 'הצג פרטי ראייה')}
                  checked={settings.showEntryInfo}
                  onChange={v => updateSetting('showEntryInfo', v)}
                />
                <div className="flex justify-between items-center bg-glass-overlay p-3 rounded-lg">
                  <span>{t('Calendar Display', 'תצוגת לוח שנה')}</span>
                  <select
                    className="bg-glass-surface rounded p-1"
                    value={settings.calendarDisplaysCurrent}
                    onChange={e =>
                      updateSetting(
                        'calendarDisplaysCurrent',
                        e.target.value as 'jewish' | 'secular'
                      )
                    }
                  >
                    <option value="jewish">{t('Jewish Month', 'חודש עברי')}</option>
                    <option value="secular">{t('Secular Month', 'חודש לועזי')}</option>
                  </select>
                </div>

                <SectionTitle>{t('Behavior', 'התנהגות')}</SectionTitle>
                <Toggle
                  label={t('Hide Flags Week After Entry', 'הסתר התראות שבוע אחרי ראייה')}
                  checked={settings.hideFlagsWeekAfterEntry}
                  onChange={v => updateSetting('hideFlagsWeekAfterEntry', v)}
                />
                <Toggle
                  label={t('Discreet Reminders', 'תזכורות דיסקרטיות')}
                  checked={settings.discreetReminders}
                  onChange={v => updateSetting('discreetReminders', v)}
                />
                <InputRow
                  label={t('Months Ahead to Warn', 'מספר חודשים לחישוב התראות')}
                  type="number"
                  value={settings.numberMonthsAheadToWarn}
                  onChange={v => updateSetting('numberMonthsAheadToWarn', parseInt(v) || 12)}
                />
              </div>
            )}

            {activeTab === 'halacha' && (
              <div className="space-y-4">
                <div className="bg-glass-overlay p-4 rounded-lg mb-4 text-sm opacity-80">
                  {t(
                    'Please consult a Rabbi regarding these settings.',
                    'נא להתייעץ עם מורה הוראה לגבי הגדרות אלו.'
                  )}
                </div>

                <SectionTitle>{t('Kavuah', 'וסת קבוע')}</SectionTitle>
                <Toggle
                  label={t(
                    'Keep Kavuah even if Onahs differ (Stringent)',
                    'חושש לוסת קבוע גם אם העונות שונות'
                  )}
                  checked={settings.kavuahDiffOnahs}
                  onChange={v => updateSetting('kavuahDiffOnahs', v)}
                />
                <Toggle
                  label={t('Haflaga of Onahs', 'הפלגה של עונות')}
                  description={t(
                    'Calculate Haflaga by Onahs (Shulchan Aruch Harav)',
                    'חישוב הפלגה לפי עונות (שו"ע הרב)'
                  )}
                  checked={settings.haflagaOfOnahs}
                  onChange={v => updateSetting('haflagaOfOnahs', v)}
                />
                <Toggle
                  label={t('Dilug Chodesh Past Ends', 'דילוג חודש מעבר לסוף החודש')}
                  description={t(
                    'Continue calculating Dilug Chodesh even if it skips over the end of a month',
                    'המשך חישוב דילוג חודש גם אם הוא מדלג על סוף חודש'
                  )}
                  checked={settings.dilugChodeshPastEnds}
                  onChange={v => updateSetting('dilugChodeshPastEnds', v)}
                />

                <SectionTitle>{t('General Stringencies', 'חומרות כלליות')}</SectionTitle>
                <Toggle
                  label={t('Onah Beinonis 24 Hours', 'עונה בינונית 24 שעות')}
                  checked={settings.onahBeinunis24Hours}
                  onChange={v => updateSetting('onahBeinunis24Hours', v)}
                />
                <Toggle
                  label={t('Ohr Zeruah', 'אור זרוע')}
                  checked={settings.ohrZeruah}
                  onChange={v => updateSetting('ohrZeruah', v)}
                />
                <Toggle
                  label={t('Show Ohr Zeruah on Calendar', 'הצג אור זרוע בלוח')}
                  checked={settings.showOhrZeruah}
                  onChange={v => updateSetting('showOhrZeruah', v)}
                />
                <Toggle
                  label={t('Keep Day 31', 'חושש ליום ה-31')}
                  checked={settings.keepThirtyOne}
                  onChange={v => updateSetting('keepThirtyOne', v)}
                />
                <Toggle
                  label={t('Keep Longer Haflaga (Taz)', 'חושש להפלגה ארוכה (ט"ז)')}
                  checked={settings.keepLongerHaflagah}
                  onChange={v => updateSetting('keepLongerHaflagah', v)}
                />
                <Toggle
                  label={t('No Problems After Entry', 'הסתר חששות שבוע אחרי ראייה')}
                  description={t(
                    'Do not flag dates in the 7 days following a new entry',
                    'אל תציג התראות ב-7 הימים שלאחר ראייה חדשה'
                  )}
                  checked={settings.noProbsAfterEntry}
                  onChange={v => updateSetting('noProbsAfterEntry', v)}
                />
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-4">
                <SectionTitle>
                  {t('Manual Location Configuration', 'הגדרת מיקום ידנית')}
                </SectionTitle>
                <InputRow
                  label={t('Name', 'שם')}
                  value={settings.location.name}
                  onChange={v => updateSetting('location', { ...settings.location, name: v })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputRow
                    label={t('Latitude', 'קו רוחב')}
                    type="number"
                    value={settings.location.latitude}
                    onChange={v =>
                      updateSetting('location', { ...settings.location, latitude: parseFloat(v) })
                    }
                  />
                  <InputRow
                    label={t('Longitude', 'קו אורך')}
                    type="number"
                    value={settings.location.longitude}
                    onChange={v =>
                      updateSetting('location', { ...settings.location, longitude: parseFloat(v) })
                    }
                  />
                </div>
                <InputRow
                  label={t('UTC Offset', 'הפרש שעות (UTC)')}
                  type="number"
                  value={settings.location.utcOffset}
                  onChange={v =>
                    updateSetting('location', { ...settings.location, utcOffset: parseFloat(v) })
                  }
                />
                <Toggle
                  label={t('In Israel', 'בארץ ישראל')}
                  checked={!!settings.location.israel}
                  onChange={v => updateSetting('location', { ...settings.location, israel: v })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
      active ? 'text-white font-bold' : 'hover:bg-glass-hover'
    }`}
    style={{
      backgroundColor: active ? 'var(--accent-amber)' : 'var(--glass-surface)',
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3
    className="text-lg font-bold border-b border-glass-border pb-1 mt-4 mb-2"
    style={{ color: 'var(--accent-amber)', borderColor: 'var(--glass-border)' }}
  >
    {children}
  </h3>
);

const Toggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div
    className="settings-toggle-row"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: 'var(--glass-overlay)',
      marginBottom: '8px',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {description && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{description}</span>}
    </div>
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: '48px',
        height: '24px',
        borderRadius: '9999px',
        padding: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        position: 'relative',
        backgroundColor: checked ? 'var(--accent-amber)' : 'var(--glass-border)',
      }}
    >
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          position: 'absolute',
          top: '4px',
          left: '4px',
          transform: checked ? 'translateX(24px)' : 'translateX(0)',
          transition: 'transform 0.2s',
        }}
      />
    </div>
  </div>
);

const InputRow: React.FC<{
  label: string;
  value: string | number;
  type?: string;
  onChange: (val: string) => void;
}> = ({ label, value, type = 'text', onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm opacity-80">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-glass-surface rounded-lg p-2 border border-glass-border focus:border-accent-amber focus:outline-none"
    />
  </div>
);
