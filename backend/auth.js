// backend/auth.js
require('dotenv').config(); // load .env variables
const { Issuer, generators } = require('openid-client');

let cachedClient = null;

async function createClient() {
  if (cachedClient) return cachedClient;

  // Discover ZITADEL metadata from .env
  const issuer = await Issuer.discover(process.env.ZITADEL_ISSUER);

  const client = new issuer.Client({
    client_id: process.env.ZITADEL_CLIENT_ID,       
    client_secret: process.env.ZITADEL_CLIENT_SECRET, 
    redirect_uris: [process.env.ZITADEL_REDIRECT_URI], 
    response_types: ['code']
  });

  cachedClient = { client, generators };
  return cachedClient;
}

module.exports = createClient;
