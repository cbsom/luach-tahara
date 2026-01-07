// EntryList - Manages a list of Entry objects with sorting and filtering
import Entry from './Entry';
import { Settings } from '@/types';
import { ProblemOnah } from './ProblemOnah';
import FlaggedDatesGenerator from './FlaggedDatesGenerator';

/**
 * Manages a collection of Entry objects (periods/ראיות)
 * Provides methods for adding, removing, sorting, and calculating haflagas
 */
export default class EntryList {
    public list: Entry[];

    constructor(entryList?: Entry[]) {
        this.list = entryList || [];
    }

    /**
     * Add an Entry to the list.
     * In most cases, calculateHaflagas should be called after changing the list.
     * @param entry Entry to add
     * @param afterwards Optional callback function called after adding
     * @returns The index of the added entry, or undefined if not added
     */
    add(entry: Entry, afterwards?: (entry: Entry, index: number) => void): number | undefined {
        if (!(entry instanceof Entry)) {
            throw new Error('Only objects of type Entry can be added to the EntryList');
        }

        // Don't add if an entry for the same onah already exists
        if (!this.list.some(e => e.isSameEntry(entry))) {
            this.list.push(entry);
            const index = this.list.indexOf(entry);
            if (afterwards) {
                afterwards(entry, index);
            }
            return index;
        }
        return undefined;
    }

    /**
     * Remove the given entry from the list
     * In most cases, calculateHaflagas should be called after changing the list.
     * @param arg Either the index of the Entry to remove or the actual Entry to remove.
     * Note: The supplied Entry does not have to refer to the same instance as the Entry in the list,
     * an entry where Entry.isSameEntry() returns true is removed.
     * @param afterwards Optional callback. Supplies the removed entry as an argument.
     */
    remove(arg: number | Entry, afterwards?: (entry: Entry) => void): void {
        let wasRemoved = false;
        let entry: Entry | null = null;

        if (typeof arg === 'number' && arg >= 0 && arg < this.list.length) {
            const removed = this.list.splice(arg, 1);
            entry = removed[0];
            wasRemoved = true;
        } else if (arg instanceof Entry) {
            const index = this.list.findIndex(e => e === arg || e.isSameEntry(arg));
            if (index > -1) {
                const removed = this.list.splice(index, 1);
                entry = removed[0];
                wasRemoved = true;
            }
        } else {
            throw new Error(
                'EntryList.remove accepts either an Entry to remove or the index of the Entry to remove'
            );
        }

        if (wasRemoved && entry && afterwards) {
            afterwards(entry);
        }
    }

    /**
     * Returns whether or not the given Entry is in this list.
     * Note: The supplied Entry does not have to refer to the same actual instance as an Entry in the list;
     * an entry where isSameEntry returns true is also considered "found".
     */
    contains(entry: Entry): boolean {
        return this.list.findIndex(e => e === entry || e.isSameEntry(entry)) !== -1;
    }

    /**
     * Returns the list of entries sorted chronologically reversed - the most recent first.
     */
    get descending(): Entry[] {
        // Sort the list by date, clone it, reverse it and return it.
        // Cloning is because reverse is in-place.
        return [...EntryList.sortEntries(this.list)].reverse();
    }

    /**
     * Gets an array of the Entries in the list that are real periods...
     * I.E. not ignored for flagged dates
     */
    get realEntrysList(): Entry[] {
        return EntryList.sortEntries(this.list.filter(e => !e.ignoreForFlaggedDates));
    }

    /**
     * Returns the latest Entry
     */
    lastEntry(): Entry | undefined {
        let latest: Entry | undefined;
        for (const entry of this.list) {
            if (!latest || entry.abs > latest.abs) {
                latest = entry;
            }
        }
        return latest;
    }

    /**
     * Returns the latest Entry that isn't set to ignore for Flagged Dates
     */
    lastRegularEntry(): Entry | undefined {
        const realEntrysList = this.realEntrysList;
        return realEntrysList[realEntrysList.length - 1];
    }

    /**
     * Calculates the haflagas for all the entries in the list.
     */
    calculateHaflagas(): void {
        // Get only those entries that can generate flagged dates.
        // Non-real entries do not have a haflaga
        const realEntrysList = this.realEntrysList;

        // First Entry in the real entry list does not have a Haflaga
        for (let i = 1; i < realEntrysList.length; i++) {
            realEntrysList[i].setHaflaga(realEntrysList[i - 1]);
        }
    }

    /**
     * Get all the problem onahs (flagged dates) that need to be observed.
     * It is generated from this EntryList and the given list of Kavuahs.
     * The list is generated according the halachic settings in the supplied settings.
     * Returns an array of ProblemOnah.
     * @param kavuahList List of Kavuahs
     * @param settings Halachic settings
     */
    getProblemOnahs(kavuahList: any[], settings: Settings): ProblemOnah[] {
        const generator = new FlaggedDatesGenerator(this.realEntrysList, kavuahList, settings);
        return generator.getProblemOnahs();
    }

    /**
     * Get the number of entries in the list
     */
    get length(): number {
        return this.list.length;
    }

    /**
     * Check if the list is empty
     */
    get isEmpty(): boolean {
        return this.list.length === 0;
    }

    /**
     * Clear all entries from the list
     */
    clear(): void {
        this.list = [];
    }

    /**
     * Get entry at specific index
     */
    at(index: number): Entry | undefined {
        return this.list[index];
    }

    /**
     * Find entry by ID
     */
    findById(id: string): Entry | undefined {
        return this.list.find(e => e.entryId === id);
    }

    /**
     * Sorts the given list of Entries chronologically.
     */
    static sortEntries(list: Entry[]): Entry[] {
        return list.sort((a, b) => {
            if (a.abs < b.abs) {
                return -1;
            } else if (a.abs > b.abs) {
                return 1;
            } else {
                return a.nightDay - b.nightDay;
            }
        });
    }

    /**
     * Create EntryList from array of plain objects
     */
    static fromPlainObjects(objects: any[]): EntryList {
        const entries = objects.map(obj => {
            // This will need proper conversion logic based on your data structure
            // Placeholder for now
            return obj as Entry;
        });
        return new EntryList(entries);
    }
}
