// Onah - Represents either the night-time or the day-time of a single Jewish Date
import { jDate } from 'jcal-zmanim';
import { JewishDate, NightDay } from '@/types';
import { toJDate, fromJDate } from '@/lib/jcal';

export { NightDay };

/**
 * Represents either the night-time or the day-time of a single Jewish Date.
 * This is used for Halachic calculations related to Vesset and Entry tracking.
 */

/**
 * Represents either the night-time or the day-time of a single Jewish Date.
 * This is used for Halachic calculations related to Vesset and Entry tracking.
 */
export class Onah {
    public jdate: jDate;
    public nightDay: NightDay;

    /**
     * Create a new Onah
     * @param jdate Jewish date
     * @param nightDay Night (-1) or Day (1)
     */
    constructor(jdate: jDate, nightDay: NightDay) {
        if (!(jdate instanceof jDate)) {
            throw new Error('jdate must be a valid jDate instance');
        }
        if (![NightDay.Day, NightDay.Night].includes(nightDay)) {
            throw new Error('nightDay must be either NightDay.Day or NightDay.Night');
        }
        this.jdate = jdate;
        this.nightDay = nightDay;
    }

    /**
     * Create an Onah from JewishDate interface and NightDay
     */
    static fromJewishDate(jewishDate: JewishDate, nightDay: NightDay): Onah {
        const jd = toJDate(jewishDate);
        return new Onah(jd, nightDay);
    }

    /**
     * Convert to our type system (JewishDate + NightDay)
     */
    toJewishDateAndOnah(): { jewishDate: JewishDate; onah: NightDay } {
        return {
            jewishDate: fromJDate(this.jdate),
            onah: this.nightDay,
        };
    }

    /**
     * Determines if the supplied Onah has the same Jewish date and Night/Day as the current Onah.
     */
    isSameOnah(onah: Onah): boolean {
        return (
            this.jdate.Abs === onah.jdate.Abs &&
            this.nightDay === onah.nightDay
        );
    }

    /**
     * Add the given number of Onahs to the current one
     * @param number Number of onahs to add (negative for earlier onahs)
     */
    addOnahs(number: number): Onah {
        if (!number || number === 0) {
            return this;
        }

        // First add the full days. Each day is 2 onahs.
        const fullDays = Math.floor(number / 2);
        let onah = new Onah(this.jdate.addDays(fullDays), this.nightDay);
        let remaining = number - fullDays * 2;

        while (remaining > 0) {
            onah = onah.next;
            remaining--;
        }
        while (remaining < 0) {
            onah = onah.previous;
            remaining++;
        }

        return onah;
    }

    /**
     * Returns the Onah directly before this one.
     */
    get previous(): Onah {
        if (this.nightDay === NightDay.Day) {
            return new Onah(this.jdate, NightDay.Night);
        } else {
            return new Onah(this.jdate.addDays(-1), NightDay.Day);
        }
    }

    /**
     * Returns the Onah directly after this one.
     */
    get next(): Onah {
        if (this.nightDay === NightDay.Day) {
            return new Onah(this.jdate.addDays(1), NightDay.Night);
        } else {
            return new Onah(this.jdate, NightDay.Day);
        }
    }

    /**
     * Get a string representation of this Onah
     */
    toString(): string {
        const onahStr = this.nightDay === NightDay.Day ? 'Day' : 'Night';
        return `${this.jdate.toString()} - ${onahStr}`;
    }

    /**
     * Get Hebrew string representation
     */
    toStringHebrew(): string {
        const onahStr = this.nightDay === NightDay.Day ? 'עונת יום' : 'עונת לילה';
        return `${this.jdate.toStringHeb()} - ${onahStr}`;
    }
}
