# Backend - Coworking API

API REST construida con NestJS, Prisma 7 y PostgreSQL.

## Variables

Copiar `.env.example` a `.env` y completar:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="https://your-frontend.vercel.app"
PORT="3000"
```

## Desarrollo

```bash
npm install
npm run prisma:generate
npx prisma migrate dev
npm run start:dev
```

## Produccion

```bash
npm ci
npm run deploy:build
npm run start:prod
```

`deploy:build` genera el cliente Prisma, aplica migraciones pendientes y compila Nest.

## Documentacion

La documentacion completa de instalacion, endpoints, deploy y carga de datos esta en `../README.md`.