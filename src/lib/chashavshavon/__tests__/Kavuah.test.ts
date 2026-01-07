// Kavuah.test.ts - Unit tests for Kavuah class
import { describe, it, expect } from 'vitest';
import { jDate } from 'jcal-zmanim';
import Kavuah, { KavuahTypes } from '../Kavuah';
import Entry from '../Entry';
import { Onah, NightDay } from '../Onah';
import type { Settings } from '@/types';

// Helper function to create a mock settings object
const createMockSettings = (overrides?: Partial<Settings>): Settings => ({
    location: {
        name: 'Jerusalem',
        latitude: 31.7683,
        longitude: 35.2137,
        utcOffset: 2,
        israel: true,
    },
    showFlagsOnMainScreen: true,
    showEntryInfo: true,
    hideFlagsWeekAfterEntry: false,
    calendarDisplaysCurrent: 'jewish',
    discreetReminders: false,
    haflagaOnahs: 0,
    keepThirtyOne: true,
    ohrZeruah: false,
    dilugChodeshPastEnds: false,
    kavuahDiffOnahs: false,
    haflagaOfOnahs: false,
    numberMonthsAheadToWarn: 12,
    onahBeinunis24Hours: false,
    showOhrZeruah: false,
    keepLongerHaflagah: false,
    noProbsAfterEntry: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
});

