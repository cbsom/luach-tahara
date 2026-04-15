import fs from 'fs';
import initSqlJs from 'sql.js';

async function inspectDb() {
    try {
        const SQL = await initSqlJs();
        const fileBuffer = fs.readFileSync('scratch/test_backup.sqlite');
        const db = new SQL.Database(fileBuffer);

        // List tables
        const res = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
        const tables = res[0].values.map(v => v[0]);
        console.log('Tables in database:', tables);

        for (const table of tables) {
            const countRes = db.exec(`SELECT count(*) FROM ${table}`);
            console.log(`Table ${table} has ${countRes[0].values[0][0]} rows`);
        }

        // Specifically check the tables mentioned in previous migration work
        const interestingTables = ['entries', 'kavuahs', 'taharaEvents', 'occasions', 'settings'];
        for (const table of interestingTables) {
            if (tables.includes(table)) {
                const sample = db.exec(`SELECT * FROM ${table} LIMIT 1`);
                if (sample.length > 0) {
                    console.log(`Sample from ${table}:`, sample[0].values[0]);
                }
            }
        }
    } catch (err) {
        console.error('Error inspecting database:', err);
    }
}

inspectDb();
