#!/bin/bash
set -euo pipefail

cd /var/www/html

# --- .env inicial ---
if [ ! -f .env ]; then
  cp .env.example .env
fi

set_env() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env
  else
    echo "${key}=${value}" >> .env
  fi
}

# Alinear .env con los servicios Docker (Laravel lee .env, no solo variables del compose)
set_env "APP_URL" "${APP_URL:-http://localhost:8000}"
set_env "DB_CONNECTION" "${DB_CONNECTION:-pgsql}"
set_env "DB_HOST" "${DB_HOST:-postgres}"
set_env "DB_PORT" "${DB_PORT:-5432}"
set_env "DB_DATABASE" "${DB_DATABASE:-portal_solicitudes}"
set_env "DB_USERNAME" "${DB_USERNAME:-postgres}"
set_env "DB_PASSWORD" "${DB_PASSWORD:-secret}"
set_env "MONGODB_URI" "${MONGODB_URI:-mongodb://mongodb:27017}"
set_env "MONGODB_DATABASE" "${MONGODB_DATABASE:-portal_solicitudes_logs}"

# Permisos de directorios escribibles
mkdir -p storage/framework/{sessions,views,cache/data} storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# Clave de aplicación
if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force --no-interaction
fi

# JWT
if ! grep -q '^JWT_SECRET=' .env || grep -q '^JWT_SECRET=$' .env; then
  php artisan jwt:secret --force --no-interaction
fi

# Assets publicados por paquetes (idempotente)
php artisan vendor:publish --tag=laravel-assets --force --no-interaction 2>/dev/null || true

# Enlace simbólico storage/app/public → public/storage
php artisan storage:link --force --no-interaction 2>/dev/null || true

# Esperar PostgreSQL
echo "Esperando PostgreSQL en ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-postgres}" >/dev/null 2>&1; do
  sleep 2
done

php artisan config:clear --no-interaction
php artisan migrate --force --no-interaction

# Seed idempotente: solo si la tabla users está vacía
USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null | tail -1 | tr -d '[:space:]')
if [ "${USER_COUNT:-0}" = "0" ]; then
  echo "Ejecutando seeders (tabla users vacía)..."
  php artisan db:seed --force --no-interaction
else
  echo "Seed omitido: ya existen ${USER_COUNT} usuario(s)."
fi

exec "$@"
