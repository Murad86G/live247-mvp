const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'db.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', dbPath);
  }
});

db.serialize(() => {
  // Plans table
  db.run(`CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    streams_limit INTEGER NOT NULL,
    cpu_limit REAL NOT NULL,
    storage_limit INTEGER NOT NULL,
    description TEXT
  )`);

  // Streams table
  db.run(`CREATE TABLE IF NOT EXISTS streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    yt_key TEXT NOT NULL,
    status TEXT DEFAULT 'offline'
  )`);
});

module.exports = db;
