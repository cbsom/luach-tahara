// Zmanim (Prayer Times) Helper Functions using jcal-zmanim
import { jDate, Location, Zmanim } from 'jcal-zmanim';
import { JewishDate } from '@/types';
import { toJDate } from './dateHelpers';

/**
 * Time interface from jcal-zmanim
 */
export interface Time {
    hour: number;
    minute: number;
    second?: number;
}

/**
 * Daily Zmanim interface
 */
export interface DailyZmanim {
    sunrise: Time;
    sunset: Time;
    chatzos: Time;
    shaaZmanis: number; // Length of sha'a zmanis in seconds
    candleLighting?: Time;
}

/**
 * Convert Time object to Date object for a specific date
 * @param time The Time object (hour, minute, second)
 * @param date Optional date to use (defaults to today)
 */
export const timeToDate = (time: Time, date?: Date): Date => {
    const baseDate = date || new Date();
    return new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        time.hour,
        time.minute,
        time.second || 0
    );
};

/**
 * Convert Date object to Time object
 */
export const dateToTime = (date: Date): Time => {
    return {
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
    };
};

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
            `This location is within the ${region} Circle (latitude ${location.Latitude.toFixed(2)}°), ` +
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
 * Compare current time with a Time object
 * @returns true if current time is after the given time
 */
export const isCurrentTimeAfter = (time: Time): boolean => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const timeMinutes = time.hour * 60 + time.minute;
    return currentMinutes >= timeMinutes;
};

/**
 * Compare current time with a Time object
 * @returns true if current time is before the given time
 */
export const isCurrentTimeBefore = (time: Time): boolean => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const timeMinutes = time.hour * 60 + time.minute;
    return currentMinutes < timeMinutes;
};

/**
 * Check if current time is between two Time objects
 */
export const isCurrentTimeBetween = (startTime: Time, endTime: Time): boolean => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startTime.hour * 60 + startTime.minute;
    const endMinutes = endTime.hour * 60 + endTime.minute;
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

/**
 * Get all Zmanim for a specific date and location
 * @throws {Error} If sunrise/sunset cannot be calculated (e.g., polar regions)
 */
export const getDailyZmanim = (
    jewishDate: JewishDate,
    location: Location,
    isFriday = false
): DailyZmanim => {
    const jd = toJDate(jewishDate);
    const sunTimes = Zmanim.getSunTimes(jd, location);

    if (!sunTimes.sunrise || !sunTimes.sunset) {
        throw new Error(
            `Cannot calculate sun times for this location and date. ` +
            `This may occur in polar regions during certain times of the year.`
        );
    }

    const chatzos = Zmanim.getChatzos(jd, location);
    const shaaZmanis = Zmanim.getShaaZmanis(jd, location, 0);

    return {
        sunrise: sunTimes.sunrise,
        sunset: sunTimes.sunset,
        chatzos,
        shaaZmanis,
        candleLighting: isFriday ? Zmanim.getCandleLighting(jd, location) : undefined,
    };
};

/**
 * Get sunrise time for a date and location
 * @throws {Error} If sunrise cannot be calculated
 */
export const getSunrise = (jewishDate: JewishDate, location: Location): Time => {
    const jd = toJDate(jewishDate);
    const sunTimes = Zmanim.getSunTimes(jd, location);

    if (!sunTimes.sunrise) {
        throw new Error('Cannot calculate sunrise for this location and date');
    }

    return sunTimes.sunrise;
};

/**
 * Get sunset time for a date and location
 * @throws {Error} If sunset cannot be calculated
 */
export const getSunset = (jewishDate: JewishDate, location: Location): Time => {
    const jd = toJDate(jewishDate);
    const sunTimes = Zmanim.getSunTimes(jd, location);

    if (!sunTimes.sunset) {
        throw new Error('Cannot calculate sunset for this location and date');
    }

    return sunTimes.sunset;
};

/**
 * Get candle lighting time
 * May return undefined if candle lighting cannot be calculated
 */
export const getCandleLighting = (jewishDate: JewishDate, location: Location): Time | undefined => {
    const jd = toJDate(jewishDate);
    return Zmanim.getCandleLighting(jd, location);
};

/**
 * Get Chatzos (midday) time
 */
