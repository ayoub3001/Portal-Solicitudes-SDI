# Portal de Solicitudes

Aplicación full-stack para gestionar solicitudes internas en una empresa tecnológica. Los empleados pueden crear solicitudes, firmarlas digitalmente y los administradores pueden aprobarlas o rechazarlas. Incluye autenticación JWT, documentación OpenAPI (Scramble) y está listo para probar o evaluar con Docker Compose.

---

## Objetivo

Desarrollar un portal donde los usuarios puedan:

- Crear solicitudes.
- Adjuntar documentación.
- Firmarlas digitalmente.
- Consultar su estado.

Los administradores pueden revisar, aprobar o rechazar las solicitudes.

---

## Requisitos

- **Docker Engine** 24+
- **Docker Compose** v2

Opcional (desarrollo sin Docker):

- PHP **8.4+**, Composer 2
- Node.js **22.12+**, npm 10+
- PostgreSQL 16, MongoDB 7

---

## Arranque rápido con Docker

```bash
git clone <url-del-repositorio>
cd portalSolicitudes
docker compose up --build
```

La primera vez, el entorno instala dependencias, configura variables, ejecuta migraciones y seeders (sólo si la tabla `users` está vacía).

Cuando todos los servicios estén en estado healthy:


| Servicio                         | URL                                                                        |
| -------------------------------- | -------------------------------------------------------------------------- |
| **Frontend (Angular)**           | [http://localhost:4200](http://localhost:4200)                             |
| **Login**                        | [http://localhost:4200/login](http://localhost:4200/login)                 |
| **API REST**                     | [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)                     |
| **Healthcheck**                  | [http://127.0.0.1:8000/up](http://127.0.0.1:8000/up)                       |
| **Documentación API (Scramble)** | [http://127.0.0.1:8000/docs/api](http://127.0.0.1:8000/docs/api)           |
| **OpenAPI JSON**                 | [http://127.0.0.1:8000/docs/api.json](http://127.0.0.1:8000/docs/api.json) |


> El frontend está configurado para consumir la API en `http://127.0.0.1:8000/api`. No uses `http://backend:8000` desde el navegador del host; ese hostname es interno de Docker.

---

## Usuarios de prueba

Se crean usando `UsersSeed` y `SolicitudesSeed`:


| Email                 | Contraseña | Rol   | Estado   | Uso                                       |
| --------------------- | ---------- | ----- | -------- | ----------------------------------------- |
| `admin@portal.com`    | `password` | admin | active   | Ve todas las solicitudes, aprueba/rechaza |
| `user@portal.com`     | `password` | user  | active   | Usuario demo para pruebas rápidas         |
| `inactivo@portal.com` | `password` | user  | inactive | Probar login bloqueado (403)              |
| *(5 usuarios Faker)*  | `password` | user  | active   | Datos adicionales aleatorios              |


En el login (modo desarrollo) puedes entrar rápido como Admin o Usuario sin teclear credenciales.

Test de login por API:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"password"}'
```

---

## Comandos dentro de Docker

En general, todo lo de Laravel se ejecuta en el contenedor `backend`:

### Migraciones

```bash
docker compose exec backend php artisan migrate
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan migrate:fresh --force  # Borra todo y rehace
```

### Seeders

```bash
docker compose exec backend php artisan db:seed --force
docker compose exec backend php artisan migrate:fresh --seed --force
docker compose exec backend php artisan db:seed --class=UsersSeed --force
docker compose exec backend php artisan db:seed --class=SolicitudesSeed --force
```

### Tests (PHPUnit)

```bash
docker compose exec backend php artisan test
docker compose exec backend php artisan test --filter=AuthApiTest
docker compose exec backend php artisan test --filter=RequestApiTest
```

### Otros útiles

```bash
docker compose exec backend php artisan storage:link --force  # Enlace público a storage
docker compose logs -f backend                               # Logs de Laravel
docker compose ps                                            # Ver estado contenedores
docker compose down -v                                       # Parar y borrar todo (incl. volúmenes)
```

---

## Instalación local (sin Docker)

### Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
php artisan storage:link
# Configura PostgreSQL y MongoDB en .env
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Tests locales

```bash
cd backend
php artisan test
```

---

## Arquitectura

```
portalSolicitudes/
├── backend/
├── frontend/
├── docker-compose.yml
└── docker/
```

---

## Flujo de negocio

1. Un usuario crea una solicitud (`pending`) con título, descripción, fecha y documento opcional.
2. El propio usuario la puede firmar desde el navegador (`signed`).
3. Un Admin aprueba (`approved`) o rechaza (`rejected`).

---

## Stack técnico

| Capa              | Tecnología                                         |
| ----------------- | --------------------------------------------------|
| Backend           | Laravel 13, PHP 8.4, JWT (`tymon/jwt-auth`)        |
| API docs          | Scramble (OpenAPI)                                 |
| BD principal      | PostgreSQL 16                                      |
| Logs de actividad | MongoDB 7                                          |
| Frontend          | Angular standalone + Signals, Tailwind CSS 4       |
| Calendario        | FullCalendar 6                                     |
| Contenedores      | Docker Compose                                     |

---

## Frontend — capas principales

- **Models / Services:** tipado alineado con OpenAPI (`AuthService`, `RequestService`).
- **Interceptors:** `JwtInterceptor` (Bearer token), `ErrorInterceptor` (401/403/422/500).
- **Guards:** `authGuard`, `adminGuard`.
- **State:** `AuthState` con Signals.
- **Dashboard:** calendario y detalle de solicitudes, firma y acciones de admin.

---

## Backend — autorización

- **Policies** (`RequestPolicy`): controla ver, editar, firmar y aprobar según rol y estado.
- **Middleware** `role:admin` en rutas de aprobación/rechazo.
- La protección real es en backend, aunque la UI también oculta botones según rol.

---

## Decisiones técnicas

| Decisión                      | Motivo                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| JWT en lugar de sesión        | API stateless, fácil de consumir desde Angular                                                |
| PostgreSQL + MongoDB          | Relacional para datos principales; MongoDB para logs de actividad                             |
| Angular standalone + Signals  | Arquitectura moderna sin NgModules, estado reactivo nativo                                   |
| FullCalendar                  | Vista de calendario potente y flexible                                                       |
| Factories con archivos reales | Genera PNG/PDF en `storage/` para pruebas y demo frontend                                    |
| Seed idempotente en Docker    | Solo mete datos demo si `users` está vacía                                                   |
| Scramble                      | Documentación OpenAPI generada a partir del código Laravel                                   |

---

## Uso de IA

Se utilizó IA como herramienta de apoyo para acelerar tareas repetitivas, principalmente:

- Generación inicial de tests.
- Creación de datos de prueba (seeders y factories).
- Apoyo puntual en maquetación de componentes Angular.

Toda la lógica de negocio, arquitectura, modelos de datos, rutas, autorización y revisión final del código fueron realizadas y validadas manualmente.

---

## Qué mejoraría con más tiempo

- Completar el registro y visualización de logs en MongoDB.
- Tests E2E (Playwright/Cypress) para flujos completos: login → crear → firmar → aprobar.
- Tests unitarios en Angular para servicios, guards y componentes críticos.
- Paginación y filtros en listado de solicitudes.
- Notificaciones al cambiar estado (email o WebSockets).
- Refresh token automático antes de expirar el JWT.
- Internacionalización (i18n) si el portal crece.
- Panel admin con métricas (solicitudes por estado, tiempos de resolución).

---

## Troubleshooting

### El frontend no muestra firmas o documentos

```bash
docker compose exec backend php artisan storage:link --force
ls storage/app/public/signatures/
ls storage/app/public/requests/documents/
```

Si los seeders se ejecutaron antes de tener factories con archivos reales, resetea:

```bash
docker compose exec backend php artisan migrate:fresh --seed --force
```

### Error de base de datos / SQLite

El proyecto usa **PostgreSQL**, no SQLite. Verifica en el contenedor:

```bash
docker compose exec backend grep DB_CONNECTION .env
# Debe ser: DB_CONNECTION=pgsql
```

### CORS o 401 desde el frontend

- Comprueba que `environment.apiUrl` apunte a `http://127.0.0.1:8000/api`.
- El token JWT va en `Authorization: Bearer <token>` (gestionado por `JwtInterceptor`).

### Reinicio limpio

```bash
docker compose down -v
docker compose up --build
```

Elimina volúmenes `postgres_data`, `mongodb_data` y `backend_storage`.

---

## Licencia

Proyecto de prueba técnica. Uso educativo y evaluación.