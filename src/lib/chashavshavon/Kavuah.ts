// Kavuah - Pattern detection and management for Vesset Kavuah (וסת קבועה)
import { jDate } from 'jcal-zmanim';
import { Onah, NightDay } from './Onah';
import Entry from './Entry';
import { Settings } from '@/types';

/**
 * Enum for Kavuah Types
 * Using bit flags for potential future combination support
 */
export enum KavuahTypes {
    /** Haflaga - Fixed interval in days between entries */
    Haflagah = 1,
    /** Day of Month - Same day of Jewish month each time */
    DayOfMonth = 2,
    /** Day of Week - Same day of week at fixed intervals */
    DayOfWeek = 4,
    /** Sirug - Same day of month at fixed month intervals (e.g., every 2nd month) */
    Sirug = 8,
    /** Dilug Haflaga - Incrementing/decrementing interval pattern */
    DilugHaflaga = 16,
    /** Dilug Day of Month - Incrementing/decrementing day of month */
    DilugDayOfMonth = 32,
    /** Haflaga Ma'ayan Pasuach - Same as Haflaga (for information purposes) */
    HaflagaMaayanPasuach = 64,
    /** Day of Month Ma'ayan Pasuach - Same as DayOfMonth (for information purposes) */
    DayOfMonthMaayanPasuach = 128,
    /** Haflaga Onahs - Fixed interval in Onahs (day/night periods) between entries */
    HafalagaOnahs = 256,
}

/**
 * Kavuah suggestion result
 */
export interface KavuahSuggestion {
    kavuah: Kavuah;
    entries: Entry[];
}

/**
 * Represents a Vesset Kavuah (וסת קבועה) - a fixed pattern
 * A Kavuah is established when 3 (or 4 for some types) entries occur in a specific pattern.
 */
export default class Kavuah {
    public kavuahType: KavuahTypes;
    /** The third entry - the one that created the chazakah (established pattern) */
    public settingEntry: Entry;
    /**
     * Each type of Kavuah uses the specialNumber in its own way:
     * - Haflagah: the number of days between entries
     * - DayOfMonth: the day of the month
     * - DayOfWeek: the number of days between onahs
     * - Sirug: the number of months between onahs
     * - DilugHaflaga: number of days to increment/decrement (can be negative)
     * - DilugDayOfMonth: number of days to increment/decrement (can be negative)
     * - HaflagaMaayanPasuach and DayOfMonthMaayanPasuach: same as their regular counterparts
     * - HaflagaOnahs: the number of Onahs between the Entries
     */
    public specialNumber: number;
    /** Does this Kavuah cancel the onah beinonis (30-day cycle)? */
    public cancelsOnahBeinunis: boolean;
    /** Is this Kavuah currently active? */
    public active: boolean;
    /** Is this Kavuah ignored (for calculation purposes)? */
    public ignore: boolean;
    /** Database ID */
    public kavuahId?: string;

    constructor(
        kavuahType: KavuahTypes,
        settingEntry: Entry,
        specialNumber: number,
        cancelsOnahBeinunis?: boolean,
        active?: boolean,
        ignore?: boolean,
        kavuahId?: string
    ) {
        this.kavuahType = kavuahType;
        this.settingEntry = settingEntry;
        this.specialNumber = specialNumber;
        this.cancelsOnahBeinunis = !!cancelsOnahBeinunis;
        this.active = active !== undefined ? active : true;
        this.ignore = !!ignore;
        this.kavuahId = kavuahId;
    }

    /**
     * Returns true if this Kavuah's type is "Independent".
     * Independent Kavuahs are not dependent on their entries being 3 in a row -
     * meaning that even if there was another period in the interim, the Kavuah is still set.
     * 
     * Non-independent Kavuahs (like Haflaga) measure the time between periods,
     * so if there was another period in between, it cannot be considered a Kavuah.
     */
    get isIndependent(): boolean {
        return [
            KavuahTypes.DayOfMonth,
            KavuahTypes.DayOfMonthMaayanPasuach,
            KavuahTypes.DayOfWeek,
            KavuahTypes.DilugDayOfMonth,
            KavuahTypes.Sirug,
        ].includes(this.kavuahType);
    }

