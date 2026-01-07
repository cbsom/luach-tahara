// Example component showing how to use i18n
import { useTranslation } from '@/i18n/hooks';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function I18nExample() {
  const { t } = useTranslation();

  return (
    <div>
      <header>
        <h1>{t('app.name')}</h1>
        <p>{t('app.tagline')}</p>
        <LanguageSwitcher />
      </header>

      <main>
        <section>
          <h2>{t('navigation.calendar')}</h2>
          <button>{t('common.save')}</button>
          <button>{t('common.cancel')}</button>
        </section>

        <section>
          <h2>{t('entry.title')}</h2>
          <p>
            {t('entry.onah')}: {t('entry.day')}
          </p>
          <p>{t('entry.haflaga')}: 30</p>
        </section>

        <section>
          <h2>{t('kavuah.title')}</h2>
          <p>{t('kavuah.types.haflagah')}</p>
          <p>{t('kavuah.types.dayOfMonth')}</p>
        </section>
      </main>
    </div>
  );
}
