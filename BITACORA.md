# Atínale — Bitácora del Proyecto
> Plataforma de quinielas deportivas · Lanzamiento FIFA World Cup 2026
> Última actualización: Sesión 1 — Módulo 1 completado

---

## ¿Qué es este proyecto?

**Atínale** es una plataforma web donde grupos de personas hacen predicciones de partidos de fútbol, arman un pozo entre todos, y el que más acierta se lleva el premio. La plataforma retiene automáticamente el 10% como comisión — siempre visible para todos los participantes.

**Meta de lanzamiento:** 11 de junio de 2026 (inicio FIFA World Cup 2026)
**Escala futura:** Champions League → Liga MX → más competencias

---

## Las herramientas que usamos y por qué

### Node.js (v22.22.2)
**¿Qué es?** El motor que permite correr JavaScript fuera del navegador — en tu computadora o en un servidor.
**¿Por qué lo necesitamos?** Next.js (nuestro framework) necesita Node.js para funcionar. Sin Node, no hay proyecto.
**Analogía:** Es como necesitar Java instalado para correr programas de Java.

### Git (v2.53.0)
**¿Qué es?** Un sistema que guarda el historial de todos los cambios del proyecto.
**¿Por qué lo necesitamos?** Nos permite subir el código a GitHub y conectarlo con Vercel para publicar automáticamente.
**Analogía:** Es como el "historial de versiones" de Google Docs, pero para código.

### VS Code (v1.111.0)
**¿Qué es?** El editor de código — donde abrimos, editamos y organizamos todos los archivos del proyecto.
**¿Por qué lo usamos?** Es el estándar de la industria, gratuito, y tiene terminal integrada.
**Analogía:** Es como Word, pero para código en lugar de documentos.

### Next.js (v16.2.2)
**¿Qué es?** El framework principal del proyecto — maneja las páginas, la navegación, las APIs y el servidor.
**¿Por qué lo elegimos?** Permite hacer el frontend (lo que ve el usuario) y el backend (la lógica del servidor) en el mismo proyecto. Claude Code lo conoce perfectamente.
**Analogía:** Es como el "esqueleto" completo de la app — sin él habría que construir todo desde cero.

### Tailwind CSS (v3.4)
**¿Qué es?** Un sistema de estilos visuales que usamos para darle diseño a la app.
**¿Por qué lo usamos?** En lugar de escribir CSS desde cero, usamos clases predefinidas como `text-purple-600` o `bg-yellow-400`. Es rápido y consistente.
**Analogía:** Es como tener una caja de LEGO con piezas ya definidas en lugar de fabricar cada pieza.

### Supabase
**¿Qué es?** La base de datos del proyecto — guarda usuarios, quinielas, predicciones, pagos, rankings.
**¿Por qué lo elegimos?** Incluye base de datos PostgreSQL + autenticación + almacenamiento de archivos + tiempo real, todo en uno. Gratis hasta escala considerable.
**Analogía:** Es como contratar a un equipo completo de base de datos por $0 al mes.

### Vercel
**¿Qué es?** El hosting donde publicamos la app para que cualquiera la vea en internet.
**¿Por qué lo usamos?** Se conecta con GitHub — cada vez que subimos código, Vercel publica automáticamente en segundos. Gratis para proyectos como el nuestro.
**Analogía:** Es como tener un asistente que publica tu app en internet cada vez que guardas cambios.

### Mercado Pago (Checkout Pro)
**¿Qué es?** El sistema de pagos que procesa las inscripciones de los participantes.
**¿Por qué Checkout Pro?** Es la opción más fácil de integrar, acepta tarjetas/OXXO/transferencias, y los usuarios en México ya confían en él.
**Costo:** 3.49% + IVA por transacción (absorbible con $100-$200 por quiniela).

---

## Estructura de carpetas del proyecto

```
atinale/
├── src/
│   └── app/
│       ├── page.tsx        ← La página de inicio (lo que ve el usuario en /)
│       ├── layout.tsx      ← El "marco" que envuelve todas las páginas
│       └── globals.css     ← Los estilos globales (colores, fuentes base)
├── public/                 ← Imágenes, íconos y archivos estáticos
├── node_modules/           ← Librerías instaladas (NO tocar, NO subir a GitHub)
├── package.json            ← El "cerebro" del proyecto: dependencias y comandos
├── next.config.ts          ← Configuración de Next.js
├── tailwind.config.ts      ← Configuración de Tailwind CSS
├── tsconfig.json           ← Configuración de TypeScript
└── BITACORA.md             ← Este archivo 📖
```

### ¿Qué archivos editamos nosotros?
Solo los de `src/` y `public/`. Los demás son configuración que raramente se toca.

---

## Base de datos — Las 6 tablas

Diseñadas en Supabase (PostgreSQL). Cada tabla es como una hoja de Excel con estructura fija.

### `users` — Los participantes y administradores
| Campo | Tipo | Para qué sirve |
|---|---|---|
| id | uuid | Identificador único de cada persona |
| name | text | Nombre completo |
| email | text | Correo electrónico (login) |
| phone | text | Teléfono de contacto |
| role | text | `user` o `admin` |
| referral_code | text | Código único para referir amigos (+5 puntos) |
| referred_by | uuid | Quién lo refirió (FK a users) |

### `quinelas` — Cada quiniela creada
| Campo | Tipo | Para qué sirve |
|---|---|---|
| id | uuid | Identificador único |
| name | text | Nombre de la quiniela |
| competition | text | `fifa_2026`, `champions`, `liga_mx` |
| entry_fee | integer | Costo de entrada ($100 o $200) |
| deadline | timestamp | Fecha límite para inscribirse |
| status | text | `open`, `active`, `closed` |
| total_pot | integer | Suma de todas las inscripciones |
| commission_pct | decimal | Siempre 10% — visible para todos |
| winner_id | uuid | FK a users (se llena al cerrar) |

