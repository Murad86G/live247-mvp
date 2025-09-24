const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const streamsRouter = require('./backend/routes/streams');

const app = express();
const PORT = 3000;

// DB init
const db = new sqlite3.Database('./database/db.sqlite', (err) => {
  if (err) {
    console.error('DB error:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.run(`CREATE TABLE IF NOT EXISTS streams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  yt_key TEXT NOT NULL,
  status TEXT DEFAULT 'offline'
)`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API routes
app.use('/api/streams', streamsRouter(db));

// Раздаём статику
app.use(express.static(path.join(__dirname, 'frontend'))); // html, css, js
app.use(express.static(path.join(__dirname, 'public')));   // gifs, картинки

// Главная страница (index.html из frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
