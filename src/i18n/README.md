# Internationalization (i18n) Setup

This project uses `react-i18next` for internationalization with support for English and Hebrew (including RTL).

## Features

- ✅ English and Hebrew translations
- ✅ Automatic language detection
- ✅ localStorage persistence
- ✅ RTL (Right-to-Left) support for Hebrew
- ✅ Type-safe translations with TypeScript
- ✅ Language switcher component

## Usage

### Basic Translation

```typescript
import { useTranslation } from '@/i18n/hooks';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('common.save')}</p>
    </div>
  );
}
```

### Language Switcher

```typescript
import LanguageSwitcher from '@/components/LanguageSwitcher';

function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### Custom Hooks

```typescript
import { useCurrentLanguage, useIsRTL, useChangeLanguage } from '@/i18n/hooks';

function MyComponent() {
  const currentLang = useCurrentLanguage(); // 'en' or 'he'
  const isRTL = useIsRTL(); // true if Hebrew
  const changeLanguage = useChangeLanguage();

  // Change language programmatically
  changeLanguage('he');
}
```

### Interpolation

```typescript
// In translation file:
{
  "welcome": "Welcome, {{name}}!"
}

// In component:
t('welcome', { name: 'Sarah' }) // "Welcome, Sarah!"
```

### Pluralization

```typescript
// In translation file:
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}

// In component:
t('items', { count: 1 }) // "1 item"
t('items', { count: 5 }) // "5 items"
```

## Adding New Translations

1. Add keys to `src/i18n/locales/en/translation.json`
2. Add corresponding Hebrew translations to `src/i18n/locales/he/translation.json`
3. TypeScript will automatically provide autocomplete for the new keys

## RTL Support

The app automatically switches to RTL mode when Hebrew is selected:

- `document.documentElement.dir` is set to `'rtl'`
- Hebrew-specific fonts are applied
- Layout automatically mirrors

## File Structure

```
src/
├── i18n/
│   ├── config.ts              # i18next configuration
│   ├── hooks.ts               # Custom hooks
│   ├── index.ts               # Exports
│   ├── i18next.d.ts          # TypeScript definitions
│   └── locales/
│       ├── en/
│       │   └── translation.json
│       └── he/
│           └── translation.json
└── components/
    └── LanguageSwitcher/
        ├── LanguageSwitcher.tsx
        ├── LanguageSwitcher.css
        └── index.ts
```

## Supported Languages

- **English** (`en`) - Default
- **Hebrew** (`he`) - RTL support

## Translation Keys Structure

```
app.*              - App-level strings
common.*           - Common UI elements
navigation.*       - Navigation items
calendar.*         - Calendar-related
entry.*            - Entry/Vesset tracking
kavuah.*           - Kavuah patterns
flaggedDates.*     - Flagged dates/Zmanim
settings.*         - Settings page
errors.*           - Error messages
dates.*            - Date formatting
```
