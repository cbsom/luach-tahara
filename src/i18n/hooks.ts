// Custom hook wrapper for useTranslation with type safety
import { useTranslation as useTranslationOriginal } from 'react-i18next';

/**
 * Type-safe wrapper for useTranslation hook
 * Provides autocomplete for translation keys
 */
export const useTranslation = () => {
    return useTranslationOriginal();
};

/**
 * Get current language code
 */
export const useCurrentLanguage = () => {
    const { i18n } = useTranslation();
    return i18n.language;
};

/**
 * Check if current language is RTL
 */
export const useIsRTL = () => {
    const { i18n } = useTranslation();
    return i18n.language === 'he';
};

/**
 * Change language programmatically
 */
export const useChangeLanguage = () => {
    const { i18n } = useTranslation();

    return (languageCode: string) => {
        i18n.changeLanguage(languageCode);
        document.documentElement.dir = languageCode === 'he' ? 'rtl' : 'ltr';
        document.documentElement.lang = languageCode;
    };
};
