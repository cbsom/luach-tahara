import initSqlJs from 'sql.js';

async function run() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run("CREATE TABLE test (name TEXT);");
  const res = db.exec("SELECT * FROM test");
  console.log("Empty Select:", JSON.stringify(res));

  db.run("INSERT INTO test VALUES ('hello')");
  const res2 = db.exec("SELECT * FROM test");
  console.log("1 row Select:", JSON.stringify(res2));
}

run();
