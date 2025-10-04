// server.js
require('dotenv').config(); // load .env variables

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

// database module
const db = require('./backend/db');

// routers
const streamsRouter = require('./backend/routes/streams');
const plansRouter = require('./backend/routes/plans');
const authRouter = require('./backend/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001; // use PORT from .env or fallback

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey', // use SESSION_SECRET from .env
    resave: false,
    saveUninitialized: true
  })
);

// api routes
app.use('/api/plans', plansRouter(db));
app.use('/api/streams', streamsRouter(db));
app.use('/auth', authRouter); // auth routes

// serve static files
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'public')));

// main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// optional health check route
app.get('/health', (req, res) => {
  res.send('OK');
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
