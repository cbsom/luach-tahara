import { jDate } from 'jcal-zmanim';
import Entry from './Entry';
import { TaharaEvent } from '@/types';

export enum NiddahStatus {
    Niddah = 'niddah',
    Tahara = 'tahara',
}

interface StatusEvent {
    abs: number;
    type: 'entry' | 'mikvah';
}

export default class StatusCalculator {
    private events: StatusEvent[];

    constructor(entries: Entry[], taharaEvents: TaharaEvent[]) {
        const combinedEvents: StatusEvent[] = [
            ...entries.map(e => ({ abs: e.date.Abs, type: 'entry' as const })),
            ...taharaEvents
                .filter(e => e.type === 'mikvah')
                .map(e => {
                    // Calculate abs from {year, month, day}
                    const jd = new jDate(e.date.year, e.date.month, e.date.day);
                    return { abs: jd.Abs, type: 'mikvah' as const };
                })
        ];

        // Sort chronologically
        this.events = combinedEvents.sort((a, b) => a.abs - b.abs);
    }

    /**
     * Get statuses for a range of dates
     */
    getStatuses(days: jDate[]): Map<number, NiddahStatus> {
        const statusMap = new Map<number, NiddahStatus>();

        // Optimization: we don't need to recalculate from scratch for every day.
        // We strictly need the status of the first day, then we can carry forward,
        // only checking if an event happens on that day.

        if (days.length === 0) return statusMap;

        const firstDayAbs = days[0].Abs;

        // 1. Determine initial status before the first day
        // Find the last event strictly before firstDayAbs
        let currentStatus = NiddahStatus.Tahara;
        const priorEvent = this.events.filter(e => e.abs < firstDayAbs).pop();
        if (priorEvent) {
            if (priorEvent.type === 'entry') currentStatus = NiddahStatus.Niddah;
            else if (priorEvent.type === 'mikvah') currentStatus = NiddahStatus.Tahara;
        }

        // 2. Iterate through the range
        // We can assume days are sequential in the calendar, but let's be robust and map by Abs.
        // If days are sequential:
        for (const day of days) {
            // Check for events on this day
            // Note: If multiple events on same day (e.g. Mikvah then Entry?), rely on sort order or take latest.
            // Usually users won't put both on same day unless error.
            // If Entry is on day X, status BECOMES Niddah ON day X.
            // If Mikvah is on day X, status BECOMES Tahara ON day X (after Mikvah).
            // For coloring the WHOLE day:
            // - Entry day: usually considered Niddah (saw blood).
            // - Mikvah day: usually considered Tahara (went to mikvah at night, day is pure, or went previous night).
            // IMPORTANT: Mikvah is usually at night (start of Jewish day).
            // If recorded on date X, it means date X is pure.

            const dayEvents = this.events.filter(e => e.abs === day.Abs);

            for (const event of dayEvents) {
                if (event.type === 'entry') currentStatus = NiddahStatus.Niddah;
                else if (event.type === 'mikvah') currentStatus = NiddahStatus.Tahara;
            }

            statusMap.set(day.Abs, currentStatus);
        }

        return statusMap;
    }
}