### `matches` — Los partidos de cada quiniela
| Campo | Tipo | Para qué sirve |
|---|---|---|
| id | uuid | Identificador único |
| quinela_id | uuid | A qué quiniela pertenece |
| home_team | text | Equipo local |
| away_team | text | Equipo visitante |
| match_date | timestamp | Fecha y hora del partido |
| home_score | integer | Goles local (null hasta que se juega) |
| away_score | integer | Goles visitante (null hasta que se juega) |

### `participants` — Quién está en qué quiniela
| Campo | Tipo | Para qué sirve |
|---|---|---|
| id | uuid | Identificador único |
| user_id | uuid | FK a users |
| quinela_id | uuid | FK a quinelas |
| payment_status | text | `pending`, `approved`, `rejected` |
| payment_proof_url | text | URL del comprobante en Supabase Storage |
| total_points | integer | Puntos acumulados en esta quiniela |
| rank | integer | Posición en la tabla |

### `predictions` — Las predicciones de cada participante
| Campo | Tipo | Para qué sirve |
|---|---|---|
| id | uuid | Identificador único |
| participant_id | uuid | FK a participants |
| match_id | uuid | FK a matches |
| pred_home_score | integer | Predicción goles local |
| pred_away_score | integer | Predicción goles visitante |
| points_earned | integer | 0, 1 o 3 (se calcula automáticamente) |

### `payments` — Registro de pagos via Mercado Pago
| Campo | Tipo | Para qué sirve |
|---|---|---|
| id | uuid | Identificador único |
| participant_id | uuid | FK a participants |
| amount | integer | Monto pagado |
| mp_payment_id | text | ID de Mercado Pago para verificar |
| status | text | `pending`, `approved`, `rejected` |
| proof_url | text | Comprobante si fue manual |

---

## Lógica de puntuación

```
Marcador exacto (ej: predijo 2-1, resultado 2-1)  → 3 puntos
Resultado correcto (ej: predijo 2-1, resultado 3-0) → 1 punto (acertó que ganaba local)
Fallo total                                          → 0 puntos
Bonus referido (por cada amigo que se inscribe)     → +5 puntos
```

### Lógica del pozo y comisión
```
Ejemplo con 30 participantes a $200 cada uno:
Pozo total    = 30 × $200 = $6,000
Comisión 10%  = $600  ← Va a Atínale (siempre visible)
Premio neto   = $5,400 ← Va al ganador
```

Si hay empate en puntos → el premio neto se divide en partes iguales.

---

## Identidad visual de Atínale

### Paleta de colores
| Color | Hex | Uso |
|---|---|---|
| Morado primario | `#534AB7` | Navegación, botones principales |
| Dorado acento | `#EFC84A` | Aciertos, celebraciones, el centro de la diana |
| Fondo noche | `#0D0D1A` | Fondo principal de la app |
| Lavanda | `#7F77DD` | Elementos secundarios |
| Fondo claro | `#F5F4FF` | Secciones claras, tarjetas |
| Verde acierto | `#1D9E75` | Indicador de predicción correcta |

### Temas por competencia
- **FIFA World Cup 2026** → Verde selva + dorado · Fondo `#0D2B0D`
- **Champions League** → Azul noche + plateado · Fondo `#0A1628`
- **Liga MX** → Tricolor + dorado · Fondo `#1A0A00`

### El símbolo — La Diana
La diana (target) con el punto dorado en el centro es la metáfora perfecta del producto: "le atinaste al marcador". El dorado es el hilo conector entre todas las competencias — aparece en cada momento de celebración y acierto.

---

## Comandos que usamos frecuentemente

```bash
# Arrancar el servidor de desarrollo (ver cambios en tiempo real)
npm run dev -- --webpack

# Instalar una nueva librería
npm install nombre-libreria

# Ver qué versión de Node tenemos
node --version

# Subir cambios a GitHub (cuando lleguemos a ese módulo)
git add .
git commit -m "descripción del cambio"
git push
```

---

## Historial de sesiones

### Sesión 1 — Módulo 1: Base del proyecto ✅
**Fecha:** 2 de abril de 2026
**Lo que se hizo:**
- Definimos nombre: **Atínale**
- Elegimos stack: Next.js + Supabase + Vercel + Mercado Pago
- Diseñamos identidad visual: La Diana, morado/dorado
- Diseñamos la base de datos completa (6 tablas)
- Instalamos Node.js, Git, VS Code en Windows 11
- Creamos el proyecto con `create-next-app`
- Resolvimos bloqueos de Smart App Control de Windows
- Aplicamos los primeros colores de Atínale en `globals.css`
- Servidor corriendo en `localhost:3000` ✅

**Próxima sesión — Módulo 2:**
- Reemplazar página genérica de Next.js con landing page de Atínale
- Configurar Supabase (crear las 6 tablas con SQL)
- Conectar el proyecto con Supabase
- Subir el proyecto a GitHub

---

## Notas importantes para recordar

> ⚠️ **Smart App Control** de Windows 11 bloquea archivos `.node` nativos.
> Solución: se desactivó para permitir el desarrollo. No afecta la seguridad personal.

> ⚠️ **Siempre usar** `npm run dev -- --webpack` en lugar de solo `npm run dev`
> porque Turbopack no es compatible con Windows en esta versión.

> ✅ **Terminal de VS Code** = usar siempre para comandos del proyecto (Ctrl + `)
> La terminal de sistema (CMD/PowerShell externo) puede tener comportamientos diferentes.

> ✅ **Guardar archivos** con Ctrl + S — Next.js recarga automáticamente al guardar.