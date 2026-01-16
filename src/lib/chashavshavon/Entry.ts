// Entry - Represents a single "ראייה" (period/menstruation)
import { jDate } from 'jcal-zmanim';
import { NightDay, Onah } from './Onah';
import { JewishDate } from '@/types';
import { formatSecularDate } from '@/lib/jcal';

/**
 * A single "ראייה" - period.
 * This is the core data structure for tracking menstrual cycles.
 */
export default class Entry {
    public onah: Onah;
    public entryId?: string;
    public ignoreForFlaggedDates: boolean;
    public ignoreForKavuah: boolean;
    public comments?: string;
    private _haflaga: number;

    /**
     * Create a new Entry
     * @param onah Jewish date and Night/Day that the period began
     * @param entryId The entryId in the database
     * @param ignoreForFlaggedDates This is not a real period
     * @param ignoreForKavuah Ignore this Entry while calculating possible Kavuahs
     * @param comments Notes about this entry
     */
    constructor(
        onah: Onah,
        entryId?: string,
        ignoreForFlaggedDates?: boolean,
        ignoreForKavuah?: boolean,
        comments?: string,
        haflaga?: number
    ) {
        this.onah = onah;
        this.entryId = entryId;
        this.ignoreForFlaggedDates = !!ignoreForFlaggedDates;
        this.ignoreForKavuah = !!ignoreForKavuah;
        this.comments = comments;
        this._haflaga = haflaga || 0;
    }

    /**
     * Create Entry from JewishDate interface
     */
    static fromJewishDate(
        jewishDate: JewishDate,
        onah: NightDay,
        entryId?: string,
        ignoreForFlaggedDates?: boolean,
        ignoreForKavuah?: boolean,
        comments?: string,
        haflaga?: number
    ): Entry {
        const onahObj = Onah.fromJewishDate(jewishDate, onah);
        return new Entry(onahObj, entryId, ignoreForFlaggedDates, ignoreForKavuah, comments, haflaga);
    }

    /**
     * Set the current entry's haflaga
     * @param previousEntry The previous entry to calculate haflaga from
     */
    setHaflaga(previousEntry?: Entry): void {
        this._haflaga = previousEntry ? previousEntry.date.diffDays(this.date) + 1 : 0;
    }

    /**
     * Returns true if the supplied Entry has the same jdate and nightDay as this Entry.
     * There can not be more than a single Entry per Onah.
     */
    isSameEntry(entry: Entry): boolean {
        return this.onah.isSameOnah(entry.onah);
    }

    /**
     * Get the onah differential between two entries.
     * The second onah must be chronologically after this Entry's onah.
     */
    getOnahDifferential(entry: Entry): number {
        let count = this.date.diffDays(entry.date) * 2;
        if (this.nightDay < entry.nightDay) {
            count++;
        } else if (this.nightDay > entry.nightDay) {
            count--;
        }
        return count;
    }

    /**
     * String representation of the entry
     */
    toString(): string {
        let str = `${this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time'} of ${this.date.toShortstring(false)}`;
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        return str;
    }

    /**
     * Hebrew string representation
     */
    toStringHebrew(): string {
        const onahStr = this.nightDay === NightDay.Night ? 'לילה' : 'יום';
        let str = `${onahStr} של ${this.date.toStringHeb(true)}`;
        if (this.haflaga) {
            str += ` [הפלגה של ${this.haflaga.toString()}]`;
        }
        return str;
    }

    /**
     * Short string representation
     */
    toShortString(): string {
        return (
            this.date.toShortstring(false) +
            ' (' +
            (this.nightDay === NightDay.Night ? 'Night' : 'Day') +
            ')'
        );
    }

    /**
     * Short Hebrew string
     */
    toShortStringHebrew(): string {
        const onahStr = this.nightDay === NightDay.Night ? 'לילה' : 'יום';
        return this.date.toStringHeb(true) + ` (${onahStr})`;
    }

