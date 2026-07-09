# Frontend - Coworking Web

Aplicacion web construida con Next.js 16, React 19 y Tailwind CSS 4.

## Variables

Copiar `.env.example` a `.env.local` y completar:

```env
NEXT_PUBLIC_API_URL="https://your-backend.onrender.com"
```

## Desarrollo

```bash
npm install
npm run dev
```

## Produccion

```bash
npm run lint
npm run build
npm run start
```

## Deploy en Vercel

- Root Directory: `frontend`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Environment Variable: `NEXT_PUBLIC_API_URL` con la URL publica del backend.

Despues de publicar en Vercel, agregar la URL del frontend en `CORS_ORIGIN` del backend.

## Documentacion

La documentacion completa de instalacion, endpoints, deploy y carga de datos esta en `../README.md`.