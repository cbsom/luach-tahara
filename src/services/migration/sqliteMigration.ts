import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { jDate, Locations } from 'jcal-zmanim';

export async function parseSqliteAndMigrate(buffer: Uint8Array): Promise<any> {
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    const db = new SQL.Database(buffer);

    const migratedData: any = {
        entries: [],
        kavuahs: [],
        taharaEvents: [],
        userEvents: [],
        settings: null,
    };

    try {
        // --- 1. Migrate Entries ---
        const entriesRes = db.exec("SELECT * FROM entries ORDER BY dateAbs");
        
        // RN60 entries format: entryId, dateAbs, day, ignoreForFlaggedDates, ignoreForKavuah, comments
        const idMap = new Map<number, string>(); // entryId -> our generated id

        if (entriesRes.length > 0) {
            let prevAbs = 0;
            for (let row of entriesRes[0].values) {
                const entryId = row[entriesRes[0].columns.indexOf('entryId')] as number;
                const dateAbs = row[entriesRes[0].columns.indexOf('dateAbs')] as number;
                const isDay = !!row[entriesRes[0].columns.indexOf('day')];
                const ignoreForFlaggedDates = !!row[entriesRes[0].columns.indexOf('ignoreForFlaggedDates')];
                const ignoreForKavuah = !!row[entriesRes[0].columns.indexOf('ignoreForKavuah')];
                const comments = row[entriesRes[0].columns.indexOf('comments')] as string || '';

                const j = new jDate(dateAbs);
                const onahVal = isDay ? 1 : -1;
                const haflaga = prevAbs === 0 ? 0 : (dateAbs - prevAbs + 1);
                prevAbs = dateAbs;

                const logicalId = `${dateAbs}-${onahVal}`;
                idMap.set(entryId, logicalId); // map the old DB id to the new logical string ID

                migratedData.entries.push({
                    id: logicalId,
                    jewishDate: { year: j.Year, month: j.Month, day: j.Day },
                    onah: onahVal,
                    haflaga,
                    ignoreForFlaggedDates,
                    ignoreForKavuah,
                    comments
                });
            }
        }

        // --- 2. Migrate Kavuahs ---
        const kavuahsRes = db.exec("SELECT * FROM kavuahs");
        // kavuahType, settingEntryId, specialNumber, cancelsOnahBeinunis, active, [ignore], kavuahId
        if (kavuahsRes.length > 0) {
            for (let row of kavuahsRes[0].values) {
                const settingEntryId = row[kavuahsRes[0].columns.indexOf('settingEntryId')] as number;
                const newSettingEntryId = idMap.get(settingEntryId);

                if (!newSettingEntryId) continue; // Must map to a valid entry

                migratedData.kavuahs.push({
                    kavuahType: row[kavuahsRes[0].columns.indexOf('kavuahType')],
                    settingEntryId: newSettingEntryId,
                    specialNumber: row[kavuahsRes[0].columns.indexOf('specialNumber')],
                    cancelsOnahBeinunis: !!row[kavuahsRes[0].columns.indexOf('cancelsOnahBeinunis')],
                    active: !!row[kavuahsRes[0].columns.indexOf('active')],
                    ignore: !!row[kavuahsRes[0].columns.indexOf('ignore')],
                    // old kavuahs usually don't have entryIds tracked robustly, we'll assign empty array for now
                    // The app can recalculate them or user will just have them mapped by settingEntryId
                    entryIds: [newSettingEntryId]
                });
            }
        }

        // --- 3. Migrate TaharaEvents ---
        const taharaEventsRes = db.exec("SELECT * FROM taharaEvents");
        // dateAbs, taharaEventType
        if (taharaEventsRes.length > 0) {
            for (let row of taharaEventsRes[0].values) {
                const dateAbs = row[taharaEventsRes[0].columns.indexOf('dateAbs')] as number;
                const taharaEventType = row[taharaEventsRes[0].columns.indexOf('taharaEventType')] as number;
                
                const j = new jDate(dateAbs);
                // In RN TaharaEventType enum: 1 = hefsek, 2 = mikvah. 
                // Wait, need to check if 1, 2 correspond to hefsek, mikvah strings
                const typeStr = taharaEventType === 2 ? 'mikvah' : 'hefsek';

                migratedData.taharaEvents.push({
                    jewishDate: { year: j.Year, month: j.Month, day: j.Day },
                    type: typeStr
                });
            }
        }

        // --- 4. Migrate UserOccasions ---
        const occasionsRes = db.exec("SELECT * FROM occasions");
        // title, type, dateAbs, color, comments
        if (occasionsRes.length > 0) {
            for (let row of occasionsRes[0].values) {
                const title = row[occasionsRes[0].columns.indexOf('title')] as string;
                const type = row[occasionsRes[0].columns.indexOf('type')] as number;
                const dateAbs = row[occasionsRes[0].columns.indexOf('dateAbs')] as number;
                const color = row[occasionsRes[0].columns.indexOf('color')] as string || '#fde047';
                const comments = row[occasionsRes[0].columns.indexOf('comments')] as string || '';

                const j = new jDate(dateAbs);

                migratedData.userEvents.push({
                    name: title || 'Imported Event',
                    type: type, // Matches UserEventTypes enum mostly
                    jYear: j.Year,
                    jMonth: j.Month,
                    jDay: j.Day,
                    jAbs: dateAbs,
                    sDate: j.getDate().toISOString(),
                    backColor: color,
                    textColor: '#1e293b',
                    notes: comments,
                    remindDayOf: false,
                    remindDayBefore: false
                });
            }
        }

        // --- 5. Migrate Settings ---
        const settingsRes = db.exec("SELECT * FROM settings");
        if (settingsRes.length > 0) {
            const row = settingsRes[0].values[0];
            const getCol = (colName: string) => row[settingsRes[0].columns.indexOf(colName)];

            // Need to lookup Location by Location ID, wait, jcal-zmanim Locations has array index 
            const locId = getCol('locationId') as number || 185;
            const originalLoc = Locations[locId];

            migratedData.settings = {
                locationName: originalLoc ? originalLoc.Name : 'Jerusalem',
                showOhrZeruah: !!getCol('showOhrZeruah'),
                keepThirtyOne: !!getCol('keepThirtyOne'),
                onahBeinunis24Hours: !!getCol('onahBeinunis24Hours'),
                numberMonthsAheadToWarn: getCol('numberMonthsAheadToWarn') as number || 12,
                keepLongerHaflagah: !!getCol('keepLongerHaflagah'),
                dilugChodeshPastEnds: !!getCol('cheshbonKavuahByCheshbon'),
                haflagaOfOnahs: !!getCol('haflagaOfOnahs'),
                kavuahDiffOnahs: !!getCol('kavuahDiffOnahs'),
                noProbsAfterEntry: !!getCol('noProbsAfterEntry'),
                discreetReminders: !!getCol('discreet'),
            };
        }

    } catch (err) {
        console.error("Migration error reading sql tables", err);
        throw err;
    } finally {
        db.close();
    }

    return migratedData;
}