export const getChatzos = (jewishDate: JewishDate, location: Location): Time => {
    const jd = toJDate(jewishDate);
    return Zmanim.getChatzos(jd, location);
};

/**
 * Get Sha'a Zmanis (halachic hour) in seconds
 */
export const getShaaZmanis = (jewishDate: JewishDate, location: Location): number => {
    const jd = toJDate(jewishDate);
    return Zmanim.getShaaZmanis(jd, location, 0);
};

/**
 * Format time as string (e.g., "7:45 PM")
 */
export const formatTime = (time: Time): string => {
    const date = timeToDate(time);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format time in 24-hour format (e.g., "19:45")
 */
export const formatTime24 = (time: Time): string => {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
};

/**
 * Check if current time is after sunset for a location
 * Used to determine if we should show the next Jewish day
 * @throws {Error} If sunset cannot be calculated
 */
export const isAfterSunset = (location: Location): boolean => {
    const today = new jDate();
    const sunTimes = Zmanim.getSunTimes(today, location);

    if (!sunTimes.sunset) {
        throw new Error('Cannot calculate sunset for this location');
    }

    return isCurrentTimeAfter(sunTimes.sunset);
};

/**
 * Check if current time is between sunrise and sunset (daytime)
 * @throws {Error} If sun times cannot be calculated
 */
export const isDaytime = (location: Location): boolean => {
    const today = new jDate();
    const sunTimes = Zmanim.getSunTimes(today, location);

    if (!sunTimes.sunrise || !sunTimes.sunset) {
        throw new Error('Cannot calculate sun times for this location');
    }

    return isCurrentTimeBetween(sunTimes.sunrise, sunTimes.sunset);
};

/**
 * Get the current Halachic "today" based on sunset
 * If after sunset, returns tomorrow's Jewish date
 */
export const getHalachicToday = (location: Location): JewishDate => {
    const today = new jDate();

    if (isAfterSunset(location)) {
        const tomorrow = today.addDays(1);
        return {
            year: tomorrow.Year,
            month: tomorrow.Month,
            day: tomorrow.Day,
        };
    }

    return {
        year: today.Year,
        month: today.Month,
        day: today.Day,
    };
};

/**
 * Get the current Onah (day or night) based on current time and location
 * This is crucial for Entry tracking
 */
export const getCurrentOnah = (location: Location): 'day' | 'night' => {
    return isDaytime(location) ? 'day' : 'night';
};

/**
 * Get sunrise and sunset times for today at a location
 * Returns as Date objects for easier comparison
 * @throws {Error} If sun times cannot be calculated
 */
export const getTodaySunTimes = (location: Location): { sunrise: Date; sunset: Date } => {
    const today = new jDate();
    const sunTimes = Zmanim.getSunTimes(today, location);

    if (!sunTimes.sunrise || !sunTimes.sunset) {
        throw new Error('Cannot calculate sun times for this location');
    }

    const baseDate = new Date();

    return {
        sunrise: timeToDate(sunTimes.sunrise, baseDate),
        sunset: timeToDate(sunTimes.sunset, baseDate),
    };
};

/**
 * Determine if a specific Date/Time was during day or night onah
 * @param dateTime The JavaScript Date object representing when the entry occurred
 * @param location The location for calculating sunrise/sunset
 * @throws {Error} If sun times cannot be calculated
 */
export const getOnahForDateTime = (dateTime: Date, location: Location): 'day' | 'night' => {
    // Get the Jewish date for this dateTime
    const jd = new jDate(dateTime);
    const sunTimes = Zmanim.getSunTimes(jd, location);

    if (!sunTimes.sunrise || !sunTimes.sunset) {
        throw new Error(getSunTimeErrorMessage(location, !sunTimes.sunrise, !sunTimes.sunset));
    }

    // Convert Time objects to minutes for comparison
    const timeMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();
    const sunriseMinutes = sunTimes.sunrise.hour * 60 + sunTimes.sunrise.minute;
    const sunsetMinutes = sunTimes.sunset.hour * 60 + sunTimes.sunset.minute;

    // If time is between sunrise and sunset, it's day onah
    if (timeMinutes >= sunriseMinutes && timeMinutes < sunsetMinutes) {
        return 'day';
    }

    return 'night';
};
