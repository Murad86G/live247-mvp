// backend/auth.js
require('dotenv').config();
const { discovery, randomPKCECodeVerifier, randomState } = require('openid-client');

let cachedClient = null;

async function createClient() {
  if (cachedClient) return cachedClient;

  console.log("🔍 ZITADEL_ISSUER =", process.env.ZITADEL_ISSUER);

  // Разрешаем self-signed сертификаты (для локального zitadel)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  // Discover metadata
  const issuer = await discovery(process.env.ZITADEL_ISSUER);
  console.log("✅ OIDC metadata discovered:", issuer.issuer);

  // Создаем OIDC client
  const client = new issuer.Client({
    client_id: process.env.ZITADEL_CLIENT_ID,
    client_secret: process.env.ZITADEL_CLIENT_SECRET,
    redirect_uris: [process.env.ZITADEL_REDIRECT_URI],
    response_types: ['code'],
  });

  cachedClient = { client, randomPKCECodeVerifier, randomState };
  return cachedClient;
}

module.exports = createClient;
