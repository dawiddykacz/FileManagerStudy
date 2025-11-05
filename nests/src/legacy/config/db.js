const path = require('path');
const Database = require('better-sqlite3');
const dbFile = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data.db');
const db = new Database(dbFile);
module.exports = db;