    /**
     * Long detailed string representation
     */
    toLongString(): string {
        let str = '';
        if (this.ignoreForFlaggedDates || this.ignoreForKavuah) {
            str += 'NON-REGULAR ENTRY\n';
        }
        str +=
            (this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time') +
            ' of ' +
            this.date.toString() +
            ' - ' +
            formatSecularDate(this.date.getDate());
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        if (this.ignoreForFlaggedDates) {
            str += '\nThis Entry does not generate any flagged dates.';
        }
        if (this.ignoreForKavuah) {
            str += '\nThis Entry is not considered while calculating possible Kavuahs.';
        }
        if (this.comments) {
            str += '\nComments: ' + this.comments;
        }
        return str;
    }

    /**
     * Long Hebrew string
     */
    toLongStringHebrew(): string {
        let str = '';
        if (this.ignoreForFlaggedDates || this.ignoreForKavuah) {
            str += 'ראייה לא רגילה\n';
        }
        const onahStr = this.nightDay === NightDay.Night ? 'לילה' : 'יום';
        str += `${onahStr} של ${this.date.toStringHeb()} - ${formatSecularDate(this.date.getDate())}`;
        if (this.haflaga) {
            str += ` [הפלגה של ${this.haflaga.toString()}]`;
        }
        if (this.ignoreForFlaggedDates) {
            str += '\nראייה זו לא יוצרת זמני שמירה.';
        }
        if (this.ignoreForKavuah) {
            str += '\nראייה זו לא נלקחת בחשבון בחישוב וסתות קבועים.';
        }
        if (this.comments) {
            str += '\nהערות: ' + this.comments;
        }
        return str;
    }

    /**
     * String for known date display
     */
    toKnownDateString(): string {
        let str = '';
        if (this.ignoreForFlaggedDates || this.ignoreForKavuah) {
            str += 'NON-REGULAR ';
        }
        str += `Entry for ${this.nightDay === NightDay.Night ? 'Night-time' : 'Day-time'}`;
        if (this.haflaga) {
            str += ` [Haflaga of ${this.haflaga.toString()}]`;
        }
        return str;
    }

    /**
     * Clone the current entry
     */
    clone(): Entry {
        const entry = new Entry(
            this.onah,
            this.entryId,
            this.ignoreForFlaggedDates,
            this.ignoreForKavuah,
            this.comments
        );
        entry._haflaga = this.haflaga;
        return entry;
    }

    /**
     * Get the Hefsek Tahara date
     * @param fourDaysHefsek Whether to use 4 days or 5 days
     */
    getHefsekDate(fourDaysHefsek: boolean): jDate {
        return this.date.addDays(fourDaysHefsek ? 3 : 4);
    }

    /**
     * Convert to our type system
     */
    toJewishDateAndOnah(): {
        jewishDate: JewishDate;
        onah: NightDay;
        id?: string;
        haflaga: number;
        ignoreForFlaggedDates: boolean;
        ignoreForKavuah: boolean;
        comments?: string;
    } {
        const { jewishDate, onah } = this.onah.toJewishDateAndOnah();
        return {
            jewishDate,
            onah,
            id: this.entryId,
            haflaga: this.haflaga,
            ignoreForFlaggedDates: this.ignoreForFlaggedDates,
            ignoreForKavuah: this.ignoreForKavuah,
            comments: this.comments,
        };
    }

    // Getters
    get nightDay(): NightDay {
        return this.onah.nightDay;
    }

    get date(): jDate {
        return this.onah.jdate;
    }

    get day(): number {
        return this.date.Day;
    }

    get month(): number {
        return this.date.Month;
    }

    get year(): number {
        return this.date.Year;
    }

    get abs(): number {
        return this.date.Abs;
    }

    get dayOfWeek(): number {
        return this.date.DayOfWeek;
    }

    get hasId(): boolean {
        return !!this.entryId;
    }

    get id(): string {
        return this.entryId || '';
    }

    get haflaga(): number {
        return this._haflaga;
    }
}