    /**
     * Get English string representation of this Kavuah
     */
    toString(hideActive?: boolean): string {
        let txt = '';
        if (!hideActive && !this.active) {
            txt = '[INACTIVE] ';
        }
        if (this.ignore) {
            txt = '[IGNORED] ';
        }
        txt += this.settingEntry.nightDay === NightDay.Night ? 'Night-time ' : 'Day-time ';

        switch (this.kavuahType) {
            case KavuahTypes.Haflagah:
                txt += `every ${this.specialNumber.toString()} days`;
                break;
            case KavuahTypes.DayOfMonth:
                txt += `on every ${this.toSuffixed(this.specialNumber)} day of the Jewish Month`;
                break;
            case KavuahTypes.DayOfWeek:
                txt += `on the ${this.getDayOfWeekName(this.settingEntry.dayOfWeek)} of every ${this.toSuffixed(Math.floor(this.specialNumber / 7))} week`;
                break;
            case KavuahTypes.Sirug:
                txt += `on the ${this.toSuffixed(this.settingEntry.day)} day of every ${this.toSuffixed(this.specialNumber)} month`;
                break;
            case KavuahTypes.HaflagaMaayanPasuach:
                txt += `on every ${this.specialNumber.toString()} days (through Ma'ayan Pasuach)`;
                break;
            case KavuahTypes.DayOfMonthMaayanPasuach:
                txt += `on the ${this.toSuffixed(this.specialNumber)} day of the Jewish Month (through Ma'ayan Pasuach)`;
                break;
            case KavuahTypes.DilugHaflaga:
                txt += 'of "Dilug Haflaga" in the interval pattern of "' +
                    (this.specialNumber < 0 ? 'subtract ' : 'add ') +
                    Math.abs(this.specialNumber).toString() +
                    ' days"';
                break;
            case KavuahTypes.DilugDayOfMonth:
                txt += 'of "Dilug Yom Hachodesh" in the interval pattern of "' +
                    (this.specialNumber < 0 ? 'subtract ' : 'add ') +
                    Math.abs(this.specialNumber).toString() +
                    ' days"';
                break;
            case KavuahTypes.HafalagaOnahs:
                txt += `every ${this.specialNumber.toString()} Onahs`;
                break;
        }
        return txt + '.';
    }

    /**
     * Get Hebrew string representation of this Kavuah
     */
    toStringHebrew(hideActive?: boolean): string {
        let txt = '';
        if (!hideActive && !this.active) {
            txt = '[לא פעיל] ';
        }
        if (this.ignore) {
            txt = '[מתעלם] ';
        }
        txt += this.settingEntry.nightDay === NightDay.Night ? 'לילה ' : 'יום ';

        switch (this.kavuahType) {
            case KavuahTypes.Haflagah:
                txt += `כל ${this.specialNumber.toString()} ימים`;
                break;
            case KavuahTypes.DayOfMonth:
                txt += `ביום ה-${this.specialNumber} של כל חודש עברי`;
                break;
            case KavuahTypes.DayOfWeek:
                txt += `ביום ${this.getDayOfWeekNameHebrew(this.settingEntry.dayOfWeek)} של כל שבוע ${this.toSuffixed(Math.floor(this.specialNumber / 7))}`;
                break;
            case KavuahTypes.Sirug:
                txt += `ביום ה-${this.settingEntry.day} של כל חודש ${this.toSuffixed(this.specialNumber)}`;
                break;
            case KavuahTypes.HaflagaMaayanPasuach:
                txt += `כל ${this.specialNumber.toString()} ימים (דרך מעיין פתוח)`;
                break;
            case KavuahTypes.DayOfMonthMaayanPasuach:
                txt += `ביום ה-${this.specialNumber} של החודש העברי (דרך מעיין פתוח)`;
                break;
            case KavuahTypes.DilugHaflaga:
                txt += 'של "דילוג הפלגה" בתבנית מרווח של "' +
                    (this.specialNumber < 0 ? 'הפחת ' : 'הוסף ') +
                    Math.abs(this.specialNumber).toString() +
                    ' ימים"';
                break;
            case KavuahTypes.DilugDayOfMonth:
                txt += 'של "דילוג יום החודש" בתבנית מרווח של "' +
                    (this.specialNumber < 0 ? 'הפחת ' : 'הוסף ') +
                    Math.abs(this.specialNumber).toString() +
                    ' ימים"';
                break;
            case KavuahTypes.HafalagaOnahs:
                txt += `כל ${this.specialNumber.toString()} עונות`;
                break;
        }
        return txt + '.';
    }

