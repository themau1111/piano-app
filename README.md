# MusicAula

Frontend de aprendizaje de piano y teoría musical construido con Next.js, React y TypeScript. La API de catálogo, ejercicios y progreso se configura mediante `NEXT_PUBLIC_API_URL`; la autenticación usa Supabase.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Para una comprobación de tipos:

```bash
npx tsc --noEmit
```

## Redirecciones de autenticación

Define `NEXT_PUBLIC_APP_URL` por entorno. En producción debe ser la URL pública exacta, por ejemplo `https://musicaula.example.com`; para desarrollo local, `http://localhost:3000`. El frontend usa esa URL para los callbacks de Google y enlaces de correo.

En Supabase, en **Authentication → URL Configuration**, configura la misma URL pública como **Site URL** y agrega `${NEXT_PUBLIC_APP_URL}/login` a **Redirect URLs**. Puedes conservar `http://localhost:3000/login` como URL adicional para desarrollo local.

## Uso sin cuenta

Las rutas y ejercicios pueden utilizarse como invitado. Cada intento de ejercicio se guarda en `localStorage` en el navegador y se muestra en el resumen de práctica de inicio. Al iniciar sesión, los nuevos ejercicios usan el perfil autenticado y la API para persistir su progreso.

La API actual no expone un contrato de migración del historial local al perfil. No se elimina ni se transmite ese historial local automáticamente.