describe('Kavuah', () => {
    describe('constructor', () => {
        it('should create a Kavuah with all parameters', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(
                KavuahTypes.Haflagah,
                entry,
                30,
                true,
                true,
                false,
                'kavuah-1'
            );

            expect(kavuah.kavuahType).toBe(KavuahTypes.Haflagah);
            expect(kavuah.settingEntry).toBe(entry);
            expect(kavuah.specialNumber).toBe(30);
            expect(kavuah.cancelsOnahBeinunis).toBe(true);
            expect(kavuah.active).toBe(true);
            expect(kavuah.ignore).toBe(false);
            expect(kavuah.kavuahId).toBe('kavuah-1');
        });

        it('should default active to true', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.Haflagah, entry, 30);

            expect(kavuah.active).toBe(true);
        });
    });

    describe('isIndependent', () => {
        it('should return true for DayOfMonth', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.DayOfMonth, entry, 15);

            expect(kavuah.isIndependent).toBe(true);
        });

        it('should return true for DayOfWeek', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.DayOfWeek, entry, 7);

            expect(kavuah.isIndependent).toBe(true);
        });

        it('should return true for Sirug', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.Sirug, entry, 2);

            expect(kavuah.isIndependent).toBe(true);
        });

        it('should return false for Haflagah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.Haflagah, entry, 30);

            expect(kavuah.isIndependent).toBe(false);
        });

        it('should return false for DilugHaflaga', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.DilugHaflaga, entry, 2);

            expect(kavuah.isIndependent).toBe(false);
        });
    });

    describe('toString', () => {
        it('should return string for Haflagah kavuah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.Haflagah, entry, 30);
            const str = kavuah.toString();

            expect(str).toContain('Day-time');
            expect(str).toContain('every 30 days');
        });

        it('should return string for DayOfMonth kavuah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.DayOfMonth, entry, 15);
            const str = kavuah.toString();

            expect(str).toContain('15th day of the Jewish Month');
        });

        it('should show INACTIVE for inactive kavuah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.Haflagah, entry, 30, false, false);
            const str = kavuah.toString();

            expect(str).toContain('[INACTIVE]');
        });

        it('should show IGNORED for ignored kavuah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.Haflagah, entry, 30, false, true, true);
            const str = kavuah.toString();

            expect(str).toContain('[IGNORED]');
        });
    });

    describe('toStringHebrew', () => {
        it('should return Hebrew string for Haflagah kavuah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.Haflagah, entry, 30);
            const str = kavuah.toStringHebrew();

            expect(str).toContain('יום');
            expect(str).toContain('כל 30 ימים');
        });

        it('should return Hebrew string for DayOfMonth kavuah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.DayOfMonth, entry, 15);
            const str = kavuah.toStringHebrew();

            expect(str).toContain('ביום ה-15');
        });
    });

    describe('isMatchingKavuah', () => {
        it('should return true for matching kavuahs', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah1 = new Kavuah(KavuahTypes.Haflagah, entry, 30);
            const kavuah2 = new Kavuah(KavuahTypes.Haflagah, entry, 30);

            expect(kavuah1.isMatchingKavuah(kavuah2)).toBe(true);
        });

        it('should return false for different types', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah1 = new Kavuah(KavuahTypes.Haflagah, entry, 30);
            const kavuah2 = new Kavuah(KavuahTypes.DayOfMonth, entry, 15);

            expect(kavuah1.isMatchingKavuah(kavuah2)).toBe(false);
        });

        it('should return false for different special numbers', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah1 = new Kavuah(KavuahTypes.Haflagah, entry, 30);
            const kavuah2 = new Kavuah(KavuahTypes.Haflagah, entry, 31);

            expect(kavuah1.isMatchingKavuah(kavuah2)).toBe(false);
        });
    });

    describe('getHaflagahKavuah', () => {
        it('should detect Haflagah kavuah from 4 entries with same haflaga', () => {
            const entries: Entry[] = [];
            let currentDate = new jDate(5784, 1, 15);
            for (let i = 0; i < 4; i++) {
                const onah = new Onah(currentDate, NightDay.Day);
                const entry = new Entry(onah);
                if (i > 0) {
                    entry.setHaflaga(entries[i - 1]);
                }
                entries.push(entry);
                currentDate = currentDate.addDays(30);
            }

            const results = Kavuah.getHaflagahKavuah(entries);

            expect(results).toHaveLength(1);
            expect(results[0].kavuah.kavuahType).toBe(KavuahTypes.Haflagah);
            expect(results[0].kavuah.specialNumber).toBe(31); // 30 days + 1
            expect(results[0].entries).toHaveLength(4);
        });

        it('should not detect Haflagah kavuah when haflagas differ', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = jd1.addDays(30);
            const jd3 = jd2.addDays(30);
            const jd4 = jd3.addDays(31); // Different haflaga (31 instead of 30)

            const entry1 = new Entry(new Onah(jd1, NightDay.Day));
            const entry2 = new Entry(new Onah(jd2, NightDay.Day));
            const entry3 = new Entry(new Onah(jd3, NightDay.Day));
            const entry4 = new Entry(new Onah(jd4, NightDay.Day));

            entry2.setHaflaga(entry1);
            entry3.setHaflaga(entry2);
            entry4.setHaflaga(entry3);

            const results = Kavuah.getHaflagahKavuah([entry1, entry2, entry3, entry4]);

            expect(results).toHaveLength(0);
        });
    });

    describe('getDayOfMonthKavuah', () => {
        it('should detect DayOfMonth kavuah from 3 entries on same day of month', () => {
            const settings = createMockSettings();
            const entries: Entry[] = [];

            for (let i = 0; i < 3; i++) {
                const jd = new jDate(5784, 1 + i, 15); // 15th of each month
                const onah = new Onah(jd, NightDay.Day);
                entries.push(new Entry(onah));
            }

            const results = Kavuah.getDayOfMonthKavuah(entries[0], entries, settings);

            expect(results).toHaveLength(1);
            expect(results[0].kavuah.kavuahType).toBe(KavuahTypes.DayOfMonth);
            expect(results[0].kavuah.specialNumber).toBe(15);
        });

        it('should not detect DayOfMonth kavuah when days differ', () => {
            const settings = createMockSettings();
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = new jDate(5784, 2, 16); // Different day
            const jd3 = new jDate(5784, 3, 15);

            const entries = [
                new Entry(new Onah(jd1, NightDay.Day)),
                new Entry(new Onah(jd2, NightDay.Day)),
                new Entry(new Onah(jd3, NightDay.Day)),
            ];

            const results = Kavuah.getDayOfMonthKavuah(entries[0], entries, settings);

            expect(results).toHaveLength(0);
        });
    });

    describe('getSirugKavuah', () => {
        it('should detect Sirug kavuah from 3 entries with 2-month intervals', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = new jDate(5784, 3, 15); // 2 months later
            const jd3 = new jDate(5784, 5, 15); // 2 months later

            const entries = [
                new Entry(new Onah(jd1, NightDay.Day)),
                new Entry(new Onah(jd2, NightDay.Day)),
                new Entry(new Onah(jd3, NightDay.Day)),
            ];

            const results = Kavuah.getSirugKavuah(entries);

            expect(results).toHaveLength(1);
            expect(results[0].kavuah.kavuahType).toBe(KavuahTypes.Sirug);
            expect(results[0].kavuah.specialNumber).toBe(2);
        });

        it('should not detect Sirug kavuah for 1-month intervals (that\'s DayOfMonth)', () => {
            const jd1 = new jDate(5784, 1, 15);
            const jd2 = new jDate(5784, 2, 15);
            const jd3 = new jDate(5784, 3, 15);

            const entries = [
                new Entry(new Onah(jd1, NightDay.Day)),
                new Entry(new Onah(jd2, NightDay.Day)),
                new Entry(new Onah(jd3, NightDay.Day)),
            ];

            const results = Kavuah.getSirugKavuah(entries);

            expect(results).toHaveLength(0);
        });
    });

    describe('getKavuahTypeText', () => {
        it('should return correct text for each type', () => {
            expect(Kavuah.getKavuahTypeText(KavuahTypes.Haflagah)).toBe('Haflaga');
            expect(Kavuah.getKavuahTypeText(KavuahTypes.DayOfMonth)).toBe('Day of Month');
            expect(Kavuah.getKavuahTypeText(KavuahTypes.DayOfWeek)).toBe('Day of week');
            expect(Kavuah.getKavuahTypeText(KavuahTypes.Sirug)).toBe('Sirug');
        });
    });

    describe('getKavuahTypeTextHebrew', () => {
        it('should return correct Hebrew text for each type', () => {
            expect(Kavuah.getKavuahTypeTextHebrew(KavuahTypes.Haflagah)).toBe('הפלגה');
            expect(Kavuah.getKavuahTypeTextHebrew(KavuahTypes.DayOfMonth)).toBe('יום החודש');
            expect(Kavuah.getKavuahTypeTextHebrew(KavuahTypes.Sirug)).toBe('סירוג');
        });
    });

    describe('specialNumberMatchesEntry', () => {
        it('should return true for matching Haflagah', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            entry.setHaflaga(); // Sets to 0, but we'll manually set it
            (entry as any)._haflaga = 30;

            const kavuah = new Kavuah(KavuahTypes.Haflagah, entry, 30);

            expect(kavuah.specialNumberMatchesEntry).toBe(true);
        });

        it('should return true for matching DayOfMonth', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.DayOfMonth, entry, 15);

            expect(kavuah.specialNumberMatchesEntry).toBe(true);
        });

        it('should return false for non-matching DayOfMonth', () => {
            const jd = new jDate(5784, 1, 15);
            const onah = new Onah(jd, NightDay.Day);
            const entry = new Entry(onah);
            const kavuah = new Kavuah(KavuahTypes.DayOfMonth, entry, 20);

            expect(kavuah.specialNumberMatchesEntry).toBe(false);
        });
    });
});
