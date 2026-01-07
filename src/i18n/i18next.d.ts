// TypeScript type definitions for i18next
import 'react-i18next';
import type enTranslations from './locales/en/translation.json';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: typeof enTranslations;
        };
    }
}
