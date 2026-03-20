// Hebrew Numbers (Gematria) utilities
// Ported from Utils.js in Luach_RN60

const jsd = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const jtd = ['י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
const jhd = ['ק', 'ר', 'ש', 'ת'];

/**
 * Gets the Jewish representation of a number (365 = שס"ה)
 * Minimum number is 1 and maximum is 9999.
 * @param number The number to convert
 */
export function toHebrewNumber(number: number): string {
    if (number < 1) {
        return "";
    }

    if (number > 9999) {
        throw new Error('Max value is 9999');
    }

    let n = number;
    let retval = '';

    if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        retval += jsd[thousands - 1] + "'";
        n = n % 1000;
    }

    while (n >= 400) {
        retval += 'ת';
        n -= 400;
    }

    if (n >= 100) {
        const hundreds = Math.floor(n / 100);
        retval += jhd[hundreds - 1];
        n = n % 100;
    }

    if (n === 15) {
        retval += 'טו';
    } else if (n === 16) {
        retval += 'טז';
    } else {
        if (n > 9) {
            retval += jtd[Math.floor(n / 10) - 1];
        }
        if (n % 10 > 0) {
            retval += jsd[(n % 10) - 1];
        }
    }

    if (number > 999 && number % 1000 < 10) {
        retval = "'" + retval;
    } else if (retval.length > 1) {
        retval = retval.slice(0, -1) + '"' + retval[retval.length - 1];
    }
    return retval;
}
