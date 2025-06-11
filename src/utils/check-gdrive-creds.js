const fs = require('fs');
const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!path || !fs.existsSync(path)) {
  throw new Error(
    `Credencial de Google no encontrada. Verifica GOOGLE_APPLICATION_CREDENTIALS (${path})`
  );
}