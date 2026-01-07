// jcal Library - Main Export
// All Jewish calendar and Zmanim helper functions

// Re-export types from jcal-zmanim
export type { Location } from 'jcal-zmanim';

// Date helpers
export {
    toJDate,
    fromJDate,
    getToday,
    jsDateToJewishDate,
    jewishDateToJsDate,
    formatJewishDate,
    formatSecularDate,
    addDays,
    addMonths,
    addYears,
    compareDates,
    areDatesEqual,
    daysBetween,
    getDayOfWeek,
    isShabbos,
    getDayName,
    getAbsoluteDay,
} from './dateHelpers';

// Zmanim helpers
export type { DailyZmanim, Time } from './zmanimHelpers';
export {
    getDailyZmanim,
    getSunrise,
    getSunset,
    getCandleLighting,
    getChatzos,
    getShaaZmanis,
    formatTime,
    formatTime24,
    isAfterSunset,
    isDaytime,
    getHalachicToday,
    timeToDate,
    dateToTime,
    isCurrentTimeAfter,
    isCurrentTimeBefore,
    isCurrentTimeBetween,
    getCurrentOnah,
    getTodaySunTimes,
    getOnahForDateTime,
} from './zmanimHelpers';

// Onah helpers
export type { OnahBoundaries } from './onahHelpers';
export {
    determineOnah,
    getOnahBoundaries,
    getOppositeOnah,
    formatOnah,
    getOnahIcon,
    getOnahForTime,
    isNearOnahBoundary,
} from './onahHelpers';

// Location helpers
export {
    getLocationByName,
    searchLocations,
    createLocation,
    getDefaultLocation,
    getPopularLocations,
    formatLocation,
    getLocationCoordinates,
    isInIsrael,
    getAllLocations,
    sortLocationsAlphabetically,
    groupLocationsByRegion,
} from './locationHelpers';

// Calendar utilities
export {
    getSedra,
    getDafYomi,
    isRoshChodesh,
    isLeapYear,
    getMonthName,
    getMonthNameHebrew,
    getHolidays,
    isYomTov,
    isCholHaMoed,
} from './calendarUtils';
