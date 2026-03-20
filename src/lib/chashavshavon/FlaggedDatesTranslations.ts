// Translation utilities for Flagged Dates descriptions
// Ported/Adapted from Luach_RN60/HEBREW_ENGLISH_TRANSLATIONS.md

export const FlaggedDatesTranslations: Record<string, string> = {
  'Yom Hachodesh': 'יום החודש',
  'Thirtieth Day': 'יום השלושים',
  'Thirty First Day': 'יום השלושים ואחד',
  ' (changed from 30 to 29)': ' (השתנה מ-30 ל-29)',
  ' (changed from 30 to 1)': ' (השתנה מ-30 ל-1)',
  ' (24 hour)': ' (24 שעות)',
  'Ohr Zarua of the ': "אור זרוע של ה-",
  'Kavuah of ': 'וסת של ',
  'Kavuah for ': 'וסת עבור ',
  'Yom Haflagah (of ': 'יום הפלגה (של ',
  ' days)': ' ימים)',
  'Haflagah of Onahs (of ': 'הפלגת עונות (של ',
  ' onahs)': ' עונות)',
  'Yom Haflaga (': 'יום הפלגה (',
  ') which was never overrided': ') שלא הוחלפה',
};

/**
 * Translate a hardcoded flagged date description to Hebrew
 * @param description The English description from FlaggedDatesGenerator
 * @returns Hebrew description if found, otherwise the original
 */
export function translateFlagDescription(description: string, lang: 'en' | 'he'): string {
  if (lang === 'en') return description;

  // Handle nested/prefixed translations like "Ohr Zarua of the Yom Hachodesh"
  const translated = description;

  // Check for Ohr Zarua
  if (translated.startsWith('Ohr Zarua of the ')) {
    const base = translated.replace('Ohr Zarua of the ', '');
    return FlaggedDatesTranslations['Ohr Zarua of the '] + translateFlagDescription(base, 'he');
  }

  // Check for Kavuah of/for
  // The generator uses "Kavuah of " followed by kavuah.toString()
  if (translated.startsWith('Kavuah of ') || translated.startsWith('Kavuah for ')) {
    const isOf = translated.startsWith('Kavuah of ');
    const prefix = isOf ? 'Kavuah of ' : 'Kavuah for ';
    const hebPrefix = FlaggedDatesTranslations[prefix];
    
    // We can't use kavuah.toStringHebrew directly here because we only have a string.
    // Let's try to translate common Kavuah fragments.
    let base = translated.replace(prefix, '');
    
    // Try some common replacements
    base = base.replace('Night-time ', 'לילה ')
               .replace('Day-time ', 'יום ')
               .replace('every ', 'כל ')
               .replace(' days', ' ימים')
               .replace(' day of the Jewish Month', ' לחודש העברי')
               .replace(' month', ' חודש')
               .replace(' Onahs', ' עונות')
               .replace('week', 'שבוע')
               .replace('through Ma\'ayan Pasuach', 'דרך מעיין פתוח')
               .replace('in the interval pattern of "', 'בתבנית מרווח של "')
               .replace('subtract ', 'הפחת ')
               .replace('add ', 'הוסף ')
               .replace('of "Dilug Haflaga"', 'של "דילוג הפלגה"')
               .replace('of "Dilug Yom Hachodesh"', 'של "דילוג יום החודש"');

    return hebPrefix + base;
  }

  // Simple direct mapping
  if (FlaggedDatesTranslations[translated]) return FlaggedDatesTranslations[translated];

  // Handle dynamic strings
  if (translated.includes('Yom Haflagah (of ') && translated.includes(' days)')) {
     return translated.replace('Yom Haflagah (of ', FlaggedDatesTranslations['Yom Haflagah (of '])
                     .replace(' days)', FlaggedDatesTranslations[' days)']);
  }
  if (translated.includes('Haflagah of Onahs (of ') && translated.includes(' onahs)')) {
    return translated.replace('Haflagah of Onahs (of ', FlaggedDatesTranslations['Haflagah of Onahs (of '])
                    .replace(' onahs)', FlaggedDatesTranslations[' onahs)']);
  }
  if (translated.includes('Yom Haflaga (') && translated.includes(') which was never overrided')) {
      return translated.replace('Yom Haflaga (', FlaggedDatesTranslations['Yom Haflaga ('])
                      .replace(') which was never overrided', FlaggedDatesTranslations[') which was never overrided'])
                      .replace(' days', ' ימים');
  }
  if (translated.includes(' (24 hour)')) {
     return translateFlagDescription(translated.replace(' (24 hour)', ''), 'he') + FlaggedDatesTranslations[' (24 hour)'];
  }
  if (translated.includes(' (changed from 30 to 29)')) {
     return translateFlagDescription(translated.replace(' (changed from 30 to 29)', ''), 'he') + FlaggedDatesTranslations[' (changed from 30 to 29)'];
  }
  if (translated.includes(' (changed from 30 to 1)')) {
     return translateFlagDescription(translated.replace(' (changed from 30 to 1)', ''), 'he') + FlaggedDatesTranslations[' (changed from 30 to 1)'];
  }

  return translated;
}
