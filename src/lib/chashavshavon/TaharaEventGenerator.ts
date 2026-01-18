import Entry from './Entry';
import { TaharaEvent, TaharaEventType } from './TaharaEvent';
import { Settings } from '../../types';
import { jDate } from 'jcal-zmanim';

export default class TaharaEventGenerator {
    /**
     * Generates a list of TaharaEvents (Hefsek, Bedikas, Mikvah) based on entries and settings.
     */
    static generate(entries: Entry[], settings: Settings): TaharaEvent[] {
        const events: TaharaEvent[] = [];

        // Sort entries by date
        const sortedEntries = [...entries].sort((a, b) => a.date.Abs - b.date.Abs);

        for (let i = 0; i < sortedEntries.length; i++) {
            const entry = sortedEntries[i];

            // Skip if ignored (assuming logic aligns with flagged dates for now)
            if (entry.ignoreForFlaggedDates) continue;

            const nextEntry = i < sortedEntries.length - 1 ? sortedEntries[i + 1] : null;

            // 1. Hefsek Tahara (Earliest)
            const fourDays = !!settings.fourDaysHefsek;
            const hefsekDate = entry.getHefsekDate(fourDays);

            // Check if Hefsek is cancelled by next entry
            if (nextEntry && nextEntry.date.Abs <= hefsekDate.Abs) {
                continue; // Next entry started before/on Hefsek
            }

            events.push(new TaharaEvent(hefsekDate, TaharaEventType.Hefsek, entry.id));

            // 2. Bedika Day 1
            const day1 = hefsekDate.addDays(1);
            if (nextEntry && nextEntry.date.Abs <= day1.Abs) continue;
            events.push(new TaharaEvent(day1, TaharaEventType.Bedika, entry.id));

            // 3. Bedika Day 7
            const day7 = hefsekDate.addDays(7);
            if (nextEntry && nextEntry.date.Abs <= day7.Abs) continue;
            events.push(new TaharaEvent(day7, TaharaEventType.Bedika, entry.id));

            // 4. Mikvah Night
            // Mikvah is the night AFTER day 7 (i.e. start of day 8, or night part of day 8)
            // In jDate/Onah system, Night follows Day? No, Jewish day starts at Night.
            // So Day 7 is e.g. Sunday. Sunday Night is Start of Monday.
            // Wait. Mikvah is night FOLLOWING the 7 clean days.
            // If Hefsek is Monday afternoon (Day 2).
            // Day 1 = Tuesday.
            // Day 7 = Monday.
            // Mikvah = Monday Night (Start of Tuesday).
            // So Mikvah Date = Hefsek + 8?
            // Let's count.
            // Hefsek = Mon.
            // 1 = Tue
            // 2 = Wed
            // 3 = Thu
            // 4 = Fri
            // 5 = Shab
            // 6 = Sun
            // 7 = Mon.
            // Mikvah Night is Monday NIGHT (Eve of Tuesday).
            // Niddah/Onah logic:
            // NightDay.Night is Start of Day.
            // So Monday Night belongs to TUESDAY (Day 3).
            // So Mikvah Date should be TUESDAY.
            // Hefsek (Mon) -> Mikvah (Tue). Diff = 1? No.
            // Mon Day -> Tue Night.
            // Mon (2) -> Tue (3). +1?
            // Let's check `addDays`. `jDate` represents the day.
            // If Hefsek is Mon (Abs X).
            // Day 7 is Mon next week (Abs X + 7).
            // Mikvah Night is Monday Night.
            // In jDate terms, is Monday Night part of Monday or Tuesday?
            // Typically Jewish Date changes at sunset.
            // So Monday Night is TUESDAY.
            // So Mikvah Date IS Tuesday.
            // Abs X + 7 = Monday.
            // Abs X + 8 = Tuesday.
            // Yes.
            // Wait, Hefsek is BEFORE sunset (Day).
            // 7th Day is BEFORE sunset (Day).
            // Mikvah is AFTER sunset (Night).
            // So Mikvah is next day.
            // Logic: Mikvah Date = Hefsek + 8.

            const mikvahDate = hefsekDate.addDays(8);
            if (nextEntry && nextEntry.date.Abs <= mikvahDate.Abs - 1) continue;
            // If next entry starts ON mikvah night (Abs), it cancels it.
            // nextEntry.date is the DAY of the entry.
            // If entry is Night entry -> it is that date.
            // If Mikvah is Tuesday (Monday Night). Entry on Tuesday Night = Collision.

            events.push(new TaharaEvent(mikvahDate, TaharaEventType.Mikvah, entry.id));
        }

        return events;
    }
}
