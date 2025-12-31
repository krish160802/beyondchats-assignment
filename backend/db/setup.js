const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");
const initSQL = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");

const db = new Database(dbPath);
db.exec(initSQL);

console.log("Database initialized successfully");
