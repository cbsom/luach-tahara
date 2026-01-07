// ProblemOnah - Represents all the problems (flagged dates) of a single Onah
import { jDate } from 'jcal-zmanim';
import { NightDay, Onah } from './Onah';

/**
 * Represents all the problems of a single Onah.
 * The flagsList contains an Array of strings, each describing one problem.
 * This is used to track which dates require restrictions (Zmanei Shemira).
 */
export class ProblemOnah extends Onah {
    public flagsList: string[];

    /**
     * Create a ProblemOnah
     * @param jdate Jewish date
     * @param nightDay Night or Day
     * @param flagsList Array of flag descriptions
     */
    constructor(jdate: jDate, nightDay: NightDay, flagsList?: string[]) {
        if (!jdate) {
            throw new Error('jdate must be supplied');
        }
        if (nightDay === undefined || nightDay === null) {
            throw new Error('nightDay must be supplied');
        }
        super(jdate, nightDay);
        this.flagsList = flagsList || [];
    }

    /**
     * Returns a detailed text description for the entire Onah.
     * Each flag description is shown on its own line and prefixed with a "►".
     */
    toString(): string {
        const goyDate =
            this.nightDay === NightDay.Night
                ? this.jdate.addDays(-1).getDate()
                : this.jdate.getDate();

        return (
            `The ${this.nightDay === NightDay.Night ? 'night' : 'day'} of ` +
            this.jdate.toString() +
            ` (${goyDate.toLocaleDateString()}) is the:` +
            this.flagsList.map(f => '\n  ►  ' + f).join('')
        );
    }

    /**
     * Returns Hebrew description
     */
    toStringHebrew(): string {
        const goyDate =
            this.nightDay === NightDay.Night
                ? this.jdate.addDays(-1).getDate()
                : this.jdate.getDate();

        const onahStr = this.nightDay === NightDay.Night ? 'לילה' : 'יום';
        return (
            `${onahStr} של ` +
            this.jdate.toStringHeb() +
            ` (${goyDate.toLocaleDateString('he-IL')}) הוא:` +
            this.flagsList.map(f => '\n  ►  ' + f).join('')
        );
    }

    /**
     * Determines if the given ProblemOnah is on the same Onah
     * and has all the flags that this one does.
     */
    isSameProb(prob: ProblemOnah): boolean {
        return (
            this.isSameOnah(prob) &&
            this.flagsList.every(f => prob.flagsList.some(pf => pf === f))
        );
    }

    /**
     * Filter a list of problem onahs for the ones pertaining to the given date.
     */
    static getProbsForDate(jdate: jDate, probOnahList: ProblemOnah[]): ProblemOnah[] | false {
        if (!probOnahList || probOnahList.length === 0) {
            return false;
        }
        const filtered = probOnahList.filter(po => po.jdate.Abs === jdate.Abs);
        return filtered.length > 0 ? filtered : false;
    }

    /**
     * Sort problems chronologically
     */
    static sortProbList(probOnahs: ProblemOnah[]): ProblemOnah[] {
        // Sort problem onahs by chronological order
        return probOnahs.sort((a, b) => {
            if (a.jdate.Abs < b.jdate.Abs) {
                return -1;
            } else if (a.jdate.Abs > b.jdate.Abs) {
                return 1;
            } else {
                return a.nightDay - b.nightDay;
            }
        });
    }
}

/**
 * Represents a single flag for a single Onah.
 * Each Onah can have multiple flags.
 */
export class ProblemFlag {
    public jdate: jDate;
    public nightDay: NightDay;
    public description: string;

    /**
     * Create a ProblemFlag
     * @param jdate Jewish date
     * @param nightDay Night or Day
     * @param description Description of the problem/flag
     */
    constructor(jdate: jDate, nightDay: NightDay, description: string) {
        if (!jdate) {
            throw new Error('jdate must be supplied');
        }
        if (nightDay === undefined || nightDay === null) {
            throw new Error('nightDay must be supplied');
        }
        if (!description) {
            throw new Error('description must be supplied');
        }
        this.jdate = jdate;
        this.nightDay = nightDay;
        this.description = description;
    }

    /**
     * Get the Onah for this flag
     */
    get onah(): Onah {
        return new Onah(this.jdate, this.nightDay);
    }

    /**
     * Tests to see if the given ProblemFlag matches this one.
     */
    isSameProb(prob: ProblemFlag): boolean {
        return (
            this.jdate.Abs === prob.jdate.Abs &&
            this.nightDay === prob.nightDay &&
            this.description === prob.description
        );
    }
}
