# Luach Tahara

A modern Progressive Web App (PWA) for Jewish women's Halachic calendar tracking.

## 🎯 Features

- ✅ **Entries Management** - Track periods with Jewish/Secular dates
- ✅ **Kavuah Detection** - Automatic pattern recognition
- ✅ **Flagged Dates** - Halachic restriction calculations
- ✅ **Tahara Events** - Hefsek Tahara, Shailah, and Mikvah tracking
- ✅ **Zmanim** - Prayer times for any location
- ✅ **100% Offline** - Works without internet
- ✅ **Cloud Sync** - Optional Google sign-in and multi-device sync
- ✅ **PWA** - Installable on all platforms

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── assets/          # Images and styles
├── components/      # React components
│   ├── layout/
│   ├── entries/
│   ├── kavuahs/
│   ├── occasions/
│   ├── tahara/
│   ├── calendar/
│   ├── settings/
│   └── common/
├── lib/             # Core libraries
│   ├── jcal/        # Jewish calendar (uses jcal-zmanim)
│   ├── chashavshavon/  # Niddah calculations
│   └── utils/       # Utilities
├── pages/           # Page components
├── services/        # Business logic
│   ├── db/          # IndexedDB
│   ├── firebase/    # Firebase integration
│   ├── sync/        # Sync engine
│   └── notifications/  # Push notifications
├── stores/          # Zustand state stores
├── hooks/           # Custom React hooks
└── types/           # TypeScript types
```

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router v7** - Routing
- **Zustand** - State management
- **IndexedDB** - Local storage
- **Firebase** - Cloud sync & auth
- **jcal-zmanim** - Jewish calendar calculations
- **Vite PWA** - Progressive Web App features

## 🔧 Configuration

1. Copy `.env.example` to `.env`
2. Update Firebase credentials (already configured for luach-web project)
3. Adjust any other settings as needed

## 📱 PWA Installation

The app can be installed on:

- ✅ Desktop (Windows, macOS, Linux)
- ✅ Android (Chrome, Edge, Samsung Internet)
- ✅ iOS 16.4+ (Safari)

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📦 Building

```bash
# Build for production
npm run build

# The build output will be in the `dist` directory
```

## 🚀 Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy
```

## 📖 Documentation

- [Implementation Plan](../Luach_RN60/LUACH_TAHARA_IMPLEMENTATION_PLAN.md)
- [Technical Architecture](../Luach_RN60/TECHNICAL_ARCHITECTURE.md)
- [jcal-zmanim Usage Guide](../Luach_RN60/JCAL_ZMANIM_USAGE_GUIDE.md)

## 🤝 Contributing

This is a private project. For development guidelines, see the implementation plan.

## 📄 License

Private - All rights reserved

## 🙏 Acknowledgments

- Based on the Luach React Native app
- Uses the jcal-zmanim library for Jewish calendar calculations
- Firebase for backend services

---

**Version**: 1.0.0  
**Status**: In Development  
**Last Updated**: December 31, 2025
