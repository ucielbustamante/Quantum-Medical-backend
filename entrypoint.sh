#!/usr/bin/env sh
set -e

echo "⏳ Ejecutando migraciones..."
npx sequelize-cli db:migrate

if [ "$RUN_SEEDERS" = "true" ]; then
  echo "🌱 Ejecutando seeders..."
  npx sequelize-cli db:seed:undo:all
  npx sequelize-cli db:seed:all
fi

echo "✅ Migraciones y seeders completados, arrancando la app"
exec "$@"