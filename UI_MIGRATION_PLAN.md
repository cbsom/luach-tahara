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

- [ ] Replace our design-system.css with luach-web-base.css
- [ ] Adapt Header component for luach-tahara
- [ ] Adapt Calendar component for luach-tahara
- [ ] Add theme switcher (Warm, Dark, Light, Tcheles)
- [ ] Copy Modal, SettingsSidebar, MobileFooter components

### 2. Add Niddah-Specific Features

#### Entry Management

- [ ] Create EntryForm component (record ראיות)
  - Date picker (Jewish/Secular)
  - Onah selector (Day/Night)
  - Haflaga input
  - Ignore flags checkboxes
  - Comments field

#### Calendar Enhancements

- [ ] Color-code days based on niddah status
  - Red/Pink for niddah days
  - Green for permitted days
  - Yellow for flagged dates (זמני שמירה)
- [ ] Show entry indicators on calendar
- [ ] Show flagged date markers

#### Flagged Dates Display

- [ ] Create FlaggedDatesSidebar component
  - List of upcoming flagged dates
  - Onah Beinunis
  - Haflaga
  - Yom HaChodesh
  - Kavuah dates
- [ ] Show explanations for each flag

#### Kavuah Management

- [ ] Create KavuahList component
  - Display active kavuahs
  - Show kavuah type
  - Toggle active/inactive
  - Delete kavuah
- [ ] Create KavuahForm component
  - Kavuah type selector
  - Setting entry reference
  - Special number input
  - Cancels Onah Beinunis checkbox

#### Tahara Events

- [ ] Create TaharaEventForm component
  - Event type (Hefsek, Bedika, Shailah, Mikvah)
  - Date picker
  - Notes field
- [ ] Display tahara events on calendar
- [ ] Color-code tahara events

### 3. Settings Integration

- [ ] Copy SettingsSidebar from luach-web
- [ ] Add niddah-specific settings:
  - Haflaga onahs
  - Keep thirty-one
  - Ohr Zeruah
  - Dilug Chodesh past ends
  - Kavuah diff onahs
  - Haflaga of onahs
  - Number of months ahead to warn
  - Onah Beinunis 24 hours
  - Show Ohr Zeruah
  - Keep longer haflaga
  - No problems after entry

### 4. Mobile Optimization

- [ ] Copy MobileFooter component
- [ ] Ensure responsive design
- [ ] Test on mobile devices

### 5. Authentication UI

- [ ] Create Login component
- [ ] Create Signup component
- [ ] Integrate with Firebase auth hooks
- [ ] Add user profile display

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
