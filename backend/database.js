const Database = require("better-sqlite3");

const db = new Database("database.db");

//create tasks table
db.prepare(
  `
    CREATE TABLE IF NOT EXISTS tasks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`,
).run();

console.log("Database connected.");

module.exports = db;
