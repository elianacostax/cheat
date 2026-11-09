# Chat en tiempo real (PWA)

App de chat móvil en tiempo real: autenticación segura, mensajes en vivo, fotos/audio/GIFs, instalable en el celular. Despliegue gratuito en Vercel + Supabase.

## Stack
- **Next.js 16** (App Router, Turbopack) + Tailwind CSS
- **Supabase**: Auth, Base de datos (Postgres + RLS), Realtime (websockets), Storage (fotos/audio/GIFs)
- **PWA**: manifest + service worker (instalable en Android/iOS)
- Despliegue: **Vercel** (gratis)

## Estructura
```
app/
  (auth)/login, (auth)/register   -> registro e inicio de sesión
  dashboard/                      -> layout protegido (sidebar + salir)
  chat/                           -> lista de conversaciones
  chat/[id]/                      -> chat en tiempo real
  api/join/                       -> unir usuario a conversación
lib/supabase/                     -> clientes Supabase (servidor/navegador)
hooks/                            -> useProfile, useChat (Realtime)
components/Chat/                  -> MessageList, MessageBubble, MessageInput
components/MediaUploader.tsx      -> subida de foto/audio/GIF a Supabase Storage
public/                           -> manifest.json, sw.js, favicon.svg (PWA)
supabase/schema.sql               -> esquema BD y políticas RLS
```

## 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto gratuito.
2. En **SQL Editor**, pega y ejecuta el contenido de `supabase/schema.sql` (crea tablas, RLS y políticas).
3. En **Storage > Buckets**, crea un bucket público llamado `chat-media` (para fotos, audio y GIFs).
4. En **Database > Realtime**, activa la replicación para las tablas: `messages`, `conversations`, `conversation_participants`, `profiles`.
5. En **Settings > API**, copia la **Project URL** y la **anon public** key.

## 2. Variables de entorno
Copia `.env.example` a `.env` (local) y rellena con tus valores de Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Despliegue en Vercel (gratis)
1. Sube este código a un repositorio de GitHub.
2. Ve a [vercel.com](https://vercel.com), importa el repositorio.
3. En **Settings > Environment Variables** agrega las dos variables de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Despliega. La app estará en `https://tu-app.vercel.app`.

## 4. Instalar en el celular (PWA)
- **Android (Chrome):** abre la URL, menú ⋮ > "Agregar a la pantalla de inicio".
- **iOS (Safari):** abre la URL, botón de compartir > "A en la pantalla de inicio".

La app usa service worker para funcionar sin conexión (caché básica) y se ve como una app nativa (sin barra del navegador).

## Seguridad
- Autenticación con Supabase Auth (email + contraseña, mín. 6 caracteres).
- Row Level Security (RLS): los usuarios solo leen/escriben sus propios datos y conversaciones a las que pertenecen.
- Los medios se suben a un bucket público y se almacenan con nombres aleatorios (`uuid`).

## Limitaciones conocidas (scope inicial)
- Las conversaciones 1 a 1 se crean al hacer "Nuevo chat" (no hay lista de contactos ni búsqueda de usuarios por nombre).
- Los grupos no están implementados (solo 1 a 1).
- El service worker cachea solo la shell básica; los mensajes en vivo requieren conexión.
