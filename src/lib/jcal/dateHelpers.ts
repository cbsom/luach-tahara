// Jewish Date Helper Functions using jcal-zmanim
import { jDate } from 'jcal-zmanim';
import { JewishDate } from '@/types';

/**
 * Convert JewishDate interface to jDate object
 */
export const toJDate = (jewishDate: JewishDate | jDate): jDate => {
    // Check if it's already a jDate class (capitalized properties)
    if ((jewishDate as any).Year) {
        const jd = jewishDate as jDate;
        return new jDate(jd.Year, jd.Month, jd.Day);
    }
    const interfaceDate = jewishDate as JewishDate;
    return new jDate(interfaceDate.year, interfaceDate.month, interfaceDate.day);
};

/**
 * Convert jDate object to JewishDate interface
 */
export const fromJDate = (jd: jDate): JewishDate => {
    return {
        year: jd.Year,
        month: jd.Month,
        day: jd.Day,
    };
};

/**
 * Get today's Jewish date
 */
export const getToday = (): JewishDate => {
    const today = new jDate();
    return fromJDate(today);
};

/**
 * Convert JavaScript Date to JewishDate
 */
export const jsDateToJewishDate = (date: Date): JewishDate => {
    const jd = new jDate(date);
    return fromJDate(jd);
};

/**
 * Convert JewishDate to JavaScript Date
 */
export const jewishDateToJsDate = (jewishDate: JewishDate): Date => {
    const jd = toJDate(jewishDate);
    return jd.getDate();
};

/**
 * Format Jewish date as string
 * @param includeYear Whether to include the year in the output
 */
export const formatJewishDate = (jewishDate: JewishDate, includeYear = true): string => {
    const months = [
        '',
        'Nissan',
        'Iyar',
        'Sivan',
        'Tammuz',
        'Av',
        'Elul',
        'Tishrei',
        'Cheshvan',
        'Kislev',
        'Teves',
        'Shvat',
        'Adar',
        'Adar I',
        'Adar II',
    ];

    const day = jewishDate.day;
    const month = months[jewishDate.month] || 'Unknown';
    const year = jewishDate.year;

    if (includeYear) {
        return `${day} ${month} ${year}`;
    }
    return `${day} ${month}`;
};

/**
 * Format secular date as string
 */
export const formatSecularDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Add days to a Jewish date
 */
export const addDays = (jewishDate: JewishDate, days: number): JewishDate => {
    const jd = toJDate(jewishDate);
    const newJd = jd.addDays(days);
    return fromJDate(newJd);
};

/**
 * Add months to a Jewish date
 */
export const addMonths = (jewishDate: JewishDate, months: number): JewishDate => {
    const jd = toJDate(jewishDate);
    const newJd = jd.addMonths(months);
    return fromJDate(newJd);
};

/**
 * Add years to a Jewish date
 */
export const addYears = (jewishDate: JewishDate, years: number): JewishDate => {
    const jd = toJDate(jewishDate);
    const newJd = jd.addYears(years);
    return fromJDate(newJd);
};

/**
 * Compare two Jewish dates
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDates = (date1: JewishDate, date2: JewishDate): number => {
    const jd1 = toJDate(date1);
    const jd2 = toJDate(date2);

    if (jd1.Abs < jd2.Abs) return -1;
    if (jd1.Abs > jd2.Abs) return 1;
    return 0;
};

/**
 * Check if two Jewish dates are equal
 */
export const areDatesEqual = (date1: JewishDate, date2: JewishDate): boolean => {
    return compareDates(date1, date2) === 0;
};

/**
 * Get the difference in days between two Jewish dates
 */
export const daysBetween = (date1: JewishDate, date2: JewishDate): number => {
    const jd1 = toJDate(date1);
    const jd2 = toJDate(date2);
    return Math.abs(jd2.Abs - jd1.Abs);
};

/**
 * Get the day of the week (0 = Sunday, 6 = Shabbos)
 */
export const getDayOfWeek = (jewishDate: JewishDate): number => {
    const jd = toJDate(jewishDate);
    return jd.DayOfWeek;
};

/**
 * Check if a date is Shabbos
 */
export const isShabbos = (jewishDate: JewishDate): boolean => {
    return getDayOfWeek(jewishDate) === 6;
};

/**
 * Get the name of the day of the week
 */
export const getDayName = (jewishDate: JewishDate): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbos'];
    return days[getDayOfWeek(jewishDate)];
};

/**
 * Get the absolute day number (for comparisons)
 */
export const getAbsoluteDay = (jewishDate: JewishDate): number => {
    const jd = toJDate(jewishDate);
    return jd.Abs;
};
