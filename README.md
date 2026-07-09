# Coworking Final

Aplicacion full stack para explorar espacios de coworking, reservar horarios, guardar favoritos, dejar resenas y recibir notificaciones.

## Stack

- Backend: NestJS, Prisma 7, PostgreSQL, JWT, Passport, bcrypt.
- Frontend: Next.js 16 App Router, React 19, Tailwind CSS 4.
- Deploy sugerido: backend en Render o Railway, frontend en Vercel.

## Estructura

```text
backend/   API REST NestJS + Prisma
frontend/  Aplicacion web Next.js
```

## Variables de entorno

Backend (`backend/.env`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="https://your-frontend.vercel.app"
PORT="3000"
```

Frontend (`frontend/.env.local` en desarrollo, Vercel Environment Variables en produccion):

```env
NEXT_PUBLIC_API_URL="https://your-backend.onrender.com"
```

Notas:

- `DATABASE_URL` debe apuntar a PostgreSQL.
- `JWT_SECRET` debe ser largo y privado; no usar el valor de ejemplo.
- `CORS_ORIGIN` acepta una o varias URLs separadas por coma.
- `NEXT_PUBLIC_API_URL` debe apuntar a la URL publica del backend sin barra final.

## Instalacion local

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npx prisma migrate dev
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

El frontend debe tener `NEXT_PUBLIC_API_URL` apuntando a la URL donde este corriendo la API. El backend debe tener `CORS_ORIGIN` apuntando a la URL donde este corriendo el frontend.

## Scripts utiles

Backend:

```bash
npm run start:dev
npm run build
npm run start:prod
npm run prisma:generate
npm run prisma:migrate:deploy
npm run deploy:build
npm run test
```

Frontend:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploy del backend en Render

1. Crear una base de datos PostgreSQL en Render.
2. Crear un Web Service conectado al repositorio.
3. Configurar `Root Directory` como `backend`.
4. Configurar variables de entorno:
   - `DATABASE_URL`: URL interna o externa de PostgreSQL en Render.
   - `JWT_SECRET`: secreto largo y privado.
   - `JWT_EXPIRES_IN`: por ejemplo `1d`.
   - `CORS_ORIGIN`: URL final de Vercel.
5. Build Command:

```bash
npm ci && npm run deploy:build
```

6. Start Command:

```bash
npm run start:prod
```

7. Despues de desplegar el frontend, actualizar `CORS_ORIGIN` con la URL real de Vercel y redeployar el backend si Render no lo hace automaticamente.

## Deploy del backend en Railway

1. Crear un proyecto en Railway.
2. Agregar un servicio PostgreSQL.
3. Agregar el servicio backend desde el repositorio.
4. Configurar `Root Directory` como `backend`.
5. Configurar variables:
   - `DATABASE_URL`: variable del PostgreSQL de Railway.
   - `JWT_SECRET`: secreto largo y privado.
   - `JWT_EXPIRES_IN`: por ejemplo `1d`.
   - `CORS_ORIGIN`: URL final de Vercel.
6. Build Command:

```bash
npm ci && npm run deploy:build
```

7. Start Command:

```bash
npm run start:prod
```

## Deploy del frontend en Vercel

1. Importar el repositorio en Vercel.
2. Configurar `Root Directory` como `frontend`.
3. Framework Preset: Next.js.
4. Build Command: `npm run build`.
5. Output Directory: dejar el valor automatico de Next.js.
6. Agregar variable de entorno:
   - `NEXT_PUBLIC_API_URL`: URL publica del backend desplegado.
7. Deployar.
8. Copiar la URL final de Vercel y ponerla en `CORS_ORIGIN` del backend.

## Funcionalidades implementadas

- Registro de usuarios.
- Inicio de sesion con JWT.
- Roles `USER` y `ADMIN`.
- Catalogo publico de espacios activos.
- Detalle de espacio.
- Creacion, edicion y baja logica de espacios por administradores.
- Reservas con validacion de fechas.
- Prevencion de solapamiento de reservas activas (`PENDING` y `CONFIRMED`).
- Listado de reservas propias.
- Listado administrativo de reservas.
- Cambio de estado de reservas.
- Notificaciones automaticas al confirmar o cancelar reservas.
- Resenas por espacio con rating y comentario.
- Una resena por usuario y espacio.
- Favoritos por usuario.
- Campana y vista de notificaciones.
- Marcado de notificaciones como leidas.
- Consulta publica de franjas ocupadas por espacio y fecha.

## Endpoints principales

Autenticacion:

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/auth/login` | Publico | Inicia sesion y devuelve JWT. |
| GET | `/auth/me` | JWT | Devuelve el usuario del token. |

Usuarios:

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/users` | Publico | Crea usuario. |
| GET | `/users` | ADMIN | Lista usuarios. |
| GET | `/users/:id` | JWT | Obtiene usuario por id. |
| PATCH | `/users/:id` | JWT | Actualiza usuario. |
| DELETE | `/users/:id` | ADMIN | Desactiva usuario. |

Espacios:

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/spaces` | Publico | Lista espacios activos. |
| GET | `/spaces/:id` | Publico | Obtiene detalle de espacio. |
| GET | `/spaces/:id/reservations?date=YYYY-MM-DD` | Publico | Lista franjas ocupadas de ese dia. |
| POST | `/spaces` | ADMIN | Crea espacio. |
| PATCH | `/spaces/:id` | ADMIN | Actualiza espacio. |
| DELETE | `/spaces/:id` | ADMIN | Desactiva espacio. |

Reservas:

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/reservations` | JWT | Crea reserva. |
| GET | `/reservations/me` | JWT | Lista reservas propias. |
| GET | `/reservations` | ADMIN | Lista todas las reservas. |
| GET | `/reservations/:id` | JWT | Obtiene reserva. |
| PATCH | `/reservations/:id/status` | JWT | Cambia estado y genera notificacion. |
| DELETE | `/reservations/:id` | JWT | Elimina reserva si es propia o admin. |

Resenas:

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/spaces/:spaceId/reviews` | JWT | Crea resena. |
| GET | `/spaces/:spaceId/reviews` | Publico | Lista resenas de un espacio. |
| GET | `/reviews/:id` | Publico | Obtiene resena. |
| PATCH | `/reviews/:id` | JWT | Edita resena si es propia o admin. |
| DELETE | `/reviews/:id` | JWT | Elimina resena si es propia o admin. |

Favoritos:

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/favorites` | JWT | Agrega espacio a favoritos. |
| GET | `/favorites` | JWT | Lista favoritos propios. |
| DELETE | `/favorites/:spaceId` | JWT | Quita favorito. |

Notificaciones:

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| GET | `/notifications` | JWT | Lista notificaciones propias. |
| PATCH | `/notifications/:id/read` | JWT | Marca una notificacion como leida. |
| PATCH | `/notifications/read-all` | JWT | Marca todas como leidas. |

## Como se cargan los datos

La estructura de la base se carga con Prisma Migrate:

```bash
cd backend
npx prisma migrate dev
```

En produccion se usa:

```bash
cd backend
npm run prisma:migrate:deploy
```

Este proyecto no tiene un seed automatico versionado. Eso significa que las migraciones crean tablas y relaciones, pero no insertan usuarios ni espacios de ejemplo.

Los datos de negocio se cargan asi:

- Usuarios: desde el registro (`POST /users`) o el formulario de registro.
- Administradores: crear un usuario con role `ADMIN` o actualizarlo directamente en la base si ya existe.
- Espacios: con `POST /spaces`, usando un usuario admin autenticado.
- Reservas: desde el frontend o con `POST /reservations`.
- Resenas: desde el detalle del espacio o con `POST /spaces/:spaceId/reviews`.
- Favoritos: desde la UI o con `POST /favorites`.
- Notificaciones: se crean automaticamente al confirmar o cancelar reservas; tambien existe un servicio interno para crearlas desde backend.

Para cargar datos manualmente durante desarrollo se puede usar Prisma Studio:

```bash
cd backend
npx prisma studio
```

## Revision final

- No debe haber URLs locales hardcodeadas en codigo; la API y CORS dependen de variables de entorno.
- Antes de entregar, correr:

```bash
cd backend
npm run build
npm run test

cd ../frontend
npm run lint
npm run build
```

Si el build de frontend falla al descargar fuentes de Google, revisar conectividad de red del entorno de build o usar fuentes locales.