// Onah (Day/Night) Helper Functions
import { Location, Zmanim } from 'jcal-zmanim';
import { JewishDate, NightDay } from '@/types';
import { toJDate } from './dateHelpers';
import { Time } from './zmanimHelpers';

/**
 * Check if a location is in a polar region
 * Arctic Circle: 66°33'N (66.55°)
 * Antarctic Circle: 66°33'S (-66.55°)
 */
const isPolarRegion = (latitude: number): boolean => {
    return Math.abs(latitude) >= 66.55;
};

/**
 * Generate appropriate error message for missing sun times
 */
const getSunTimeErrorMessage = (location: Location, missingSunrise: boolean, missingSunset: boolean): string => {
    const inPolarRegion = isPolarRegion(location.Latitude);

    if (inPolarRegion) {
        const region = location.Latitude > 0 ? 'Arctic' : 'Antarctic';
        const missing = missingSunrise && missingSunset ? 'sunrise and sunset' :
            missingSunrise ? 'sunrise' :
                'sunset';

        return `Cannot calculate ${missing} for this location and date. ` +
            `This location is in the ${region} Circle (latitude ${location.Latitude.toFixed(2)}°), ` +
            `where the sun may not rise or set during certain times of the year.`;
    }

    // Not in polar region - this is unexpected
    const missing = missingSunrise && missingSunset ? 'sunrise and sunset' :
        missingSunrise ? 'sunrise' :
            'sunset';

    return `Cannot calculate ${missing} for this location and date. ` +
        `This is unexpected for latitude ${location.Latitude.toFixed(2)}°. ` +
        `Please check the location settings.`;
};

/**
 * Onah boundaries (sunrise and sunset times)
 */
export interface OnahBoundaries {
    dayStart: Time;    // Sunrise
    nightStart: Time;  // Sunset
}

/**
 * Determine the Onah (day or night) based on a JavaScript Date and location
 * @param jsDate The JavaScript Date to check
 * @param location The location for calculating sunrise/sunset
 * @returns NightDay.Night or NightDay.Day
 * @throws {Error} If sun times cannot be calculated
 */
export const determineOnah = (jsDate: Date, location: Location): NightDay => {
    // Get the Jewish date for this time
    const jd = toJDate({
        year: jsDate.getFullYear(),
        month: jsDate.getMonth() + 1,
        day: jsDate.getDate(),
    });

    const sunTimes = Zmanim.getSunTimes(jd, location);

    if (!sunTimes.sunrise || !sunTimes.sunset) {
        throw new Error(getSunTimeErrorMessage(location, !sunTimes.sunrise, !sunTimes.sunset));
    }

    const currentMinutes = jsDate.getHours() * 60 + jsDate.getMinutes();
    const sunriseMinutes = sunTimes.sunrise.hour * 60 + sunTimes.sunrise.minute;
    const sunsetMinutes = sunTimes.sunset.hour * 60 + sunTimes.sunset.minute;

    // If time is between sunset and sunrise (next day), it's night onah
    if (currentMinutes >= sunsetMinutes || currentMinutes < sunriseMinutes) {
        return NightDay.Night;
    }

    // Otherwise it's day onah
    return NightDay.Day;
};

/**
 * Get the Onah boundaries (sunrise and sunset) for a Jewish date
 * @throws {Error} If sun times cannot be calculated
 */
export const getOnahBoundaries = (
    jewishDate: JewishDate,
    location: Location
): OnahBoundaries => {
    const jd = toJDate(jewishDate);
    const sunTimes = Zmanim.getSunTimes(jd, location);

    if (!sunTimes.sunrise || !sunTimes.sunset) {
        throw new Error(getSunTimeErrorMessage(location, !sunTimes.sunrise, !sunTimes.sunset));
    }

    return {
        dayStart: sunTimes.sunrise,
        nightStart: sunTimes.sunset,
    };
};

/**
 * Get the opposite Onah
 */
export const getOppositeOnah = (onah: NightDay): NightDay => {
    return onah === NightDay.Day ? NightDay.Night : NightDay.Day;
};

/**
 * Format Onah as display string
 */
export const formatOnah = (onah: NightDay): string => {
    return onah === NightDay.Day ? 'Day' : 'Night';
};

/**
 * Get Onah icon/emoji
 */
export const getOnahIcon = (onah: NightDay): string => {
    return onah === NightDay.Day ? '☀️' : '🌙';
};

/**
 * Calculate which Onah a specific time falls into for a given Jewish date
 * This is useful for determining the Onah of an Entry
 */
export const getOnahForTime = (
    time: Date,
    jewishDate: JewishDate,
    location: Location
): NightDay => {
    const boundaries = getOnahBoundaries(jewishDate, location);

    // Extract just the time portion for comparison
    const timeInMinutes = time.getHours() * 60 + time.getMinutes();
    const sunriseInMinutes = boundaries.dayStart.hour * 60 + boundaries.dayStart.minute;
    const sunsetInMinutes = boundaries.nightStart.hour * 60 + boundaries.nightStart.minute;

    // If time is between sunrise and sunset, it's day
    if (timeInMinutes >= sunriseInMinutes && timeInMinutes < sunsetInMinutes) {
        return NightDay.Day;
    }

    return NightDay.Night;
};

/**
 * Check if a time is close to an Onah boundary (within 15 minutes)
 * This is important for Halachic questions
 */
export const isNearOnahBoundary = (
    time: Date,
    jewishDate: JewishDate,
    location: Location,
    thresholdMinutes = 15
): boolean => {
    const boundaries = getOnahBoundaries(jewishDate, location);

    const timeInMinutes = time.getHours() * 60 + time.getMinutes();
    const sunriseInMinutes = boundaries.dayStart.hour * 60 + boundaries.dayStart.minute;
    const sunsetInMinutes = boundaries.nightStart.hour * 60 + boundaries.nightStart.minute;

    const timeDiffFromSunrise = Math.abs(timeInMinutes - sunriseInMinutes);
    const timeDiffFromSunset = Math.abs(timeInMinutes - sunsetInMinutes);

    return timeDiffFromSunrise <= thresholdMinutes || timeDiffFromSunset <= thresholdMinutes;
};
