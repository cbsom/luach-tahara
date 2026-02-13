// Type Definitions for Luach Tahara
/**
 * Enum for Night/Day
 * Night = -1, Day = 1
 */
export enum NightDay {
    Night = -1,
    Day = 1,
}

/**
 * Jewish Date representation
 */
export interface JewishDate {
    year: number;
    month: number;
    day: number;
}

/**
 * Entry (Period) Model
 */
export interface Entry {
    id: string;
    date: JewishDate;
    onah: NightDay;
    haflaga?: number;
    ignoreForFlaggedDates: boolean;
    ignoreForKavuah: boolean;
    notes?: string;
    hefsekTaharaReminder?: {
        daysAfter: number;
        timeOfDay: string;
    };
    createdAt: number;
    updatedAt: number;
    syncedAt?: number;
}

/**
 * Kavuah Type
 */
export type KavuahType = 'haflaga' | 'dayOfMonth' | 'dayOfWeek' | 'sirug';

/**
 * Kavuah (Pattern) Model
 */
export interface Kavuah {
    id: string;
    type: KavuahType;
    settingEntryId: string;
    pattern: any; // Specific to type
    active: boolean;
    cancelsOnahBeinunis: boolean;
    specialCircumstances?: string;
    createdAt: number;
    updatedAt: number;
    syncedAt?: number;
}

/**
 * Tahara Event Type
 */
export type TaharaEventType = 'hefsek' | 'bedika' | 'shailah' | 'mikvah';

/**
 * Tahara Event Model
 */
export interface TaharaEvent {
    id: string;
    date: JewishDate;
    type: TaharaEventType;
    entryId?: string;
    notes?: string;
    createdAt: number;
    updatedAt: number;
    syncedAt?: number;
}

/**
 * User Occasion Model
 */
export interface UserOccasion {
    id: string;
    title: string;
    date: JewishDate | Date;
    color: string;
    recurring: boolean;
    notes?: string;
    createdAt: number;
    updatedAt: number;
    syncedAt?: number;
}

/**
 * Location Model
 */
export interface Location {
    name: string;
    latitude: number;
    longitude: number;
    utcOffset: number;
    elevation?: number;
    israel?: boolean;
}

/**
 * Settings Model
 */
export interface Settings {
    location: Location;
    showFlagsOnMainScreen: boolean;
    showEntryInfo: boolean;
    hideFlagsWeekAfterEntry: boolean;
    calendarDisplaysCurrent: 'jewish' | 'secular';
    discreetReminders: boolean;
    haflagaOnahs: number;
    keepThirtyOne: boolean;
    ohrZeruah: boolean;
    dilugChodeshPastEnds: boolean;
    /** Allow Kavuahs even when onahs (day/night) are different (more stringent opinion) */
    kavuahDiffOnahs: boolean;
    /** Calculate Haflaga of Onahs Kavuahs (Shulchan Aruch Harav) */
    haflagaOfOnahs: boolean;
    /** Number of months ahead to calculate flagged dates */
    numberMonthsAheadToWarn: number;
    /** Keep Onah Beinonis for 24 hours (both day and night) */
    onahBeinunis24Hours: boolean;
    /** Show Ohr Zarua (previous onah) for flagged dates */
    showOhrZeruah: boolean;
    /** Keep longer Haflagas that were never overridden (Ta"z) */
    keepLongerHaflagah: boolean;
    /** Don't show problems in the week after an entry */
    noProbsAfterEntry: boolean;
    /** Use 4 days for Hefsek Tahara instead of 5 (Common Sephardic custom) */
    fourDaysHefsek?: boolean;
    createdAt: number;
    updatedAt: number;
    syncedAt?: number;
}

/**
 * Sync Metadata
 */
export interface SyncMetadata {
    lastSync: number;
    pendingChanges: number;
}
