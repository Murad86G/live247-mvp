// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// database module (initializes and exports sqlite db)
const db = require('./backend/db');

// routers
const streamsRouter = require('./backend/routes/streams');
const plansRouter = require('./backend/routes/plans');

const app = express();
const PORT = 3000;

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// api routes
app.use('/api/plans', plansRouter(db));
app.use('/api/streams', streamsRouter(db));

// static files
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'public')));

// main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
