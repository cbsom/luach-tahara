# Luach Tahara

A modern web application for Jewish women's Halachic calendar tracking, built with React, TypeScript, and the `jcal-zmanim` library.

## 🎯 Overview

Luach Tahara is a comprehensive web-based tool for tracking the Jewish laws of family purity (Taharat HaMishpacha). It helps users manage entries (ראיות), calculate flagged dates (זמני שמירה), track patterns (וסתות/Kavuahs), and maintain tahara events (הפסק טהרה, בדיקות, מקווה).

This project is a modern web reimagining of the [Luach React Native app](https://github.com/cbsom/Luach_RN60), featuring a beautiful glassmorphism UI, full Hebrew/English bilingual support, and progressive web app capabilities.

## ✨ Current Features (Implemented)

### 🎨 UI/UX

- ✅ **Glassmorphism Design** - Modern, beautiful interface with glass-morphic effects
- ✅ **Multi-Theme System** - Four themes: Warm, Dark, Light, Tcheles
- ✅ **Bilingual Support** - Full Hebrew and English UI with RTL layout support
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ✅ **Progressive Web App** - Installable, works offline

### 📅 Calendar

- ✅ **CalendarDay Component** - Custom day cells with niddah-specific features:
  - Split background coloring for night/day onahs
  - Entry indicators with haflaga display
  - Days-since-entry counter
  - Flagged date warnings
  - Tahara event badges
  - Quick-add menu for entries and events
- ✅ **Jewish/Secular Toggle** - Switch between Hebrew and Gregorian calendars
- ✅ **Holiday Integration** - Displays Jewish holidays and Shabbos

### 📝 Entry Management

- ✅ **EntryForm Component** - Comprehensive form for recording ראיות:
  - Jewish and Secular date pickers
  - Night/Day onah selection with warnings
  - Sunrise/sunset time display
  - Comments field
  - Advanced options (ignore for flagged dates/kavuah)
  - Hefsek Tahara reminder settings
  - Auto-haflaga calculation
  - Full Hebrew/English translations

### 🗄️ Data Management

- ✅ **IndexedDB Integration** - Local storage with schema for:
  - Entries (ראיות)
  - Kavuahs (וסתות)
  - Tahara Events
  - Settings
  - User Events
- ✅ **Type-Safe Schema** - Full TypeScript definitions
- ✅ **NightDay Enum** - Consistent type system throughout

### 🔧 Core Infrastructure

- ✅ **jcal-zmanim Library** - Jewish calendar calculations
- ✅ **Chashavshavon Engine** - Halachic calculation engine:
  - Onah class for day/night periods
  - Entry class for period tracking
  - ProblemOnah for flagged dates
  - FlaggedDatesGenerator for calculating זמני שמירה
- ✅ **i18n System** - react-i18next for translations
- ✅ **Firebase Setup** - Authentication and cloud sync ready

## � In Progress

### 📊 Data Integration

- ⏳ Connecting EntryForm to IndexedDB
- ⏳ Implementing entry CRUD operations
- ⏳ Kavuah pattern detection and alerts
- ⏳ Flagged dates calculation and display

### 🎨 UI Components

- ⏳ Entry list view
- ⏳ Flagged dates sidebar
- ⏳ Kavuah management interface
- ⏳ Settings panel

## 🎯 Planned Features (Final Product)

### 📅 Complete Calendar System

- **Visual Indicators**:
  - Color-coded entries (red for ראיות)
  - Flagged dates (beige/yellow for זמני שמירה)
  - Tahara events (blue badges for הפסק טהרה, בדיקות, מקווה)
  - Holiday and Shabbos highlighting
  - Days-since-entry counter on each day
- **Interactive Features**:
  - Click any day to add entries or events
  - Drag to navigate months
  - Quick-add menu on each day
  - Date jump modal

### 📝 Entry Management

- **Full CRUD Operations**:
  - Add new entries with date, onah, and notes
  - Edit existing entries
  - Delete entries (with kavuah warning)
  - Duplicate detection
- **Smart Features**:
  - Auto-calculate haflaga from previous entry
  - Sunrise/sunset context for onah selection
  - Hefsek Tahara reminder scheduling
  - Advanced options for non-halachic entries

### 🔔 Kavuah Detection & Management

- **Pattern Recognition**:
  - Automatic detection of potential kavuahs
  - Haflaga patterns (interval-based)
  - Day of month patterns
  - Day of week patterns
  - Sirug patterns (alternating)
- **Smart Alerts**:
  - Broken kavuah warnings (3 out-of-pattern entries)
  - Reawakened kavuah suggestions
  - Out-of-pattern alerts for cancelling kavuahs
- **Management**:
  - Active/inactive kavuah toggling
  - Cancels Onah Beinonis setting
  - Setting entry tracking

### 📊 Flagged Dates (זמני שמירה)

- **Calculation Engine**:
  - Onah Beinonis (30-day average)
  - Haflaga patterns
  - Day of month (Yom HaChodesh)
  - Kavuah-based flagged dates
  - Dilug patterns
- **Display**:
  - Sidebar with upcoming flagged dates
  - Calendar highlighting
  - Detailed descriptions in Hebrew/English
  - Night/Day onah indicators

### 🛁 Tahara Events

- **Event Types**:
  - הפסק טהרה (Hefsek Tahara)
  - בדיקות (Bedikos/Checks)
  - שאלות (Shailos/Questions)
  - מקווה (Mikvah)
- **Features**:
  - Quick-add from calendar
  - Badge display on calendar days
  - Click to remove
  - Notes and timestamps

### ⚙️ Settings

- **Location Settings**:
  - City selection for zmanim
  - Custom location coordinates
  - Timezone handling
- **Calculation Settings**:
  - Kavuah calculation rules
  - Flagged date preferences
  - Onah Beinonis calculation method
- **Display Settings**:
  - Language (Hebrew/English)
  - Theme selection
  - Calendar view default
  - Date format preferences
- **Notifications**:
  - Hefsek Tahara reminders
  - Flagged date alerts
  - Discreet mode option

### 🔐 Authentication & Sync

- **Firebase Authentication**:
  - Email/password login
  - Google sign-in
  - Anonymous mode (local-only)
- **Cloud Sync**:
  - Automatic backup to Firestore
  - Multi-device synchronization
  - Conflict resolution
  - Manual backup/restore
- **Privacy**:
  - End-to-end encryption option
  - Local-first architecture
  - Optional cloud sync

### 📱 Progressive Web App

- **Offline Support**:
  - Service worker caching
  - Offline data access
  - Background sync when online
- **Installation**:
  - Add to home screen
  - Standalone app mode
  - App-like experience
- **Notifications**:
  - Push notifications for reminders
  - Flagged date alerts
  - Hefsek Tahara reminders

### 📊 Reports & Insights

- **Entry History**:
  - List view of all entries
  - Search and filter
  - Export to CSV/PDF
- **Pattern Analysis**:
  - Haflaga trends
  - Cycle length statistics
  - Kavuah history
- **Calendar Views**:
  - Month view
  - Year overview
  - Custom date ranges

## 🛠️ Technology Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling with CSS variables for theming

### Libraries

- **jcal-zmanim** - Jewish calendar and zmanim calculations
- **react-i18next** - Internationalization
- **lucide-react** - Icon system
- **nanoid** - ID generation
- **idb** - IndexedDB wrapper

### Backend/Services

- **Firebase** - Authentication and Firestore database
- **IndexedDB** - Local storage
- **Service Workers** - PWA and offline support

### Development

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📁 Project Structure

```
luach-tahara/
├── src/
│   ├── components/          # React components
│   │   ├── Calendar.tsx     # Main calendar grid
│   │   ├── CalendarDay.tsx  # Individual day cell
│   │   ├── CalendarWrapper.tsx
│   │   ├── EntryForm.tsx    # Entry creation/editing
│   │   ├── Header.tsx       # App header
│   │   ├── MobileFooter.tsx # Mobile navigation
│   │   └── Modal.tsx        # Modal dialogs
│   ├── lib/
│   │   ├── chashavshavon/   # Halachic calculation engine
│   │   │   ├── Entry.ts
│   │   │   ├── Onah.ts
│   │   │   ├── ProblemOnah.ts
│   │   │   ├── FlaggedDatesGenerator.ts
│   │   │   └── Kavuah.ts
│   │   └── jcal/            # Jewish calendar helpers
│   ├── services/
│   │   ├── db/              # IndexedDB services
│   │   │   ├── schema.ts
│   │   │   ├── entryService.ts
│   │   │   └── hooks.ts
│   │   └── firebase/        # Firebase integration
│   ├── types/               # TypeScript definitions
│   ├── i18n/                # Translations
│   ├── styles/              # Global styles
│   └── App.tsx              # Main app component
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cbsom/luach-tahara.git
cd luach-tahara

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

### Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

The app can be deployed to any static hosting service:

- **Vercel** (recommended)
- **Netlify**
- **Firebase Hosting**
- **GitHub Pages**

## 📖 Documentation

- [Implementation Plan](./CALENDAR_DAY_IMPLEMENTATION.md) - Calendar day feature details
- [Integration Guide](./CALENDAR_DAY_INTEGRATION.md) - How to integrate components
- [Entry Form Plan](./ENTRY_FORM_PLAN.md) - Entry form specifications
- [Translations](./ENTRY_FORM_TRANSLATIONS.md) - Hebrew/English translations

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Please open an issue to discuss any changes.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Based on the [Luach React Native app](https://github.com/cbsom/Luach_RN60)
- Uses the [jcal-zmanim](https://github.com/cbsom/jcal-zmanim) library
- Inspired by the need for a modern, accessible tahara tracking tool

## 📞 Contact

For questions or support, please contact: luach@compute.co.il

---

**Note**: This is an active development project. Features are being added regularly. See the [Current Features](#-current-features-implemented) section for what's already working.
