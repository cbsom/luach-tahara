// Entry.test.ts - Unit tests for Entry class
import { describe, it, expect } from 'vitest';
import { jDate } from 'jcal-zmanim';
import Entry from '../Entry';
import { Onah, NightDay } from '../Onah';

describe('Entry', () => {
    describe('constructor', () => {
        it('should create an Entry with all parameters', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah, 'entry-1', false, false, 'Test comment');

            expect(entry.onah).toBe(onah);
            expect(entry.entryId).toBe('entry-1');
            expect(entry.ignoreForFlaggedDates).toBe(false);
            expect(entry.ignoreForKavuah).toBe(false);
            expect(entry.comments).toBe('Test comment');
            expect(entry.haflaga).toBe(0); // Initial value
        });

        it('should handle optional parameters', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);

            expect(entry.entryId).toBeUndefined();
            expect(entry.ignoreForFlaggedDates).toBe(false);
            expect(entry.ignoreForKavuah).toBe(false);
            expect(entry.comments).toBeUndefined();
        });

        it('should convert truthy values to boolean for ignore flags', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah, undefined, 1 as any, 'yes' as any);

            expect(entry.ignoreForFlaggedDates).toBe(true);
            expect(entry.ignoreForKavuah).toBe(true);
        });
    });

    describe('setHaflaga', () => {
        it('should set haflaga based on previous entry', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = jd1.addDays(30); // 30 days later
            const onah1 = new Onah(jd1, NightDay.Day);
            const onah2 = new Onah(jd2, NightDay.Day);
            const entry1 = new Entry(onah1);
            const entry2 = new Entry(onah2);

            entry2.setHaflaga(entry1);

            expect(entry2.haflaga).toBe(31); // 30 days + 1
        });

        it('should set haflaga to 0 when no previous entry', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);

            entry.setHaflaga();

            expect(entry.haflaga).toBe(0);
        });
    });

    describe('isSameEntry', () => {
        it('should return true for entries on same onah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah1 = new Onah(jd, NightDay.Day);
            const onah2 = new Onah(jd, NightDay.Day);
            const entry1 = new Entry(onah1);
            const entry2 = new Entry(onah2);

            expect(entry1.isSameEntry(entry2)).toBe(true);
        });

        it('should return false for entries on different onahs', () => {
            const jd = new jDate(5784, 1, 15);
            const onah1 = new Onah(jd, NightDay.Day);
            const onah2 = new Onah(jd, NightDay.Night);
            const entry1 = new Entry(onah1);
            const entry2 = new Entry(onah2);

            expect(entry1.isSameEntry(entry2)).toBe(false);
        });
    });

    describe('getOnahDifferential', () => {
        it('should calculate onah differential for same nightDay', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = new jDate(5784, 1, 17); // 2 days later
            const onah1 = new Onah(jd1, NightDay.Day);
            const onah2 = new Onah(jd2, NightDay.Day);
            const entry1 = new Entry(onah1);
            const entry2 = new Entry(onah2);

            const diff = entry1.getOnahDifferential(entry2);

            expect(diff).toBe(4); // 2 days = 4 onahs
        });

        it('should calculate onah differential for different nightDay (day to night)', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = new jDate(5784, 1, 17);
            const onah1 = new Onah(jd1, NightDay.Day);
            const onah2 = new Onah(jd2, NightDay.Night);
            const entry1 = new Entry(onah1);
            const entry2 = new Entry(onah2);

            const diff = entry1.getOnahDifferential(entry2);

            expect(diff).toBe(3); // Day-15 to Night-17: 3 onahs (Day-15, Night-16, Day-16, Night-17)
        });

        it('should calculate onah differential for different nightDay (night to day)', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = new jDate(5784, 1, 17);
            const onah1 = new Onah(jd1, NightDay.Night);
            const onah2 = new Onah(jd2, NightDay.Day);
            const entry1 = new Entry(onah1);
            const entry2 = new Entry(onah2);

            const diff = entry1.getOnahDifferential(entry2);

            expect(diff).toBe(5); // Night-15 to Day-17: counting inclusively = 5 onahs
        });
    });

    describe('toString methods', () => {
        it('should return short string without haflaga', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const str = entry.toString();

            expect(str).toContain('Day-time');
            expect(str).not.toContain('Haflaga');
        });

        it('should return short string with haflaga', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = jd1.addDays(30);
            const onah1 = new Onah(jd1, NightDay.Day);
            const onah2 = new Onah(jd2, NightDay.Day);
            const entry1 = new Entry(onah1);
            const entry2 = new Entry(onah2);
            entry2.setHaflaga(entry1);

            const str = entry2.toString();

            expect(str).toContain('Haflaga of 31');
        });

        it('should return Hebrew string', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Night);
            const entry = new Entry(onah);
            const str = entry.toStringHebrew();

            expect(str).toContain('לילה');
        });

        it('should return long string with all details', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah, 'entry-1', true, true, 'Test comment');
            const str = entry.toLongString();

            expect(str).toContain('NON-REGULAR ENTRY');
            expect(str).toContain('does not generate any flagged dates');
            expect(str).toContain('not considered while calculating possible Kavuahs');
            expect(str).toContain('Test comment');
        });

        it('should return long Hebrew string', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah, 'entry-1', true, false, 'הערה');
            const str = entry.toLongStringHebrew();

            expect(str).toContain('ראייה לא רגילה');
            expect(str).toContain('הערה');
        });
    });

    describe('clone', () => {
        it('should create a deep copy of entry', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah, 'entry-1', false, false, 'Test');
            entry.setHaflaga();

            const clone = entry.clone();

            expect(clone).not.toBe(entry);
            expect(clone.entryId).toBe(entry.entryId);
            expect(clone.haflaga).toBe(entry.haflaga);
            expect(clone.comments).toBe(entry.comments);
            expect(clone.isSameEntry(entry)).toBe(true);
        });
    });

    describe('getHefsekDate', () => {
        it('should return hefsek date with 4 days', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);

            const hefsekDate = entry.getHefsekDate(false);

            expect(hefsekDate.Abs).toBe(jd.addDays(4).Abs);
        });

        it('should return hefsek date with 3 days', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);

            const hefsekDate = entry.getHefsekDate(true);

            expect(hefsekDate.Abs).toBe(jd.addDays(3).Abs);
        });
    });

    describe('getters', () => {
        it('should return correct nightDay', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Night);
            const entry = new Entry(onah);

            expect(entry.nightDay).toBe(NightDay.Night);
        });

        it('should return correct date', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);

            expect(entry.date.Abs).toBe(jd.Abs);
        });

        it('should return correct day, month, year', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);

            expect(entry.day).toBe(15);
            expect(entry.month).toBe(1);
            expect(entry.year).toBe(5784);
        });

        it('should return correct abs', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);

            expect(entry.abs).toBe(jd.Abs);
        });

        it('should return correct dayOfWeek', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);

            expect(entry.dayOfWeek).toBeGreaterThanOrEqual(0);
            expect(entry.dayOfWeek).toBeLessThanOrEqual(6);
        });

        it('should return hasId correctly', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry1 = new Entry(onah);
            const entry2 = new Entry(onah, 'entry-1');

            expect(entry1.hasId).toBe(false);
            expect(entry2.hasId).toBe(true);
        });
    });

    describe('fromJewishDate', () => {
        it('should create Entry from JewishDate interface', () => {
            const jewishDate = { year: 5784, month: 1, day: 15 };
            const entry = Entry.fromJewishDate(jewishDate, NightDay.Day, 'entry-1', false, false, 'Test');

            expect(entry.year).toBe(5784);
            expect(entry.month).toBe(1);
            expect(entry.day).toBe(15);
            expect(entry.nightDay).toBe(NightDay.Day);
            expect(entry.entryId).toBe('entry-1');
            expect(entry.comments).toBe('Test');
        });
    });

    describe('toJewishDateAndOnah', () => {
        it('should convert to JewishDate interface', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Night);
            const entry = new Entry(onah, 'entry-1', false, false, 'Test');
            entry.setHaflaga();

            const converted = entry.toJewishDateAndOnah();

            expect(converted.jewishDate.year).toBe(5784);
            expect(converted.jewishDate.month).toBe(1);
            expect(converted.jewishDate.day).toBe(15);
            expect(converted.onah).toBe(NightDay.Night);
            expect(converted.id).toBe('entry-1');
            expect(converted.haflaga).toBe(0);
            expect(converted.ignoreForFlaggedDates).toBe(false);
            expect(converted.ignoreForKavuah).toBe(false);
            expect(converted.comments).toBe('Test');
        });
    });
});
