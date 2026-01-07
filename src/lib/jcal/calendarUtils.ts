// Calendar Utilities - Sedra, Daf Yomi, Holidays
import { jDate, Sedra, Dafyomi } from 'jcal-zmanim';
import { JewishDate } from '@/types';
import { toJDate } from './dateHelpers';

/**
 * Get the Torah portion (Sedra) for a Jewish date
 * @param jewishDate The Jewish date
 * @param israel Whether to use Israel calendar (true) or diaspora (false)
 */
export const getSedra = (jewishDate: JewishDate, israel = false): string => {
    const jd = toJDate(jewishDate);
    const sedra = new Sedra(jd, israel);
    return sedra.toString() || '';
};

/**
 * Get the Daf Yomi for a Jewish date
 */
export const getDafYomi = (jewishDate: JewishDate): string => {
    const jd = toJDate(jewishDate);
    return Dafyomi.toString(jd) || '';
};

/**
 * Check if a date is Rosh Chodesh
 */
export const isRoshChodesh = (jewishDate: JewishDate): boolean => {
    return jewishDate.day === 1 || jewishDate.day === 30;
};

/**
 * Check if a date is in a leap year (has Adar II)
 */
export const isLeapYear = (year: number): boolean => {
    return jDate.isJdLeapY(year);
};

/**
 * Get the name of a Jewish month
 */
export const getMonthName = (month: number, year?: number): string => {
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

    // If month is 12 and it's a leap year, return "Adar I"
    if (month === 12 && year && isLeapYear(year)) {
        return 'Adar I';
    }

    return months[month] || 'Unknown';
};

/**
 * Get the Hebrew name of a Jewish month
 */
export const getMonthNameHebrew = (month: number, year?: number): string => {
    const months = [
        '',
        'ניסן',
        'אייר',
        'סיון',
        'תמוז',
        'אב',
        'אלול',
        'תשרי',
        'חשון',
        'כסלו',
        'טבת',
        'שבט',
        'אדר',
        'אדר א׳',
        'אדר ב׳',
    ];

    // If month is 12 and it's a leap year, return "Adar I"
    if (month === 12 && year && isLeapYear(year)) {
        return 'אדר א׳';
    }

    return months[month] || '';
};

/**
 * Get major holidays for a Jewish date
 * This is a simplified version - you might want to expand this
 */
export const getHolidays = (jewishDate: JewishDate, israel = false): string[] => {
    const holidays: string[] = [];
    const { year, month, day } = jewishDate;

    // Rosh Hashana
    if (month === 7 && (day === 1 || day === 2)) {
        holidays.push('Rosh Hashana');
    }

    // Yom Kippur
    if (month === 7 && day === 10) {
        holidays.push('Yom Kippur');
    }

    // Sukkos
    if (month === 7 && day >= 15 && day <= 21) {
        if (day === 15 || day === 16) {
            holidays.push('Sukkos');
        } else {
            holidays.push('Chol HaMoed Sukkos');
        }
    }

    // Shemini Atzeres / Simchas Torah
    if (month === 7 && day === 22) {
        holidays.push(israel ? 'Shemini Atzeres / Simchas Torah' : 'Shemini Atzeres');
    }
    if (month === 7 && day === 23 && !israel) {
        holidays.push('Simchas Torah');
    }

    // Chanukah
    if (month === 9 && day >= 25) {
        holidays.push('Chanukah');
    }
    if (month === 10 && day <= 2) {
        holidays.push('Chanukah');
    }
    if (month === 10 && day === 3 && isLeapYear(year)) {
        holidays.push('Chanukah');
    }

    // Purim
    const purimMonth = isLeapYear(year) ? 13 : 12;
    if (month === purimMonth && day === 14) {
        holidays.push('Purim');
    }
    if (month === purimMonth && day === 15) {
        holidays.push('Shushan Purim');
    }

    // Pesach
    if (month === 1 && day >= 15 && day <= 22) {
        if (day === 15 || day === 16 || day === 21 || day === 22) {
            if (israel && (day === 16 || day === 22)) {
                holidays.push('Chol HaMoed Pesach');
            } else {
                holidays.push('Pesach');
            }
        } else {
            holidays.push('Chol HaMoed Pesach');
        }
    }

    // Lag BaOmer
    if (month === 2 && day === 18) {
        holidays.push('Lag BaOmer');
    }

    // Shavuos
    if (month === 3 && (day === 6 || (!israel && day === 7))) {
        holidays.push('Shavuos');
    }

    // Fast Days
    if (month === 10 && day === 10) {
        holidays.push('Fast of Teves');
    }
    if (month === 4 && day === 17) {
        holidays.push('Fast of Tammuz');
    }
    if (month === 5 && day === 9) {
        holidays.push("Tisha B'Av");
    }

    return holidays;
};

/**
 * Check if a date is a Yom Tov (major holiday)
 */
export const isYomTov = (jewishDate: JewishDate, israel = false): boolean => {
    const jd = toJDate(jewishDate);
    return jd.isYomTov(israel);
};

/**
 * Check if a date is Chol HaMoed
 */
export const isCholHaMoed = (jewishDate: JewishDate): boolean => {
    const holidays = getHolidays(jewishDate);
    return holidays.some(holiday => holiday.includes('Chol HaMoed'));
};
