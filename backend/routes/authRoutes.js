// backend/routes/authRoutes.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const createClientModule = require('../auth');

const router = express.Router();

// Session middleware
router.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: true
  })
);

let client, generators;

// Initialize OIDC client at server start
(async () => {
  try {
    const result = await createClientModule();
    client = result.client;
    generators = result.generators;
    console.log('✅ OIDC client initialized');
  } catch (err) {
    console.error('OIDC client initialization error:', err);
  }
})();

// /login route
router.get('/login', async (req, res) => {
  if (!client || !generators) return res.status(500).send('OIDC client not initialized');

  const code_verifier = generators.codeVerifier();
  const code_challenge = generators.codeChallenge(code_verifier);

  req.session.code_verifier = code_verifier;

  const authUrl = client.authorizationUrl({
    scope: 'openid profile email',
    code_challenge,
    code_challenge_method: 'S256'
  });

  res.redirect(authUrl);
});

// /callback route
router.get('/callback', async (req, res) => {
  if (!client || !generators) return res.status(500).send('OIDC client not initialized');

  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(process.env.ZITADEL_REDIRECT_URI, params, {
      code_verifier: req.session.code_verifier
    });

    req.session.tokenSet = tokenSet;
    req.session.userinfo = await client.userinfo(tokenSet.access_token);

    res.redirect('/'); // redirect to main page or dashboard
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send('Authentication failed');
  }
});

// /logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send('Logged out');
  });
});

module.exports = router;
