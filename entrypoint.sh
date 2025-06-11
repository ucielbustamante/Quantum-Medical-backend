#!/usr/bin/env sh
set -e

echo "⏳ Ejecutando migraciones..."
npx sequelize-cli db:migrate

if [ "$RUN_SEEDERS" = "true" ]; then
  echo "🌱 Ejecutando seeders..."
  npx sequelize-cli db:seed:undo:all
  npx sequelize-cli db:seed:all
fi

echo "🧹 Creando carpeta temporal..."
mkdir -p /app/uploads/temp
echo "🧹 Limpiando archivos temporales..."
rm -rf /app/uploads/temp/*

echo "✅ Migraciones y seeders completados, arrancando la app"
exec "$@"