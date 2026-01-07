// TaharaEvent - Represents events in the Tahara process
import { jDate } from 'jcal-zmanim';
import { JewishDate } from '@/types';
import { toJDate, fromJDate } from '@/lib/jcal';

/**
 * Enum for Tahara Event Types
 * Using bit flags for potential future combination support
 */
export enum TaharaEventType {
    Hefsek = 1,
    Bedika = 2,
    Shailah = 4,
    Mikvah = 8,
}

/**
 * Represents a Tahara-related event (Hefsek Tahara, Bedika, Shailah, or Mikvah)
 */
export class TaharaEvent {
    public jdate: jDate;
    public taharaEventType: TaharaEventType;
    public taharaEventId?: string;

    constructor(jdate: jDate, taharaEventType: TaharaEventType, taharaEventId?: string) {
        this.jdate = jdate;
        this.taharaEventType = taharaEventType;
        this.taharaEventId = taharaEventId;
    }

    /**
     * Create from JewishDate interface
     */
    static fromJewishDate(
        jewishDate: JewishDate,
        eventType: 'hefsek' | 'bedika' | 'shailah' | 'mikvah',
        id?: string
    ): TaharaEvent {
        const jd = toJDate(jewishDate);
        const type = TaharaEvent.stringToEventType(eventType);
        return new TaharaEvent(jd, type, id);
    }

    /**
     * Convert string type to enum
     */
    static stringToEventType(typeStr: 'hefsek' | 'bedika' | 'shailah' | 'mikvah'): TaharaEventType {
        switch (typeStr) {
            case 'hefsek':
                return TaharaEventType.Hefsek;
            case 'bedika':
                return TaharaEventType.Bedika;
            case 'shailah':
                return TaharaEventType.Shailah;
            case 'mikvah':
                return TaharaEventType.Mikvah;
            default:
                throw new Error(`Unknown tahara event type: ${typeStr}`);
        }
    }

    /**
     * Convert enum to string type
     */
    static eventTypeToString(type: TaharaEventType): 'hefsek' | 'bedika' | 'shailah' | 'mikvah' {
        switch (type) {
            case TaharaEventType.Hefsek:
                return 'hefsek';
            case TaharaEventType.Bedika:
                return 'bedika';
            case TaharaEventType.Shailah:
                return 'shailah';
            case TaharaEventType.Mikvah:
                return 'mikvah';
            default:
                throw new Error(`Unknown tahara event type: ${type}`);
        }
    }

    /**
     * Gets the string representation of this TaharaEvent's type
     */
    toTypeString(): string {
        return TaharaEvent.toTaharaEventTypeString(this.taharaEventType);
    }

    /**
     * Gets the Hebrew string representation of this TaharaEvent's type
     */
    toTypeStringHebrew(): string {
        return TaharaEvent.toTaharaEventTypeStringHebrew(this.taharaEventType);
    }

    /**
     * Check if this event has an ID
     */
    get hasId(): boolean {
        return !!this.taharaEventId;
    }

    /**
     * Sorts a list of TaharaEvents chronologically
     */
    static sortList(taharaEventsList: TaharaEvent[]): TaharaEvent[] {
        return taharaEventsList.sort((a, b) => a.jdate.Abs - b.jdate.Abs);
    }

    /**
     * Gets the English string representation of a TaharaEventType
     */
    static toTaharaEventTypeString(taharaEventType: TaharaEventType): string {
        switch (taharaEventType) {
            case TaharaEventType.Hefsek:
                return 'Hefsek Tahara';
            case TaharaEventType.Bedika:
                return 'Bedika';
            case TaharaEventType.Shailah:
                return 'Shailah';
            case TaharaEventType.Mikvah:
                return 'Mikvah';
            default:
                return 'Unknown';
        }
    }

    /**
     * Gets the Hebrew string representation of a TaharaEventType
     */
    static toTaharaEventTypeStringHebrew(taharaEventType: TaharaEventType): string {
        switch (taharaEventType) {
            case TaharaEventType.Hefsek:
                return 'הפסק טהרה';
            case TaharaEventType.Bedika:
                return 'בדיקה';
            case TaharaEventType.Shailah:
                return 'שאלה';
            case TaharaEventType.Mikvah:
                return 'מקווה';
            default:
                return '';
        }
    }

    /**
     * Convert to our type system
     */
    toJewishDateAndType(): { jewishDate: JewishDate; type: 'hefsek' | 'bedika' | 'shailah' | 'mikvah'; id?: string } {
        return {
            jewishDate: fromJDate(this.jdate),
            type: TaharaEvent.eventTypeToString(this.taharaEventType),
            id: this.taharaEventId,
        };
    }
}
