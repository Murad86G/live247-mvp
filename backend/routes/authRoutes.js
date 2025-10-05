// backend/routes/authRoutes.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const createClient = require('../auth');

const router = express.Router();

// Session middleware
router.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: true
  })
);

let client;

// Initialize OIDC client at server startup
(async () => {
  try {
    const result = await createClient();
    client = result.client;
    console.log('✅ OIDC client initialized');
  } catch (err) {
    console.error('OIDC client initialization error:', err);
  }
})();

// /login route
router.get('/login', async (req, res) => {
  if (!client) return res.status(500).send('OIDC client not initialized');

  try {
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;

    const authUrl = client.buildAuthorizationUrl({
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state
    });

    console.log('🔗 Redirecting to:', authUrl);
    res.redirect(authUrl);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Error during login initialization');
  }
});

// /callback route
router.get('/callback', async (req, res) => {
  if (!client) return res.status(500).send('OIDC client not initialized');

  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(
      process.env.ZITADEL_REDIRECT_URI,
      params,
      {
        code_verifier: req.session.codeVerifier,
        state: req.session.state
      }
    );

    req.session.tokenSet = tokenSet;
    req.session.user = tokenSet.claims();

    console.log('✅ Login successful');
    res.redirect('/profile');
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send('Authentication failed');
  }
});

// /profile route
router.get('/profile', (req, res) => {
  if (!req.session.user) return res.status(401).send('Not logged in');
  res.json(req.session.user);
});

// /logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('Logged out');
  });
});

module.exports = router;
