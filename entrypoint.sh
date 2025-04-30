#!/usr/bin/env sh
set -e
echo "⏳ Ejecutando migraciones..."
npm run db:migrate
echo "✅ Migraciones completadas, arrancando la app"
exec "$@"