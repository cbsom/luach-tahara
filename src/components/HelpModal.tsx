import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  BookOpen,
  Sparkles,
  Palette,
  HelpCircle,
  AlertTriangle,
  Droplet,
  Waves,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  Cloud,
  Repeat,
  CheckCircle2,
  Clock,
  Plus,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'he';
}

type TabType = 'quickstart' | 'guides' | 'legend' | 'faq';

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<TabType>('quickstart');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGuide, setExpandedGuide] = useState<string | null>('entries');

  if (!isOpen) return null;

  const isHe = lang === 'he';
  const t = (en: string, he: string) => (isHe ? he : en);

  const toggleGuide = (id: string) => {
    setExpandedGuide(prev => (prev === id ? null : id));
  };

  const guides = [
    {
      id: 'entries',
      title: t('Recording a Flow or Sighting (ראייה)', 'רישום ראייה או כתם (ראייה)'),
      icon: <Droplet size={18} className="text-red-400" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            {t(
              'To record a new flow or sighting, find the date on the calendar, hover over or tap the day cell, and click the plus icon (+). Then select "Add Entry".',
              'כדי לרשום ראייה חדשה, מצאו את התאריך בלוח השנה, רחפו עם העכבר או לחצו על תא היום, ולחצו על כפתור הפלוס (+). לאחר מכן בחרו ב"הוסף ראייה".'
            )}
          </p>
          <div className="p-3 rounded-xl bg-glass-surface/40 border border-glass-border space-y-2">
            <div className="font-semibold text-accent-amber">
              {t('Key Fields & Options:', 'שדות מרכזיים ואפשרויות:')}
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>{t('Onah (Day / Night):', 'עונה (יום / לילה):')}</strong>{' '}
                {t(
                  'Choose whether the flow began during the Night Onah (from sunset until sunrise) or the Day Onah (from sunrise until sunset). The form displays local sunrise/sunset times for reference.',
                  'בחרו האם הראייה החלה בעונת לילה (משקיעת החמה ועד הזריחה) או בעונת יום (מהזריחה ועד השקיעה). הטופס מציג את זמני השקיעה והזריחה המדויקים לפי מיקומכם.'
                )}
              </li>
              <li>
                <strong>{t('Haflaga:', 'הפלגה:')}</strong>{' '}
                {t(
                  'The interval (in days) since your previous sighting is calculated automatically for your convenience.',
                  'מרווח הימים מהראייה הקודמת מחושב אוטומטית לנוחיותכם.'
                )}
              </li>
              <li>
                <strong>{t('Advanced Flags:', 'אפשרויות מתקדמות:')}</strong>{' '}
                {t(
                  'You can choose to exclude an entry from flagged date calculations or Kavuah calculations if advised by a Halachic authority (e.g. for non-niddah stains/ketamim).',
                  'באפשרותכם לסמן התעלמות מחישוב זמני שמירה או מחישוב וסת לפי הוראת מורה הוראה (למשל עבור כתמים שאינם מטמאים).'
                )}
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'hefsek',
      title: t('Hefsek Tahara & 7 Clean Days (הפסק ושבעה נקיים)', 'הפסק טהרה ושבעה נקיים'),
      icon: <CheckCircle2 size={18} className="text-emerald-400" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            {t(
              'Once bleeding stops (typically after the minimum required days according to your custom), record a Hefsek Tahara examination.',
              'לאחר פסיקת הדמים (ועמידה בימי ההמתנה הנדרשים לפי מנהגכם), עורכים בדיקת הפסק טהרה.'
            )}
          </p>
          <div className="p-3 rounded-xl bg-glass-surface/40 border border-glass-border space-y-2">
            <div className="font-semibold text-accent-amber">
              {t('How it works in the calendar:', 'כיצד זה פועל בלוח:')}
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {t(
                  'Click the (+) icon on the day you perform the Hefsek (before sunset) and select "Hefsek Tahara".',
                  'לחצו על כפתור ה-(+) ביום בו ביצעתם את ההפסק (לפני השקיעה) ובחרו ב"הפסק טהרה".'
                )}
              </li>
              <li>
                {t(
                  "The calendar automatically marks the subsequent 7 clean days (Shiv'ah Nekiyim) with progressive day numbers (1 to 7).",
                  'הלוח יסמן אוטומטית את שבעת הימים הנקיים הבאים עם מספור עוקב (יום 1 עד יום 7).'
                )}
              </li>
              <li>
                {t(
                  'On the night following Day 7 (after nightfall), Mikvah night will be indicated with a water icon.',
                  'בליל מוצאי יום 7 (לאחר צאת הכוכבים), יסומן מועד הטבילה במקווה עם סמל גלי מים.'
                )}
              </li>
              <li>
                {t(
                  'You can also record individual Bedikos (checks) performed on each of the clean days.',
                  'ניתן גם לתעד בדיקות שנערכו בכל אחד מימי השבעה נקיים.'
                )}
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'flagged',
      title: t('Flagged Dates & Separation Times (עונות פרישה)', 'זמני שמירה ועונות פרישה'),
      icon: <AlertTriangle size={18} className="text-amber-400" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            {t(
              'Luach Tahara automatically calculates and highlights upcoming Halachic dates of separation (Vesetos / Chashashos) based on your recorded entries and active Kavuahs.',
              'לוח טהרה מחשב ומדגיש אוטומטית את עונות הפרישה וזמני השמירה העתידיים (וסתות וחששות) על בסיס הראיות שנרשמו והווסתות הקבועים.'
            )}
          </p>
          <div className="p-3 rounded-xl bg-glass-surface/40 border border-glass-border space-y-2">
            <div className="font-semibold text-accent-amber">
              {t('Types of Calculated Alerts:', 'סוגי החששות המחושבים:')}
            </div>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>{t('Onah Beinonit (עונה בינונית):', 'עונה בינונית:')}</strong>{' '}
                {t(
                  'The 30th day from the start of your previous flow (counting the day of the flow as day 1).',
                  'היום ה-30 מתחילת הראייה הקודמת (במניין שבו יום הראייה הוא יום 1).'
                )}
              </li>
              <li>
                <strong>{t('Yom HaChodesh (יום החודש):', 'יום החודש:')}</strong>{' '}
                {t(
                  'The same Hebrew day in the following Hebrew month on the matching onah (day or night).',
                  'אותו יום בחודש העברי בחודש הבא באותה עונה (יום או לילה).'
                )}
              </li>
              <li>
                <strong>{t('Haflagah (הפלגה):', 'וסת ההפלגה:')}</strong>{' '}
                {t(
                  'The exact interval between the previous two sightings, projected forward from the last sighting.',
                  'מספר הימים שחלפו בין שתי הראיות האחרונות, מחושב קדימה מהראייה האחרונה.'
                )}
              </li>
              <li>
                <strong>{t("Ohr Zaru'a (אור זרוע):", 'אור זרוע:')}</strong>{' '}
                {t(
                  "If enabled in Settings, the onah immediately preceding the required separation is also flagged according to the custom of the Ohr Zaru'a.",
                  'במידה והופעל בהגדרות, תסומן גם העונה שקודמת לעונת הפרישה כחומרת האור זרוע.'
                )}
              </li>
            </ul>
          </div>
          <p className="text-xs opacity-80">
            {t(
              'To view all upcoming alerts in a list, click the Alert Triangle icon in the top header.',
              'לצפייה ברשימה מרוכזת של כל החששות והתאריכים הקרובים, לחצו על סמל משולש האזהרה בסרגל העליון.'
            )}
          </p>
        </div>
      ),
    },
    {
      id: 'kavuah',
      title: t('Established Patterns / Kavuahs (וסת קבוע)', 'וסת קבוע ודפוסים מחזוריים'),
      icon: <Repeat size={18} className="text-blue-400" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            {t(
              'A Kavuah (established cycle) is formed in Halacha when a pattern repeats 3 consecutive times without interruption.',
              'וסת קבוע נקבע בהלכה כאשר דפוס מסוים חוזר על עצמו 3 פעמים רצופות ללא שינוי.'
            )}
          </p>
          <div className="p-3 rounded-xl bg-glass-surface/40 border border-glass-border space-y-2">
            <div className="font-semibold text-accent-amber">
              {t('Managing Kavuahs:', 'ניהול וסתות קבועים:')}
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {t(
                  'Click the Repeat (cycle) icon in the top header to view all detected or manually entered Kavuahs.',
                  'לחצו על סמל החיצים המעגליים (Repeat) בסרגל העליון לצפייה ברשימת הווסתות הקבועים.'
                )}
              </li>
              <li>
                {t(
                  'You can activate, deactivate, or customize whether a Kavuah cancels Onah Beinonit (עוקר עונה בינונית) according to your Halachic authority.',
                  'ניתן להפעיל, להשהות, או להגדיר האם הווסת עוקר עונה בינונית בהתאם להנחיית רב.'
                )}
              </li>
              <li>
                {t(
                  'The app supports Day of Month (יום החודש), Interval (הפלגה), Day of Week (יום בשבוע), Sirug (סירוג), and Dilug (דילוג) patterns.',
                  'המערכת תומכת בחישובי וסת יום החודש, הפלגה, יום בשבוע, וסת הסירוג, ודילוג.'
                )}
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dailyinfo',
      title: t(
        'Daily Zmanim & Astronomical Times (זמני היום ומידע הלכתי)',
        'זמני היום ומידע הלכתי יומי'
      ),
      icon: <Clock size={18} className="text-amber-300" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            {t(
              'Accurate astronomical times are essential for determining whether an event occurred during the day or night onah, and for the timing of Hefsek Tahara.',
              'זמני היום האסטרונומיים מדויקים נחוצים לקביעת עונת יום או לילה, וכן לקביעת זמן בדיקת הפסק טהרה לפני השקיעה.'
            )}
          </p>
          <div className="p-3 rounded-xl bg-glass-surface/40 border border-glass-border space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>
                {t(
                  'Click the (i) Info icon in the header or click any day cell to open the Daily Info panel.',
                  'לחצו על סמל ה-(i) בסרגל העליון או לחצו על תא יום כלשהו כדי לפתוח את פאנל המידע היומי.'
                )}
              </li>
              <li>
                {t(
                  'View Sunrise (הנץ החמה), Sunset (שקיעת החמה), Alos (עלות השחר), and Tzeit HaKochavim (צאת הכוכבים) for the selected date.',
                  'תוכלו לצפות בזמני הנץ החמה, שקיעת החמה, עלות השחר, וצאת הכוכבים עבור התאריך הנבחר.'
                )}
              </li>
              <li>
                {t(
                  'Make sure your location is configured properly in Settings for precise times.',
                  'ודאו שהמיקום שלכם מוגדר כראוי בתפריט ההגדרות לקבלת זמנים מדויקים לעיר מגוריכם.'
                )}
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'navigation',
      title: t('Navigation & Calendar Switching (תצוגת לוח וניווט)', 'תצוגת לוח וניווט בתאריכים'),
      icon: <Calendar size={18} className="text-purple-400" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            {t(
              'Luach Tahara offers seamless navigation between Jewish and Gregorian calendars:',
              'לוח טהרה מאפשר ניווט פשוט בין הלוח העברי והלוח הלועזי:'
            )}
          </p>
          <div className="p-3 rounded-xl bg-glass-surface/40 border border-glass-border space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>{t('Jewish vs. Secular View:', 'תצוגה עברית מול לועזית:')}</strong>{' '}
                {t(
                  'Click the Calendar view button in the top right to switch between displaying the calendar grouped by Jewish months or Gregorian months.',
                  'לחצו על סמל הלוח בסרגל העליון למעבר בין פריסת חודש עברי לפריסת חודש לועזי.'
                )}
              </li>
              <li>
                <strong>{t('Go to Date (Jump Modal):', 'עבור לתאריך:')}</strong>{' '}
                {t(
                  'Click the date title or the search/jump icon in the navigation controls to jump immediately to any Hebrew or Gregorian date in the past or future.',
                  'לחצו על כפתור החיפוש/מעבר בסרגל הניווט כדי לדלג מיד לכל תאריך עברי או לועזי בעבר או בעתיד.'
                )}
              </li>
              <li>
                <strong>{t('Today Button:', 'כפתור היום:')}</strong>{' '}
                {t(
                  'Click "Today" at any time to return directly to the current date.',
                  'לחצו על כפתור "היום" בכל עת לחזרה ישירה לתאריך הנוכחי.'
                )}
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'privacy',
      title: t(
        'Privacy, Offline Mode & Cloud Sync (פרטיות וסנכרון)',
        'פרטיות, עבודה אופליין וסנכרון'
      ),
      icon: <Cloud size={18} className="text-sky-400" />,
      content: (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            {t(
              'Taharat HaMishpacha information is deeply personal. Luach Tahara is designed with privacy as the highest priority:',
              'פרטי טהרת המשפחה הם אישיים ביותר. לוח טהרה תוכנן תוך שימת דגש עליון על פרטיות ואבטחה:'
            )}
          </p>
          <div className="p-3 rounded-xl bg-glass-surface/40 border border-glass-border space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>
                  {t('Local & Offline by Default:', 'שמירה מקומית ועבודה ללא אינטרנט:')}
                </strong>{' '}
                {t(
                  'All your entries, kavuahs, and notes are stored locally in your browser (IndexedDB). The application works entirely offline even without internet connectivity.',
                  'כל הנתונים, הראיות וההערות נשמרים מקומית בדפדפן שלכם (IndexedDB). האפליקציה פועלת באופן מלא גם ללא חיבור לאינטרנט.'
                )}
              </li>
              <li>
                <strong>{t('Secure Cloud Sync:', 'סנכרון מאובטח בענן:')}</strong>{' '}
                {t(
                  'If you wish to access your calendar across multiple devices (e.g. computer and phone), click "Login" in the header to sync your private encrypted data safely.',
                  'אם תרצו לגשת ללוח מכמה מכשירים (מחשב, טלפון), לחצו על "התחבר" בסרגל העליון לסנכרון מאובטח ופרטי.'
                )}
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const filteredGuides = searchQuery.trim()
    ? guides.filter(
        g =>
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guides;

  const tabOptions: { id: TabType; icon: React.ReactNode; label: string; description: string }[] = [
    {
      id: 'quickstart',
      icon: <Sparkles size={16} />,
      label: t('Quick Start', 'סקירה מהירה'),
      description: t('4-step orientation', 'התמצאות ב-4 שלבים'),
    },
    {
      id: 'guides',
      icon: <BookOpen size={16} />,
      label: t('How-To Guides', 'מדריכי שימוש'),
      description: t('Detailed practical actions', 'פעולות מעשיות מפורטות'),
    },
    {
      id: 'legend',
      icon: <Palette size={16} />,
      label: t('Visual Legend', 'מקרא סימנים'),
      description: t('Meaning of symbols & colors', 'פירוש סמלים וצבעים'),
    },
    {
      id: 'faq',
      icon: <HelpCircle size={16} />,
      label: t('FAQ & Halacha', 'שאלות והלכה'),
      description: t('Common questions & guidance', 'שאלות נפוצות והכוונה'),
    },
  ];

  const activeTabMeta = tabOptions.find(tab => tab.id === activeTab);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Help & User Guide', 'מדריך למשתמש ועזרה')}
      subtitle={t('Luach Tahara - Complete Guide & Features', 'לוח טהרה - כל הכלים והאפשרויות')}
      className="help-modal"
      maxWidth="860px"
    >
      <div className="flex flex-col h-full">
        <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-5">
          <div className="rounded-2xl border border-accent-amber/20 bg-accent-amber/5 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent-amber/15 border border-accent-amber/25 p-1.5 flex items-center justify-center text-accent-amber flex-shrink-0">
                {activeTabMeta?.icon}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="text-sm sm:text-base font-semibold text-accent-amber">
                  {activeTabMeta?.label ?? t('Help & User Guide', 'מדריך למשתמש ועזרה')}
                </div>
                <p className="text-sm leading-relaxed opacity-85">
                  {activeTabMeta?.description ??
                    t(
                      'Browse practical help for common Luach Tahara workflows.',
                      'עיינו בהסברים מעשיים לזרימות העבודה הנפוצות בלוח טהרה.'
                    )}
                </p>
              </div>
            </div>
          </div>

          <div className="help-modal-mobile-nav rounded-2xl border border-glass-border bg-glass-surface/20 p-3 space-y-2">
            <div className="text-xs uppercase tracking-wide opacity-75 px-1">
              {t('Navigate section', 'ניווט בין פרקים')}
            </div>
            <div className="relative">
              <select
                value={activeTab}
                onChange={e => setActiveTab(e.target.value as TabType)}
                className="w-full rounded-xl border border-glass-border bg-glass-surface/40 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-accent-amber"
              >
                {tabOptions.map((tab, index) => (
                  <option key={tab.id} value={tab.id}>
                    {index + 1}. {tab.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none opacity-70"
                style={{ [isHe ? 'left' : 'right']: '12px' }}
              />
            </div>
          </div>

          <div className="help-modal-layout">
            <aside className="help-modal-desktop-nav rounded-2xl border border-glass-border bg-glass-surface/20 p-3 space-y-2">
              <div className="text-xs uppercase tracking-wide opacity-75 px-1">
                {t('Navigation', 'ניווט')}
              </div>
              {tabOptions.map((tab, index) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`help-modal-desktop-nav-btn ${isActive ? 'is-active' : ''}`}
                    style={{ textAlign: isHe ? 'right' : 'left' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 font-semibold text-sm">
                        <span className="help-modal-desktop-nav-btn-icon w-6 h-6 rounded-md p-1 flex items-center justify-center flex-shrink-0">
                          {tab.icon}
                        </span>
                        <span className="truncate">{tab.label}</span>
                      </div>
                      <span className="text-xs opacity-70 flex-shrink-0">{index + 1}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed opacity-75">
                      {tab.description}
                    </p>
                  </button>
                );
              })}
            </aside>

            <div className="help-modal-content min-w-0">
              {/* Tab 1: Quick Start */}
        {activeTab === 'quickstart' && (
          <div className="space-y-4 rounded-2xl border border-glass-border bg-glass-surface/15 p-4 sm:p-5">
            <div className="p-4 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 flex flex-col gap-2">
              <h4 className="font-bold text-accent-amber flex items-center gap-2">
                <Sparkles size={18} />
                {t('Welcome to Luach Tahara', 'ברוכים הבאים ללוח טהרה')}
              </h4>
              <p className="text-sm leading-relaxed opacity-90">
                {t(
                  'Luach Tahara is an intelligent Halachic calendar designed to simplify and organize the observance of Taharat HaMishpacha with beauty, clarity, and precision.',
                  'לוח טהרה הינו לוח הלכתי חכם ומתקדם שנועד להקל על מעקב וניהול טהרת המשפחה בבהירות, דיוק ויופי.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="font-semibold text-sm flex items-center gap-2 text-accent-amber">
                  <span className="w-5 h-5 rounded-full bg-accent-amber/20 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  {t('Record a Flow / Sighting', 'רישום ראייה חדשה')}
                </div>
                <p className="text-sm opacity-85 leading-relaxed">
                  {t(
                    'Hover or tap on any day to see the (+) button. Click it to add an entry, select Day or Night Onah, and save.',
                    'רחפו או לחצו על תא יום כלשהו כדי לחשוף את כפתור ה-(+). לחצו עליו להוספת ראייה, בחרו עונת יום או לילה ושמרו.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="font-semibold text-sm flex items-center gap-2 text-accent-amber">
                  <span className="w-5 h-5 rounded-full bg-accent-amber/20 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  {t('Track Hefsek & 7 Clean Days', 'הפסק טהרה ושבעה נקיים')}
                </div>
                <p className="text-sm opacity-85 leading-relaxed">
                  {t(
                    'Record a Hefsek Tahara before sunset. The app automatically tracks the 7 Clean Days and displays Mikvah night.',
                    'רישמו הפסק טהרה לפני השקיעה. הלוח יסמן אוטומטית את 7 הימים הנקיים ויציג את ליל הטבילה במקווה.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="font-semibold text-sm flex items-center gap-2 text-accent-amber">
                  <span className="w-5 h-5 rounded-full bg-accent-amber/20 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  {t('Automatic Separation Alerts', 'התראות פרישה אוטומטיות')}
                </div>
                <p className="text-sm opacity-85 leading-relaxed">
                  {t(
                    'Onah Beinonit, Yom HaChodesh, and Haflagah are calculated automatically and highlighted in amber on your calendar.',
                    'עונה בינונית, יום החודש והפלגה מחושבים אוטומטית ומודגשים בגוון ענבר בלוח וברשימת ההתראות.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="font-semibold text-sm flex items-center gap-2 text-accent-amber">
                  <span className="w-5 h-5 rounded-full bg-accent-amber/20 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  {t('Zmanim & Day Details', 'זמני היום ומידע הלכתי')}
                </div>
                <p className="text-sm opacity-85 leading-relaxed">
                  {t(
                    'Click the (i) icon in the header to open the Daily Info panel showing sunrise, sunset, and zmanim for your city.',
                    'לחצו על סמל ה-(i) בסרגל העליון לצפייה בזמני הזריחה, השקיעה והזמנים ההלכתיים המדויקים לפי עיר מגוריכם.'
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-glass-surface/40 border border-glass-border flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <span className="text-sm opacity-85 leading-relaxed">
                {t(
                  'Want detailed instructions for specific actions?',
                  'מעוניינים בהסברים מפורטים על כל פעולה?'
                )}
              </span>
              <button
                onClick={() => setActiveTab('guides')}
                className="text-sm font-bold text-accent-amber hover:underline flex items-center gap-1"
              >
                <span>{t('Browse How-To Guides', 'עבור למדריכים המפורטים')}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: How-To Guides */}
        {activeTab === 'guides' && (
          <div className="space-y-4 rounded-2xl border border-glass-border bg-glass-surface/15 p-4 sm:p-5">
            {/* Search filter */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t(
                  'Search guides (e.g. Hefsek, Onah, Mikvah)...',
                  'חיפוש במדריכים (למשל: הפסק, עונה, מקווה)...'
                )}
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-glass-surface/40 border border-glass-border text-sm focus:outline-none focus:border-accent-amber transition-colors"
                style={{ paddingInlineStart: '40px' }}
              />
              <Search
                size={16}
                className="absolute top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
                style={{ [isHe ? 'right' : 'left']: '12px' }}
              />
            </div>
            <div className="text-xs opacity-75">
              {t('Showing', 'מציג')} {filteredGuides.length} {t('of', 'מתוך')} {guides.length}{' '}
              {t('guides', 'מדריכים')}
            </div>

            {/* Accordion guides list */}
            <div className="space-y-2.5">
              {filteredGuides.map(guide => {
                const isExpanded = expandedGuide === guide.id;
                return (
                  <div
                    key={guide.id}
                    className="rounded-xl border border-glass-border overflow-hidden bg-glass-surface/25 p-1 transition-colors"
                  >
                    <button
                      onClick={() => toggleGuide(guide.id)}
                      className="w-full p-4 sm:p-4 flex items-center justify-between text-left font-semibold text-sm hover:bg-glass-surface/45 transition-colors"
                      style={{ textAlign: isHe ? 'right' : 'left' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {guide.icon}
                        <span className="leading-relaxed">{guide.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="opacity-70 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="opacity-70 flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-4 pt-3 border-t border-glass-border/40 bg-glass-surface/15 text-sm leading-relaxed">
                        {guide.content}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredGuides.length === 0 && (
                <div className="p-8 text-center text-sm opacity-60">
                  {t('No matching guides found.', 'לא נמצאו מדריכים תואמים.')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Visual Legend */}
        {activeTab === 'legend' && (
          <div className="space-y-4 rounded-2xl border border-glass-border bg-glass-surface/15 p-4 sm:p-5">
            <p className="text-sm opacity-85 leading-relaxed">
              {t(
                'A visual guide to the indicators, colors, and symbols used throughout the calendar:',
                'מקרא ויזואלי להבנת הסימנים, הצבעים והסמלים בלוח השנה:'
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Day Cell Split */}
              <div className="p-3 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded border border-glass-border overflow-hidden p-0.5 flex flex-col">
                    <div
                      className="h-1/2 bg-blue-500/20"
                      title={t('Night Onah (Sunset to Sunrise)', 'עונת לילה')}
                    ></div>
                    <div
                      className="h-1/2 bg-amber-500/20"
                      title={t('Day Onah (Sunrise to Sunset)', 'עונת יום')}
                    ></div>
                  </div>
                  <span className="font-semibold text-sm">
                    {t('Split Day Cell', 'חלוקת היום לשתי עונות')}
                  </span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  {t(
                    'Each calendar day is split into two halves: the upper half represents the Night Onah, and the lower half represents the Day Onah.',
                    'כל יום בלוח מחולק לשתיים: החצי העליון מייצג את עונת הלילה, והחצי התחתון מייצג את עונת היום.'
                  )}
                </p>
              </div>

              {/* Red Entry Highlight */}
              <div className="p-3 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-red-400/20 border border-red-400/40 p-1 flex items-center justify-center">
                    <Droplet size={14} className="text-red-400" />
                  </div>
                  <span className="font-semibold text-sm">
                    {t('Flow / Sighting (ראייה)', 'ראייה חדשה')}
                  </span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  {t(
                    'Marked with a soft red overlay and label showing the onah and the interval (Haflaga).',
                    'מסומן ברקע אדום עדין עם תווית המציגה את העונה ואת ימי ההפלגה מהראייה הקודמת.'
                  )}
                </p>
              </div>

              {/* Flagged Date Highlight */}
              <div className="p-3 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-amber-400/20 border border-amber-400/40 p-1 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-amber-400" />
                  </div>
                  <span className="font-semibold text-sm">
                    {t('Flagged Date (זמן שמירה)', 'עונת פרישה / שמירה')}
                  </span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  {t(
                    'Highlighted in warm amber/yellow with the reason (Onah Beinonit, Yom HaChodesh, Haflaga, or Kavuah).',
                    'מודגש בגוון ענבר חם עם פירוט הסיבה (עונה בינונית, יום החודש, הפלגה, או וסת קבוע).'
                  )}
                </p>
              </div>

              {/* Clean Days Counter */}
              <div className="p-3 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-400/20 border border-emerald-400/40 p-1 flex items-center justify-center text-xs font-bold text-emerald-300">
                    1..7
                  </div>
                  <span className="font-semibold text-sm">
                    {t('7 Clean Days (שבעה נקיים)', 'שבעה נקיים')}
                  </span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  {t(
                    'Sequential day badges indicating progress through the seven clean days following a Hefsek Tahara.',
                    'תגיות יום עוקבות (יום 1 עד יום 7) המציגות את התקדמות שבעת הימים הנקיים שלאחר ההפסק.'
                  )}
                </p>
              </div>

              {/* Mikvah Badge */}
              <div className="p-3 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-sky-400/20 border border-sky-400/40 p-1 flex items-center justify-center">
                    <Waves size={14} className="text-sky-400" />
                  </div>
                  <span className="font-semibold text-sm">
                    {t('Mikvah Night (טבילה)', 'ליל טבילה במקווה')}
                  </span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  {t(
                    'Indicates the scheduled night of immersion (on the night following the completion of 7 clean days).',
                    'מציין את ליל הטבילה המיועד (בליל מוצאי שבעה ימים נקיים שלמים).'
                  )}
                </p>
              </div>

              {/* Action Button */}
              <div className="p-3 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-accent-amber/20 border border-accent-amber/40 p-1 flex items-center justify-center">
                    <Plus size={14} className="text-accent-amber" />
                  </div>
                  <span className="font-semibold text-sm">
                    {t('Quick Add Menu (+)', 'תפריט פעולות (+)')}
                  </span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">
                  {t(
                    'Appears on hover or tap on any day cell to quickly add entries, tahara events, or notes.',
                    'מופיע ברחיפה או לחיצה על יום בלוח ומאפשר להוסיף ראייה, אירוע טהרה או אירוע מותאם.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: FAQ & Halacha */}
        {activeTab === 'faq' && (
          <div className="space-y-4 text-sm leading-relaxed rounded-2xl border border-glass-border bg-glass-surface/15 p-4 sm:p-5">
            {/* Rabbinical Guidance Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <div className="font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{t('Important Halachic Disclaimer', 'הבהרה הלכתית חשובה')}</span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {t(
                  'Luach Tahara is an advanced digital assistant designed to calculate and track Taharat HaMishpacha according to general Halachic principles. However, algorithms do not replace personal rabbinical guidance. For any Halachic question, doubt, or irregular situation, always consult your Rav.',
                  'לוח טהרה הוא כלי עזר דיגיטלי מתקדם המסייע במעקב וחישוב עונות לפי כללי ההלכה. עם זאת, אין המערכת מהווה תחליף לפסיקת הלכה אישית של מורה הוראה. בכל שאלה, ספק, או מקרה חריג, יש לפנות לרב שלכם.'
                )}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1">
                <div className="font-semibold text-accent-amber">
                  {t(
                    'What if I made a mistake or entered the wrong onah?',
                    'מה עושים אם נפלה טעות בתאריך או בעונה?'
                  )}
                </div>
                <p className="text-xs opacity-85 leading-relaxed">
                  {t(
                    'You can click directly on the entry label on the calendar day, or click the Entries list button (List icon) in the header to edit or delete any entry at any time.',
                    'ניתן ללחוץ ישירות על תווית הראייה בלוח השנה, או ללחוץ על כפתור רשימת הראיות בסרגל העליון (סמל רשימה) כדי לערוך או למחוק את הראייה בכל עת.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1">
                <div className="font-semibold text-accent-amber">
                  {t(
                    'How do I adjust Halachic customs and stringencies?',
                    'כיצד מגדירים שיטות ומנהגי הלכה שונים?'
                  )}
                </div>
                <p className="text-xs opacity-85 leading-relaxed">
                  {t(
                    'Open Settings (via the hamburger menu on the left) and switch to the "Halacha" tab. There you can configure Ohr Zaru\'a, 24-hour Onah Beinonit, keeping day 31, and location-based zmanim.',
                    'פתחו את תפריט ההגדרות (סמל התפריט משמאל) ועברו ללשונית "הלכה". שם תוכלו להגדיר חישוב אור זרוע, עונה בינונית של 24 שעות, שמירת יום 31, וזמני הלכה לפי מיקומכם.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-glass-surface/30 border border-glass-border space-y-1">
                <div className="font-semibold text-accent-amber">
                  {t('Can I use Luach Tahara on my phone?', 'האם ניתן להשתמש בלוח טהרה גם בטלפון?')}
                </div>
                <p className="text-xs opacity-85 leading-relaxed">
                  {t(
                    "Yes! Luach Tahara is fully responsive and installable as a Progressive Web App (PWA). You can add it to your phone's home screen and use it offline.",
                    'בהחלט! לוח טהרה מותאם באופן מלא למכשירים ניידים וניתן להתקנה כאפליקציה (PWA). ניתן להוסיף אותו למסך הבית של הטלפון ולהשתמש בו גם ללא אינטרנט.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
