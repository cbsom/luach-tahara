// Onah.test.ts - Unit tests for Onah class
import { describe, it, expect } from 'vitest';
import { jDate } from 'jcal-zmanim';
import { Onah, NightDay } from '../Onah';

describe('Onah', () => {
    describe('constructor', () => {
        it('should create an Onah with valid jDate and NightDay', () => {
            const jd = new jDate(5784, 1, 15); // 15 Tishrei 5784
            const onah = new Onah(jd, NightDay.Day);

            expect(onah.jdate).toBe(jd);
            expect(onah.nightDay).toBe(NightDay.Day);
        });

        it('should throw error if jdate is not a jDate instance', () => {
            expect(() => {
                // @ts-expect-error - Testing invalid input
                new Onah(null, NightDay.Day);
            }).toThrow('jdate must be a valid jDate instance');
        });

        it('should throw error if nightDay is invalid', () => {
            const jd = new jDate(5784, 1, 15);
            expect(() => {
                // @ts-expect-error - Testing invalid input
                new Onah(jd, 5);
            }).toThrow('nightDay must be either NightDay.Day or NightDay.Night');
        });
    });

    describe('isSameOnah', () => {
        it('should return true for same date and nightDay', () => {
            const jd = new jDate(5784, 1, 15);
            const onah1 = new Onah(jd, NightDay.Day);
            const onah2 = new Onah(jd, NightDay.Day);

            expect(onah1.isSameOnah(onah2)).toBe(true);
        });

        it('should return false for same date but different nightDay', () => {
            const jd = new jDate(5784, 1, 15);
            const onah1 = new Onah(jd, NightDay.Day);
            const onah2 = new Onah(jd, NightDay.Night);

            expect(onah1.isSameOnah(onah2)).toBe(false);
        });

        it('should return false for different dates', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = new jDate(5784, 1, 16);
            const onah1 = new Onah(jd1, NightDay.Day);
            const onah2 = new Onah(jd2, NightDay.Day);

            expect(onah1.isSameOnah(onah2)).toBe(false);
        });
    });

    describe('addOnahs', () => {
        it('should return same onah when adding 0', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const result = onah.addOnahs(0);

            expect(result.isSameOnah(onah)).toBe(true);
        });

        it('should add 1 onah correctly (day to night)', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const result = onah.addOnahs(1);

            expect(result.jdate.Abs).toBe(jd.addDays(1).Abs);
            expect(result.nightDay).toBe(NightDay.Night);
        });

        it('should add 2 onahs correctly (full day)', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const result = onah.addOnahs(2);

            expect(result.jdate.Abs).toBe(jd.addDays(1).Abs);
            expect(result.nightDay).toBe(NightDay.Day);
        });

        it('should add 3 onahs correctly', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const result = onah.addOnahs(3);

            expect(result.jdate.Abs).toBe(jd.addDays(2).Abs);
            expect(result.nightDay).toBe(NightDay.Night);
        });

        it('should subtract onahs with negative number', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const result = onah.addOnahs(-1);

            expect(result.jdate.Abs).toBe(jd.Abs);
            expect(result.nightDay).toBe(NightDay.Night);
        });

        it('should handle large numbers correctly', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const result = onah.addOnahs(60); // 30 days

            expect(result.jdate.Abs).toBe(jd.addDays(30).Abs);
            expect(result.nightDay).toBe(NightDay.Day);
        });
    });

    describe('previous', () => {
        it('should get previous onah from day', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const prev = onah.previous;

            expect(prev.jdate.Abs).toBe(jd.Abs);
            expect(prev.nightDay).toBe(NightDay.Night);
        });

        it('should get previous onah from night', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Night);
            const prev = onah.previous;

            expect(prev.jdate.Abs).toBe(jd.addDays(-1).Abs);
            expect(prev.nightDay).toBe(NightDay.Day);
        });
    });

    describe('next', () => {
        it('should get next onah from day', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const next = onah.next;

            expect(next.jdate.Abs).toBe(jd.addDays(1).Abs);
            expect(next.nightDay).toBe(NightDay.Night);
        });

        it('should get next onah from night', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Night);
            const next = onah.next;

            expect(next.jdate.Abs).toBe(jd.Abs);
            expect(next.nightDay).toBe(NightDay.Day);
        });
    });

    describe('toString', () => {
        it('should return English string for day onah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const str = onah.toString();

            expect(str).toContain('Day');
            expect(str).toContain('15');
        });

        it('should return English string for night onah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Night);
            const str = onah.toString();

            expect(str).toContain('Night');
        });
    });

    describe('toStringHebrew', () => {
        it('should return Hebrew string for day onah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const str = onah.toStringHebrew();

            expect(str).toContain('עונת יום');
        });

        it('should return Hebrew string for night onah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Night);
            const str = onah.toStringHebrew();

            expect(str).toContain('עונת לילה');
        });
    });

    describe('fromJewishDate and toJewishDateAndOnah', () => {
        it('should convert from JewishDate interface and back', () => {
            const jewishDate = { year: 5784, month: 1, day: 15 };
            const onah = Onah.fromJewishDate(jewishDate, 'day');

            expect(onah.jdate.Year).toBe(5784);
            expect(onah.jdate.Month).toBe(1);
            expect(onah.jdate.Day).toBe(15);
            expect(onah.nightDay).toBe(NightDay.Day);

            const converted = onah.toJewishDateAndOnah();
            expect(converted.jewishDate.year).toBe(5784);
            expect(converted.jewishDate.month).toBe(1);
            expect(converted.jewishDate.day).toBe(15);
            expect(converted.onah).toBe('day');
        });

        it('should handle night onah conversion', () => {
            const jewishDate = { year: 5784, month: 1, day: 15 };
            const onah = Onah.fromJewishDate(jewishDate, 'night');

            expect(onah.nightDay).toBe(NightDay.Night);

            const converted = onah.toJewishDateAndOnah();
            expect(converted.onah).toBe('night');
        });
    });

    describe('edge cases', () => {
        it('should handle month transitions correctly', () => {
            const jd = new jDate(5784, 1, 30); // Last day of Tishrei
            const onah = new Onah(jd, NightDay.Day);
            const next = onah.next;

            expect(next.jdate.Month).toBe(2); // Should be Cheshvan
            expect(next.jdate.Day).toBe(1);
        });

        it('should handle year transitions correctly', () => {
            const jd = new jDate(5784, 6, 29); // 29 Elul 5784 (month 6 is Elul)
            const onah = new Onah(jd, NightDay.Day);
            const next = onah.next;

            // Day of 29 Elul 5784 -> Night of 1 Tishrei 5785 (new Halachic year begins)
            expect(next.jdate.Year).toBe(5785); // Should be new year
            expect(next.jdate.Month).toBe(7); // Tishrei is month 7
            expect(next.jdate.Day).toBe(1);
            expect(next.nightDay).toBe(NightDay.Night);
        });

        it('should handle leap year months correctly', () => {
            const jd = new jDate(5784, 13, 15); // Adar II in leap year
            const onah = new Onah(jd, NightDay.Day);

            expect(onah.jdate.Month).toBe(13);
        });
    });
});
