# NATU · Guía de despliegue

Aplicación Next.js 14 (App Router) + TypeScript + Tailwind CSS con autenticación y
tiempo real sobre Supabase, desplegable en Vercel. Las diapositivas originales
(`public/Exposicion/Expo11-18-2025/Expo.html`) se conservan intactas.

---

## 1. Requisitos

- Node.js 18.17 o superior (recomendado 20 LTS).
- Una cuenta gratuita de [Supabase](https://supabase.com).
- Una cuenta de [Vercel](https://vercel.com) para publicar.
- Opcional: [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`).

---

## 2. Instalación local

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Abre <http://localhost:3000>.

Scripts disponibles:

| Comando             | Descripción                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Servidor de desarrollo               |
| `npm run build`     | Compilación de producción            |
| `npm start`         | Servidor de producción local         |
| `npm run typecheck` | Verificación de TypeScript (`tsc`)   |

---

## 3. Configurar Supabase

### 3.1 Crear el proyecto

1. Entra a <https://supabase.com/dashboard> y crea un proyecto.
2. Espera a que termine el aprovisionamiento.
3. Ve a **Project Settings → API** y copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Nunca uses la `service_role` key en el cliente ni en variables `NEXT_PUBLIC_*`.

### 3.2 Variables de entorno

Crea `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
# Opcional pero recomendado en producción:
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

`NEXT_PUBLIC_SITE_URL` se usa para:

- El enlace de recuperación de contraseña (`/recuperar`).
- La URL del sensor que devuelve `/api/info` para el QR de la Diapositiva 8.

Si no se define, la app usa el origen del navegador (`window.location.origin`) o,
en el servidor, el origen de la petición.

### 3.3 Autenticación

En **Authentication → Sign In / Providers → Email**:

- Habilita **Email**.
- **Desactiva “Confirm email”** (Authentication → Sign In / Providers → Email). El registro
  pide solo un nombre de usuario y la app crea un correo interno
  (`usuario@natu.app`), que no tiene buzón real. Si la confirmación está activa,
  la cuenta queda sin confirmar y el inicio de sesión falla.
- En **Authentication → URL Configuration** agrega:
  - **Site URL**: `https://tu-dominio.vercel.app`
  - **Redirect URLs**:
    - `http://localhost:3000/**`
    - `https://tu-dominio.vercel.app/**`
    - `https://tu-dominio.vercel.app/recuperar`

Sin estas URLs, los enlaces de confirmación y recuperación redirigen a `localhost`.

#### Alternativa si no puedes desactivar “Confirm email”

El proyecto incluye el endpoint `/api/auth/register`, que crea y confirma la
cuenta desde el servidor con la llave `service_role`. Para usarlo:

1. En Supabase: **Project Settings → API Keys** (o **API**) → copia la llave
   **`service_role`** / **secret**. Es secreta: no la compartas ni la pongas en
   una variable `NEXT_PUBLIC_*`.
2. En Vercel: **Project → Settings → Environment Variables** → agrega
   `SUPABASE_SERVICE_ROLE_KEY` con esa llave (Production, Preview y Development).
3. Vuelve a desplegar. El registro funcionará aunque “Confirm email” siga activo.

Si la variable no existe, la app vuelve automáticamente al registro normal de
Supabase (que requiere “Confirm email” desactivado).

### 3.4 Realtime (Broadcast)

La conexión sensor → mapa usa **Supabase Realtime Broadcast Channels**, sin tablas
ni SQL. No se requiere crear esquema.

1. Ve a **Project Settings → Realtime** y verifica que Realtime esté habilitado.
2. El canal es público y se llama `seismic-sensor`; el evento es `motion`.
3. El payload es `{ "v": 0.0–5.0, "t": <timestamp ms> }`.

Si tu proyecto tiene políticas estrictas de Realtime, habilita la extensión
**Realtime** y permite conexiones anónimas para Broadcast.

> La app funciona sin Supabase en **modo demo**: el mapa conserva el simulador
> local y el sensor usa el botón táctil, pero no hay enlace entre dispositivos.

---

## 4. Desplegar en Vercel

### Opción A · Desde el panel

1. Sube el proyecto a GitHub/GitLab/Bitbucket.
2. En Vercel, **Add New → Project** e importa el repositorio.
3. Framework preset: **Next.js** (se detecta automáticamente).
4. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (con el dominio final, sin `/` al final)
5. Pulsa **Deploy**.
6. Cuando termine, copia el dominio y actualízalo en Supabase
   (**Authentication → URL Configuration**) y en `NEXT_PUBLIC_SITE_URL`.
7. Vuelve a desplegar si cambiaste `NEXT_PUBLIC_SITE_URL`.

### Opción B · Con Vercel CLI

```bash
npm i -g vercel
vercel login
vercel            # despliegue de vista previa
vercel --prod     # producción
```

Configura las variables con `vercel env add` o desde el panel.

---

## 5. Rutas de la aplicación

| Ruta                                   | Descripción                                            |
| -------------------------------------- | ------------------------------------------------------ |
| `/`                                    | Landing con acceso a todas las secciones               |
| `/mapa`                                | Mapa Leaflet, simulador, sismógrafo, circuitos y QR    |
| `/sensor`                              | Acelerómetro móvil que publica por Supabase Realtime   |
| `/noticias`                            | Sismos USGS y titulares RSS                            |
| `/informacion`                         | Guía educativa de 13 secciones                         |
| `/login`, `/registro`, `/recuperar`    | Autenticación con Supabase Auth                        |
| `/terminos`                            | Términos y condiciones                                 |
| `/api/info`                            | Devuelve `urlMovil` para el QR de `Expo.html`          |
| `/Exposicion/Expo11-18-2025/Expo.html` | Diapositivas originales (sin modificar)                |

### Nota sobre la Diapositiva 8

`Expo.html` conserva su demo local y su WebSocket legacy. En Vercel no hay
servidores WebSocket persistentes, por lo que la diapositiva usa Supabase
Realtime (el mismo canal `seismic-sensor` que `/sensor` y `/mapa`). El QR de la
exposición se alimenta de `/api/info`, que apunta a `/sensor` en el dominio
actual y entrega la URL y la llave anónima de Supabase para que la
**Diapositiva 8** reciba el acelerómetro del celular en vivo. Si se abre
`Expo.html` en local y `/api/info` responde con `localhost`, el enlace usa
`https://natu-six.vercel.app/sensor` para que el celular siempre pueda entrar.

---

## 6. Pruebas manuales recomendadas

### Simulador y mapa

1. Abre `/mapa`.
2. Haz clic en el mapa: aparece el epicentro y el círculo de afectación.
3. Cambia magnitud y profundidad: el círculo y las etiquetas se actualizan.
4. Pulsa **Simular sismo**: se dibujan ondas y el sismógrafo muestra la señal.
5. Ajusta el umbral y simula: la alarma se fija en `ACTIVADA`.
6. Pulsa **Reiniciar**: la alarma vuelve a `DESACTIVADA`.

### Sensor móvil

1. Abre `/mapa` en el computador y pulsa **Conectar celular**.
2. Escanea el QR con el teléfono (misma red o dominio de Vercel).
3. En `/sensor`, pulsa **Habilitar acelerómetro** (obligatorio en iOS).
4. Sacude el teléfono: el voltaje cambia y el sismograma del mapa se pone verde
   con la etiqueta **SENSOR EN VIVO**.
5. Si supera el umbral, la alarma se activa en el mapa.
6. Si no hay acelerómetro, mantén presionado el botón táctil de simulación.

### Autenticación

1. Regístrate en `/registro` con un nombre de usuario y contraseña (sin correo).
2. Inicia sesión en `/login` con ese mismo nombre de usuario; la barra superior
   muestra `@usuario`.
3. Cierra sesión y prueba `/recuperar` solo con cuentas antiguas basadas en correo.
   Las cuentas con nombre de usuario no tienen correo para recibir el enlace.

### Producción

```bash
npm run typecheck
npm run build
npm start
```

Comprueba también:

- `https://tu-dominio.vercel.app/api/info` devuelve `urlMovil`.
- `https://tu-dominio.vercel.app/Exposicion/Expo11-18-2025/Expo.html` carga con
  sus imágenes y estilos.
- El QR abre `https://tu-dominio.vercel.app/sensor`.

---

## 7. Solución de problemas

| Síntoma                                        | Posible causa / solución                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| “Modo demo” en la barra superior               | Faltan `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` o siguen con valores de ejemplo. |
| El sensor no conecta                           | Revisa la consola, que Realtime esté habilitado y que el dominio esté permitido en Supabase. |
| El QR apunta a `localhost`                     | Define `NEXT_PUBLIC_SITE_URL` con el dominio de producción y vuelve a desplegar.         |
| El correo de recuperación va a `localhost`     | Agrega el dominio en **Authentication → URL Configuration → Redirect URLs**.             |
| No puedo iniciar sesión tras registrarme       | Desactiva **Confirm email** en **Authentication → Sign In / Providers → Email**. El registro usa un correo interno sin buzón (`usuario@natu.app`). |
| El mapa no aparece                             | Leaflet se carga con `ssr: false`; revisa errores de hidratación o bloqueo de tiles.     |
| No hay señal en el mapa                        | El teléfono y el computador deben usar el mismo proyecto Supabase y el mismo dominio.    |
| El acelerómetro no responde en iPhone          | Debe pulsarse el botón de permiso tras una interacción del usuario y aceptar el diálogo. |
| Error de tipos en el build                     | Ejecuta `npm run typecheck` y corrige antes de desplegar.                                |

---

## 8. Estructura relevante

```
src/
  app/
    api/info/route.ts        # QR de la exposición
    mapa/page.tsx            # simulador + Realtime + prototipo
    sensor/page.tsx          # publicación del acelerómetro
    noticias/page.tsx        # USGS + RSS
    informacion/page.tsx     # contenido educativo
    login|registro|recuperar # Supabase Auth
  components/
    Map/                     # Leaflet cargado dinámicamente
    Prototype/               # sismógrafo, lazo y transistor
    Sensor/Accelerometer.tsx # useMotion + permisos + fallback táctil
  lib/
    supabaseClient.ts        # cliente tolerante a falta de variables
    seismic.ts               # fórmulas del simulador
public/
  Exposicion/                # diapositivas originales intactas
  images/Sismos.jpg
legacy_html/                 # respaldo del proyecto HTML/CSS/JS original
```

---

## 9. Seguridad y límites

- Solo se usa la **anon key** pública; no hay `service_role` en el cliente.
- El canal Broadcast es público por diseño (demostración académica). Para un
  entorno real, usa canales privados con RLS y autenticación.
- La información sísmica es educativa y no sustituye los reportes oficiales del
  Servicio Geológico Colombiano (SGC) ni de la UNGRD.