    /**
     * Get long detailed string representation
     */
    toLongString(): string {
        let txt = this.toString();
        txt += '\nSetting Entry: ' + this.settingEntry.toLongString();
        if (this.cancelsOnahBeinunis) {
            txt += '\nThis Kavuah cancels the "Onah Beinonis" Flagged Dates.';
        }
        return txt;
    }

    /**
     * Get long detailed Hebrew string representation
     */
    toLongStringHebrew(): string {
        let txt = this.toStringHebrew();
        txt += '\nראייה מכוננת: ' + this.settingEntry.toLongStringHebrew();
        if (this.cancelsOnahBeinunis) {
            txt += '\nוסת זה מבטל את זמני השמירה של "עונה בינונית".';
        }
        return txt;
    }

    /**
     * Check if this Kavuah matches another Kavuah
     */
    isMatchingKavuah(kavuah: Kavuah): boolean {
        return (
            this.kavuahType === kavuah.kavuahType &&
            this.settingEntry.onah.isSameOnah(kavuah.settingEntry.onah) &&
            this.specialNumber === kavuah.specialNumber
        );
    }

    /**
     * Returns true if the given Entry matches the current Kavuah pattern.
     * @param entry The Entry to test
     * @param entries The entire list of Entries (needed for some Kavuah types)
     * @param settings Halachic settings
     */
    isEntryInPattern(entry: Entry, entries: Entry[], settings?: Settings): boolean {
        if (entry.nightDay !== this.settingEntry.nightDay) {
            return false;
        }

        // Each Kavuah type has its own pattern
        switch (this.kavuahType) {
            case KavuahTypes.Haflagah:
                return entry.haflaga === this.specialNumber;

            case KavuahTypes.DayOfMonth:
                return entry.day === this.specialNumber;

            case KavuahTypes.Sirug: {
                const previous = entries[entries.indexOf(entry) - 1];
                return (
                    !!previous &&
                    entry.day === this.settingEntry.day &&
                    previous.date.diffMonths(entry.date) === this.specialNumber
                );
            }

            case KavuahTypes.DilugHaflaga: {
                const previous = entries[entries.indexOf(entry) - 1];
                return !!previous && entry.haflaga === previous.haflaga + this.specialNumber;
            }

            case KavuahTypes.DilugDayOfMonth:
            case KavuahTypes.DayOfWeek: {
                const iters = Kavuah.getIndependentIterations(
                    this,
                    entry.date,
                    settings?.dilugChodeshPastEnds
                );
                return iters.some(o => entry.onah.isSameOnah(o));
            }
        }
        return false;
    }

    /**
     * Check if this Kavuah has a database ID
     */
    get hasId(): boolean {
        return !!this.kavuahId;
    }

    /**
     * Tries to determine if the specialNumber correctly matches the information in the settingEntry
     */
    get specialNumberMatchesEntry(): boolean {
        if (!this.specialNumber) {
            return false;
        }
        switch (this.kavuahType) {
            case KavuahTypes.Haflagah:
            case KavuahTypes.HaflagaMaayanPasuach:
                return (
                    this.specialNumber > 0 &&
                    (this.specialNumber === this.settingEntry.haflaga || !this.settingEntry.haflaga)
                );
            case KavuahTypes.DayOfMonth:
            case KavuahTypes.DayOfMonthMaayanPasuach:
                return (
                    this.specialNumber > 0 &&
                    this.specialNumber <= 30 &&
                    this.specialNumber === this.settingEntry.day
                );
            case KavuahTypes.HafalagaOnahs:
                return this.specialNumber > 0;
            default:
                return true;
        }
    }

