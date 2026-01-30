import React from 'react';
import { Modal } from '../Modal';
import { useKavuahs } from '../../services/db/hooks';
import { Trash2, CheckCircle, Ban, Activity } from 'lucide-react';
import { KavuahTypes } from '../../lib/chashavshavon/Kavuah';
import type { KavuahRecord } from '../../services/db/kavuahService';
import { KavuahForm } from './KavuahForm';
import { Plus } from 'lucide-react';

interface KavuahListProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'he';
}

export const KavuahList: React.FC<KavuahListProps> = ({ isOpen, onClose, lang }) => {
  const { kavuahs, loading, removeKavuah, toggleActive, addKavuah } = useKavuahs(false);
  const [isAdding, setIsAdding] = React.useState(false);

  if (!isOpen) return null;

  const t = (en: string, he: string) => (lang === 'he' ? he : en);

  const getKavuahTypeName = (type: number) => {
    switch (type) {
      case KavuahTypes.Haflagah:
        return t('Haflaga', 'הפלגה');
      case KavuahTypes.DayOfMonth:
        return t('Day of Month', 'יום החודש');
      case KavuahTypes.DayOfWeek:
        return t('Day of Week', 'יום בשבוע');
      default:
        return t('Unknown', 'לא ידוע');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        t('Are you sure you want to delete this Kavuah?', 'האם את בטוחה שברצונך למחוק וסת זה?')
      )
    ) {
      await removeKavuah(id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Kavuah List', 'רשימת וסתות')}
      className="kavuah-list-modal"
      maxWidth="600px"
    >
      <div className="flex flex-col h-full max-h-[70vh]">
        {isAdding ? (
          <KavuahForm
            lang={lang}
            onCancel={() => setIsAdding(false)}
            onSave={async data => {
              await addKavuah(data);
              setIsAdding(false);
            }}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4 px-1">
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent-amber text-white text-sm rounded-lg hover:bg-opacity-90"
              >
                <Plus size={16} />
                {t('Add Kavuah', 'הוסף וסת')}
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center p-8">
                <span className="opacity-70 animate-pulse">{t('Loading...', 'טוען...')}</span>
              </div>
            ) : kavuahs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center opacity-60">
                <Activity size={48} className="mb-4 text-glass-border" />
                <p>{t('No Kavuahs found', 'לא נמצאו וסתות')}</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-3 p-1">
                {kavuahs.map((kavuah: KavuahRecord) => (
                  <div
                    key={kavuah.id}
                    className={`bg-glass-overlay p-4 rounded-lg flex items-center justify-between transition-all ${
                      !kavuah.active ? 'opacity-60 grayscale' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">
                        {getKavuahTypeName(kavuah.kavuahType)}
                      </span>
                      <span className="text-xs opacity-70">
                        {t('Special Number:', 'מספר מיוחד:')} {kavuah.specialNumber}
                      </span>
                      {kavuah.cancelsOnahBeinunis && (
                        <span className="text-xs text-accent-coral mt-1">
                          {t('Cancels Onah Beinunis', 'מבטל עונה בינונית')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(kavuah.id)}
                        className={`p-2 rounded-full transition-colors ${
                          kavuah.active
                            ? 'bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30'
                            : 'bg-glass-border text-text-secondary hover:bg-glass-surface'
                        }`}
                        title={
                          kavuah.active ? t('Deactivate', 'הפוך ללא פעיל') : t('Activate', 'הפעל')
                        }
                      >
                        {kavuah.active ? <CheckCircle size={18} /> : <Ban size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(kavuah.id)}
                        className="p-2 rounded-full bg-accent-coral/10 text-accent-coral hover:bg-accent-coral/20 transition-colors"
                        title={t('Delete', 'מחק')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
