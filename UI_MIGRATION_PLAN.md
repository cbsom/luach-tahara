# UI Migration from Luach-Web to Luach-Tahara

## ✅ Completed

### Files Copied

1. **Base CSS** - `luach-web-base.css` (glassmorphism design system)
2. **Header Component** - `Header.tsx`
3. **Calendar Component** - `Calendar.tsx`

### What Was Built Earlier

1. **Design System** - `design-system.css` (our initial attempt)
2. **Layout Component** - `Layout.tsx` and `Layout.css`
3. **Calendar Component** - `calendar/Calendar.tsx` (our initial version)
4. **i18n System** - Complete internationalization
5. **IndexedDB Service** - Complete offline storage
6. **Firebase Integration** - Authentication and sync

## 🎯 Next Steps

### 1. Integrate Luach-Web UI

- [x] Replace our design-system.css with luach-web-base.css
- [x] Adapt Header component for luach-tahara
- [x] Adapt Calendar component for luach-tahara
- [x] Add theme switcher (Warm, Dark, Light, Tcheles)
- [x] Copy Modal, SettingsSidebar, MobileFooter components

### 2. Add Niddah-Specific Features

#### Entry Management

- [x] Create EntryForm component (record ראיות)
  - [x] Date picker (Jewish/Secular)
  - [x] Onah selector (Day/Night)
  - [x] Haflaga input
  - [x] Ignore flags checkboxes
  - [x] Comments field

#### Calendar Enhancements

- [x] Color-code days based on niddah status
  - [x] Red/Pink for niddah days
  - [x] Green for permitted days (implemented via StatusCalculator)
  - [x] Yellow for flagged dates (זמני שמירה)
- [x] Show entry indicators on calendar
- [x] Show flagged date markers

#### Flagged Dates Display

- [x] Create FlaggedDatesSidebar component
  - [x] List of upcoming flagged dates
  - [x] Onah Beinunis
  - [x] Haflaga
  - [x] Yom HaChodesh
  - [x] Kavuah dates
- [x] Show explanations for each flag

#### Kavuah Management

- [x] Create KavuahList component
  - [x] Display active kavuahs
  - [x] Show kavuah type
  - [x] Toggle active/inactive
  - [x] Delete kavuah
- [x] Create KavuahForm component
  - [x] Kavuah type selector
  - [x] Setting entry reference
  - [x] Special number input
  - [x] Cancels Onah Beinunis checkbox

#### Tahara Events

- [x] Create TaharaEventForm component (Implemented via Calendar handlers/EntryForm extensions)
  - [x] Event type (Hefsek, Bedika, Shailah, Mikvah)
  - [x] Date picker
  - [x] Notes field
- [x] Display tahara events on calendar
- [x] Color-code tahara events (via Icons/Badges)

### 3. Settings Integration

- [x] Copy SettingsSidebar from luach-web
- [x] Add niddah-specific settings:
  - [x] Haflaga onahs
  - [x] Keep thirty-one
  - [x] Ohr Zeruah
  - [x] Dilug Chodesh past ends
  - [x] Kavuah diff onahs
  - [x] Haflaga of onahs
  - [x] Number of months ahead to warn
  - [x] Onah Beinunis 24 hours
  - [x] Show Ohr Zeruah
  - [x] Keep longer haflaga
  - [x] No problems after entry

### 4. Mobile Optimization

- [x] Copy MobileFooter component
- [x] Ensure responsive design (Added mobile-footer styles)
- [ ] Test on mobile devices

### 5. Authentication UI

- [x] Create Login component
- [x] Create Signup component
- [x] Integrate with Firebase auth hooks
- [x] Add user profile display

## 📁 File Structure

```
src/
├── components/
│   ├── Header.tsx (✅ copied)
│   ├── Calendar.tsx (✅ copied)
│   ├── Modal.tsx (⏳ to copy)
│   ├── SettingsSidebar.tsx (⏳ to copy)
│   ├── MobileFooter.tsx (⏳ to copy)
│   ├── entries/
│   │   ├── EntryForm.tsx (🆕 to create)
│   │   └── EntryList.tsx (🆕 to create)
│   ├── kavuahs/
│   │   ├── KavuahList.tsx (🆕 to create)
│   │   └── KavuahForm.tsx (🆕 to create)
│   ├── tahara/
│   │   ├── TaharaEventForm.tsx (🆕 to create)
│   │   └── TaharaEventList.tsx (🆕 to create)
│   └── flagged-dates/
│       └── FlaggedDatesSidebar.tsx (🆕 to create)
├── styles/
│   ├── luach-web-base.css (✅ copied)
│   └── niddah-specific.css (🆕 to create)
└── ...
```

## 🎨 Design Decisions

### Color Coding for Niddah Status

- **Red/Pink** - Niddah days (not permitted)
- **Green** - Permitted days
- **Yellow** - Flagged dates (זמני שמירה)
- **Blue** - Tahara events
- **Purple** - Kavuah dates

### Theme Integration

Use luach-web's theme system:

- Warm (default) - cozy brown tones
- Dark - pure dark mode
- Light - clean white
- Tcheles - sky blue theme

### Icons

Use simple emoji or Unicode symbols:

- 🔴 Entry (ראיה)
- 💧 Hefsek Tahara
- ✓ Bedika
- ❓ Shailah
- 🌊 Mikvah
- ⚠️ Flagged date

## 🔄 Migration Strategy

1. **Phase 1: Core UI** (Current)
   - Copy base components
   - Integrate theme system
   - Test basic functionality

2. **Phase 2: Niddah Features**
   - Add entry management
   - Implement flagged dates
   - Add kavuah system

3. **Phase 3: Polish**
   - Mobile optimization
   - Authentication UI
   - Settings integration

4. **Phase 4: Testing**
   - Test all features
   - Fix bugs
   - Optimize performance

## 📝 Notes

- Luach-web uses a beautiful glassmorphism design
- The theme system is well-implemented
- Calendar grid is responsive and performant
- Modal system is clean and reusable
- Settings sidebar has good UX

## 🚀 Ready to Proceed

We have all the pieces. Next step is to integrate the luach-web UI and start adding niddah-specific features.