    // Helper methods
    private toSuffixed(num: number): string {
        const j = num % 10,
            k = num % 100;
        if (j === 1 && k !== 11) {
            return num + 'st';
        }
        if (j === 2 && k !== 12) {
            return num + 'nd';
        }
        if (j === 3 && k !== 13) {
            return num + 'rd';
        }
        return num + 'th';
    }

    private getDayOfWeekName(dow: number): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbos'];
        return days[dow] || '';
    }

    private getDayOfWeekNameHebrew(dow: number): string {
        const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        return days[dow] || '';
    }

    // Static methods for pattern detection and Kavuah management

    /**
     * Returns a list of Onahs that theoretically should have Entries on them
     * according to the pattern of the given Kavuah.
     * Only applicable to "Independent" type Kavuahs.
     */
    static getIndependentIterations(
        kavuah: Kavuah,
        jdate: jDate,
        dilugChodeshPastEnds?: boolean
    ): Onah[] {
        const iterations: Onah[] = [];
        if (kavuah.isIndependent) {
            if (kavuah.kavuahType === KavuahTypes.DayOfWeek) {
                return Kavuah.getDayOfWeekIterations(kavuah, jdate);
            } else if (kavuah.kavuahType === KavuahTypes.DilugDayOfMonth) {
                return Kavuah.getDilugDayOfMonthIterations(kavuah, jdate, dilugChodeshPastEnds);
            } else {
                let nextIteration = kavuah.settingEntry.date;
                while (nextIteration.Abs < jdate.Abs) {
                    nextIteration = nextIteration.addMonths(
                        kavuah.kavuahType === KavuahTypes.Sirug ? kavuah.specialNumber : 1
                    );
                    iterations.push(new Onah(nextIteration, kavuah.settingEntry.nightDay));
                }
            }
        }
        return iterations;
    }

    /**
     * Returns a list of Onahs for DayOfWeek Kavuah iterations
     */
    static getDayOfWeekIterations(kavuah: Kavuah, jdate: jDate): Onah[] {
        const iterations: Onah[] = [];
        if (kavuah.kavuahType === KavuahTypes.DayOfWeek) {
            let nextIteration = kavuah.settingEntry.date;
            while (nextIteration.Abs < jdate.Abs) {
                nextIteration = nextIteration.addDays(kavuah.specialNumber);
                iterations.push(new Onah(nextIteration, kavuah.settingEntry.nightDay));
            }
        }
        return iterations;
    }

    /**
     * Returns a list of Onahs for DilugDayOfMonth Kavuah iterations
     */
    static getDilugDayOfMonthIterations(
        kavuah: Kavuah,
        jdate: jDate,
        dilugChodeshPastEnds?: boolean
    ): Onah[] {
        const iterations: Onah[] = [];

        if (kavuah.kavuahType === KavuahTypes.DilugDayOfMonth) {
            let nextMonth = kavuah.settingEntry.date;
            for (let i = 1; ; i++) {
                nextMonth = nextMonth.addMonths(1);
                const nextIteration = nextMonth.addDays(kavuah.specialNumber * i);

                if (nextIteration.Abs > jdate.Abs || nextIteration.Abs <= kavuah.settingEntry.abs) {
                    break;
                }

                if (
                    !dilugChodeshPastEnds &&
                    Math.sign(kavuah.settingEntry.day - nextIteration.Day) ===
                    Math.sign(kavuah.specialNumber)
                ) {
                    break;
                }

                iterations.push(new Onah(nextIteration, kavuah.settingEntry.nightDay));
            }
        }
        return iterations;
    }

    /**
     * Get possible new Kavuahs from a list of entries
     */
    static getPossibleNewKavuahs(
        realEntrysList: Entry[],
        kavuahList: Kavuah[],
        settings: Settings
    ): KavuahSuggestion[] {
        const klist = kavuahList.filter(k => k.active);
        return Kavuah.getKavuahSuggestionList(realEntrysList, kavuahList, settings).filter(
            pk => !klist.find(k => k.isMatchingKavuah(pk.kavuah))
        );
    }

    /**
     * Works out all possible Kavuahs from the given list of entries
     */
    static getKavuahSuggestionList(
        realEntrysList: Entry[],
        previousKavuahs: Kavuah[],
        settings: Settings
    ): KavuahSuggestion[] {
        let kavuahList: KavuahSuggestion[] = [];
        const queue: Entry[] = [];

        for (const entry of realEntrysList.filter(e => !e.ignoreForKavuah)) {
            kavuahList = kavuahList
                .concat(Kavuah.getDayOfMonthKavuah(entry, realEntrysList, settings))
                .concat(Kavuah.getDayOfWeekKavuahs(entry, realEntrysList, settings));

            if (
                !previousKavuahs ||
                !previousKavuahs.some(
                    k =>
                        k.active &&
                        k.kavuahType === KavuahTypes.DayOfMonth &&
                        k.specialNumber === entry.date.Day
                )
            ) {
                kavuahList = kavuahList.concat(
                    Kavuah.getDilugDayOfMonthKavuah(entry, realEntrysList, settings)
                );
            }

            queue.push(entry);
            if (queue.length > 4) {
                queue.shift();
            }

            if (
                queue.length >= 3 &&
                (settings.kavuahDiffOnahs ||
                    (queue[0].nightDay === queue[1].nightDay && queue[1].nightDay === queue[2].nightDay))
            ) {
                kavuahList = kavuahList.concat(Kavuah.getSirugKavuah(queue.slice(-3)));
            }

            if (queue.length === 4) {
                if (
                    (queue[1].nightDay === queue[2].nightDay && queue[2].nightDay === queue[3].nightDay) ||
                    settings.kavuahDiffOnahs
                ) {
                    kavuahList = kavuahList
                        .concat(Kavuah.getHaflagahKavuah(queue))
                        .concat(Kavuah.getDilugHaflagahKavuah(queue));
                }

                if (settings.haflagaOfOnahs && queue[1].nightDay !== queue[2].nightDay) {
                    kavuahList = kavuahList.concat(Kavuah.getHaflagaOnahsKavuah(queue));
                }
            }
        }

        return kavuahList;
    }

    /**
     * Detect DayOfMonth Kavuah pattern
     */
    static getDayOfMonthKavuah(
        entry: Entry,
        entryList: Entry[],
        settings: Settings
    ): KavuahSuggestion[] {
        const list: KavuahSuggestion[] = [];
        const nextMonth = entry.date.addMonths(1);
        const thirdMonth = nextMonth.addMonths(1);

        const secondFind = entryList.find(
            en =>
                (settings.kavuahDiffOnahs || en.onah.nightDay === entry.onah.nightDay) &&
                en.date.Abs === nextMonth.Abs
        );

        if (secondFind) {
            const thirdFind = entryList.find(
                en =>
                    (settings.kavuahDiffOnahs || en.onah.nightDay === entry.onah.nightDay) &&
                    en.date.Abs === thirdMonth.Abs
            );

            if (thirdFind) {
                list.push({
                    kavuah: new Kavuah(KavuahTypes.DayOfMonth, thirdFind, thirdMonth.Day),
                    entries: [entry, secondFind, thirdFind],
                });
            }
        }
        return list;
    }

    /**
     * Detect DilugDayOfMonth Kavuah pattern
     */
    static getDilugDayOfMonthKavuah(
        entry: Entry,
        entryList: Entry[],
        settings: Settings
    ): KavuahSuggestion[] {
        const list: KavuahSuggestion[] = [];
        const nextMonth = entry.date.addMonths(1);
        const secondFind = entryList.find(
            en =>
                (settings.kavuahDiffOnahs || en.nightDay === entry.nightDay) &&
                nextMonth.Day !== en.day &&
                nextMonth.Month === en.month &&
                nextMonth.Year === en.year
        );

        if (secondFind) {
            const thirdMonth = entry.date.addMonths(2);
            const dilugDays = secondFind.day - entry.day;
            const finalFind = entryList.find(
                en =>
                    (settings.kavuahDiffOnahs || en.nightDay === entry.nightDay) &&
                    en.day - secondFind.day === dilugDays &&
                    thirdMonth.Month === en.month &&
                    thirdMonth.Year === en.year
            );

            if (finalFind) {
                list.push({
                    kavuah: new Kavuah(KavuahTypes.DilugDayOfMonth, finalFind, dilugDays),
                    entries: [entry, secondFind, finalFind],
                });
            }
        }
        return list;
    }

    /**
     * Detect DayOfWeek Kavuah patterns
     */
    static getDayOfWeekKavuahs(
        entry: Entry,
        entryList: Entry[],
        settings: Settings
    ): KavuahSuggestion[] {
        const list: KavuahSuggestion[] = [];

        for (const firstFind of entryList.filter(
            e =>
                (settings.kavuahDiffOnahs || e.nightDay === entry.nightDay) &&
                e.abs > entry.abs &&
                e.dayOfWeek === entry.dayOfWeek
        )) {
            const interval = entry.date.diffDays(firstFind.date);
            const nextDate = firstFind.date.addDays(interval);

            if (entry.dayOfWeek === nextDate.DayOfWeek) {
                const secondFind = entryList.find(
                    en =>
                        (settings.kavuahDiffOnahs || en.nightDay === entry.nightDay) &&
                        en.date.Abs === nextDate.Abs
                );

                if (secondFind) {
                    list.push({
                        kavuah: new Kavuah(KavuahTypes.DayOfWeek, secondFind, interval),
                        entries: [entry, firstFind, secondFind],
                    });
                }
            }
        }
        return list;
    }

    /**
     * Detect Haflagah Kavuah pattern
     */
    static getHaflagahKavuah(fourEntries: Entry[]): KavuahSuggestion[] {
        const list: KavuahSuggestion[] = [];
        if (
            fourEntries[1].haflaga === fourEntries[2].haflaga &&
            fourEntries[2].haflaga === fourEntries[3].haflaga
        ) {
            list.push({
                kavuah: new Kavuah(KavuahTypes.Haflagah, fourEntries[3], fourEntries[3].haflaga),
                entries: [...fourEntries],
            });
        }
        return list;
    }

    /**
     * Detect HaflagaOnahs Kavuah pattern
     */
    static getHaflagaOnahsKavuah(fourEntries: Entry[]): KavuahSuggestion[] {
        const list: KavuahSuggestion[] = [];
        const onahs = fourEntries[0].getOnahDifferential(fourEntries[1]);

        if (
            fourEntries[1].getOnahDifferential(fourEntries[2]) === onahs &&
            fourEntries[2].getOnahDifferential(fourEntries[3]) === onahs
        ) {
            list.push({
                kavuah: new Kavuah(KavuahTypes.HafalagaOnahs, fourEntries[3], onahs),
                entries: [...fourEntries],
            });
        }
        return list;
    }

    /**
     * Detect Sirug Kavuah pattern
     */
    static getSirugKavuah(threeEntries: Entry[]): KavuahSuggestion[] {
        const list: KavuahSuggestion[] = [];
        const monthDiff = threeEntries[0].date.diffMonths(threeEntries[1].date);

        if (
            monthDiff > 1 &&
            threeEntries[0].day === threeEntries[1].day &&
            threeEntries[1].day === threeEntries[2].day &&
            threeEntries[1].date.diffMonths(threeEntries[2].date) === monthDiff
        ) {
            list.push({
                kavuah: new Kavuah(KavuahTypes.Sirug, threeEntries[2], monthDiff),
                entries: [...threeEntries],
            });
        }
        return list;
    }

    /**
     * Detect DilugHaflaga Kavuah pattern
     */
    static getDilugHaflagahKavuah(fourEntries: Entry[]): KavuahSuggestion[] {
        const list: KavuahSuggestion[] = [];
        const haflagaDiff1 = fourEntries[3].haflaga - fourEntries[2].haflaga;
        const haflagaDiff2 = fourEntries[2].haflaga - fourEntries[1].haflaga;

        if (haflagaDiff1 !== 0 && haflagaDiff1 === haflagaDiff2) {
            list.push({
                kavuah: new Kavuah(KavuahTypes.DilugHaflaga, fourEntries[3], haflagaDiff1),
                entries: [...fourEntries],
            });
        }
        return list;
    }

    /**
     * Find Kavuahs that have been broken by the given entry
     */
    static findBrokenKavuahs(
        entry: Entry,
        kavuahList: Kavuah[],
        entries: Entry[],
        settings: Settings
    ): Kavuah[] {
        return [
            ...Kavuah.findIndependentBrokens(entry.date, kavuahList, entries, settings),
            ...Kavuah.findNonIndependentBrokens(entry, kavuahList, entries),
        ];
    }

    /**
     * Find broken independent Kavuahs
     */
    static findIndependentBrokens(
        jdate: jDate,
        kavuahList: Kavuah[],
        entries: Entry[],
        settings: Settings
    ): Kavuah[] {
        const brokens: Kavuah[] = [];

        for (const kavuah of kavuahList.filter(
            k => k.active && !k.ignore && k.isIndependent && k.settingEntry.abs < jdate.Abs
        )) {
            const last3Iters = Kavuah.getIndependentIterations(
                kavuah,
                jdate,
                settings.dilugChodeshPastEnds
            ).slice(-3);

            if (last3Iters.length === 3 && !last3Iters.some(o => entries.some(e => e.onah.isSameOnah(o)))) {
                brokens.push(kavuah);
            }
        }
        return brokens;
    }

    /**
     * Find broken non-independent Kavuahs
     */
    static findNonIndependentBrokens(
        entry: Entry,
        kavuahList: Kavuah[],
        entries: Entry[]
    ): Kavuah[] {
        const brokens: Kavuah[] = [];
        const index = entries.indexOf(entry);

        if (index > 1) {
            const lastThree = entries.slice(index - 2, index + 1);
            for (const kavuah of kavuahList.filter(
                k =>
                    k.active &&
                    !k.ignore &&
                    !k.isIndependent &&
                    lastThree.every(e => e.abs > k.settingEntry.abs)
            )) {
                if (!lastThree.some(e => kavuah.isEntryInPattern(e, entries))) {
                    brokens.push(kavuah);
                }
            }
        }
        return brokens;
    }

    /**
     * Find Kavuahs that the entry is out of pattern with
     */
    static findOutOfPattern(
        entry: Entry,
        kavuahList: Kavuah[],
        entries: Entry[],
        settings: Settings
    ): Kavuah[] {
        const list: Kavuah[] = [];
        for (const kavuah of kavuahList.filter(
            k =>
                k.cancelsOnahBeinunis &&
                k.active &&
                !k.ignore &&
                !k.isIndependent &&
                k.settingEntry.abs < entry.abs
        )) {
            if (!kavuah.isEntryInPattern(entry, entries, settings)) {
                list.push(kavuah);
            }
        }
        return list;
    }

    /**
     * Find inactive Kavuahs that have been reawakened
     */
    static findReawakenedKavuahs(
        entry: Entry,
        kavuahList: Kavuah[],
        entries: Entry[],
        settings: Settings
    ): Kavuah[] {
        const awakened: Kavuah[] = [];
        for (const kavuah of kavuahList.filter(
            k => !k.active && !k.ignore && k.settingEntry.abs < entry.abs
        )) {
            if (kavuah.isEntryInPattern(entry, entries, settings)) {
                awakened.push(kavuah);
            }
        }
        return awakened;
    }

    /**
     * Get default special number for a Kavuah type
     */
    static getDefaultSpecialNumber(
        settingEntry: Entry,
        kavuahType: KavuahTypes,
        entryList: Entry[]
    ): number | undefined {
        if (
            settingEntry.haflaga &&
            [KavuahTypes.Haflagah, KavuahTypes.HaflagaMaayanPasuach].includes(kavuahType)
        ) {
            return settingEntry.haflaga;
        } else if (
            [KavuahTypes.DayOfMonth, KavuahTypes.DayOfMonthMaayanPasuach].includes(kavuahType)
        ) {
            return settingEntry.day;
        } else if (kavuahType === KavuahTypes.HafalagaOnahs) {
            const index = entryList.findIndex(e => e.isSameEntry(settingEntry));
            const previous = entryList[index + 1];
            if (previous) {
                return previous.getOnahDifferential(settingEntry);
            }
        }
        return undefined;
    }

    /**
     * Get the definition text for the special number
     */
    static getNumberDefinition(kavuahType: KavuahTypes): string {
        switch (kavuahType) {
            case KavuahTypes.DayOfMonth:
            case KavuahTypes.DayOfMonthMaayanPasuach:
                return 'Day of each Jewish Month';
            case KavuahTypes.DayOfWeek:
                return 'Number of days between entries (Haflaga)';
            case KavuahTypes.Haflagah:
            case KavuahTypes.HaflagaMaayanPasuach:
                return 'Number of days between entries (Haflaga)';
            case KavuahTypes.DilugDayOfMonth:
                return 'Number of days to add/subtract each month';
            case KavuahTypes.DilugHaflaga:
                return 'Number of days to add/subtract to Haflaga each Entry';
            case KavuahTypes.HafalagaOnahs:
                return 'Number of Onahs between entries (Haflaga of Shulchan Aruch Harav)';
            case KavuahTypes.Sirug:
                return 'Number of months separating the Entries';
            default:
                return 'Kavuah Defining Number';
        }
    }

    /**
     * Get display text for Kavuah type
     */
    static getKavuahTypeText(kavuahType: KavuahTypes): string {
        switch (kavuahType) {
            case KavuahTypes.DayOfMonth:
                return 'Day of Month';
            case KavuahTypes.DayOfMonthMaayanPasuach:
                return "Day Of Month with Ma'ayan Pasuach";
            case KavuahTypes.DayOfWeek:
                return 'Day of week';
            case KavuahTypes.DilugDayOfMonth:
                return '"Dilug" of Day Of Month';
            case KavuahTypes.DilugHaflaga:
                return '"Dilug" of Haflaga';
            case KavuahTypes.HafalagaOnahs:
                return 'Haflaga of Onahs';
            case KavuahTypes.Haflagah:
                return 'Haflaga';
            case KavuahTypes.HaflagaMaayanPasuach:
                return "Haflaga with Ma'ayan Pasuach";
            case KavuahTypes.Sirug:
                return 'Sirug';
            default:
                return 'Unknown';
        }
    }

    /**
     * Get Hebrew display text for Kavuah type
     */
    static getKavuahTypeTextHebrew(kavuahType: KavuahTypes): string {
        switch (kavuahType) {
            case KavuahTypes.DayOfMonth:
                return 'יום החודש';
            case KavuahTypes.DayOfMonthMaayanPasuach:
                return 'יום החודש עם מעיין פתוח';
            case KavuahTypes.DayOfWeek:
                return 'יום השבוע';
            case KavuahTypes.DilugDayOfMonth:
                return 'דילוג יום החודש';
            case KavuahTypes.DilugHaflaga:
                return 'דילוג הפלגה';
            case KavuahTypes.HafalagaOnahs:
                return 'הפלגת עונות';
            case KavuahTypes.Haflagah:
                return 'הפלגה';
            case KavuahTypes.HaflagaMaayanPasuach:
                return 'הפלגה עם מעיין פתוח';
            case KavuahTypes.Sirug:
                return 'סירוג';
            default:
                return 'לא ידוע';
        }
    }
}


