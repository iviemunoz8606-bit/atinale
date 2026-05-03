# ATÍNALE — BITACORA DEL PROYECTO

Registro acumulado de sesiones — Actualizado el 7 de abril de 2026

---

## DATOS DEL PROYECTO

| Proyecto | Atínale — Quinielas Deportivas |
|----------|-------------------------------|
| URL Producción | https://atinale-ecru.vercel.app |
| GitHub | github.com/iviemunoz8606-bit/atinale |
| Supabase ID | pqrcwbevquhpsymmpryi |
| Stack | Next.js 14 + Supabase + Vercel + Mercado Pago |
| Lanzamiento | 11 de junio de 2026 — México vs Sudáfrica |

---

## HISTORIAL DE SESIONES

### Sesiones 1-2 — Infraestructura base
- ✅ Schema completo Supabase: 7 tablas con RLS y funciones
- ✅ 104 partidos FIFA 2026 cargados con banderas y venues
- ✅ Google OAuth: landing → /auth/callback → /dashboard
- ✅ Landing page inicial con animaciones y diana

### Sesión 3-4 — Dashboard y registro
- ✅ Dashboard con stats, quinielas disponibles, leaderboard
- ✅ Página /registro con nombre, teléfono, código referido
- ✅ Primera quiniela real insertada en Supabase
- ✅ Bottom navigation

### Sesión 5 — Predicciones
- ✅ /quiniela/[id] — 48 partidos Fase de Grupos
- ✅ Partidos agrupados por Grupo A-L con tabs
- ✅ Banderas reales con flagcdn.com
- ✅ Bloqueo automático al iniciar partido
- ✅ Botón flotante guardar en lote
- ✅ Tabs verdes cuando grupo completo
- ✅ Constraint UNIQUE en tabla predictions

### Sesión 6 — Pagos manuales y admin
- ✅ Bucket "comprobantes" en Supabase Storage (privado)
- ✅ JoinPoolModal.tsx — modal de unión con subida de comprobante
- ✅ Panel admin /admin — comprobantes + resultados + stats
- ✅ Fix total_pot en dashboard
- ✅ is_admin activado para ivie.munoz8606@alumnos.udg.mx
- ✅ Funciones SQL: increment_participants y add_points_to_member

### Sesión 7 — Mercado Pago
- ✅ mercadopago SDK instalado
- ✅ 4 variables de entorno en Vercel y .env.local
- ✅ API /api/mp/crear-preferencia
- ✅ API /api/mp/webhook — activa membresías automáticamente
- ✅ Páginas /pago/exitoso, /pago/fallido, /pago/pendiente
- ✅ Modal reemplazado: redirige a Checkout Pro
- ✅ Webhook registrado en panel MP (prueba y producción)
- ✅ Pago de prueba completado exitosamente

### Sesión 8 — 7 de abril de 2026 — Guard + Diseño
- ✅ Guard /quiniela/[id] — bloquea acceso sin payment_status = approved
- ✅ PaywallScreen — pantalla de bloqueo con botón de pago integrado
- ✅ Fix 404 al regresar de Mercado Pago con botón atrás
- ✅ Navbar rediseñado — diana animada pequeña + ATÍNALE dorado + botón Entrar
- ✅ Landing page rediseñada — ATÍNALE con diana en la E, paleta unificada
- ✅ Componente DianaHero — 4 anillos girando en direcciones alternas
- ✅ Componente NavDiana — diana compacta para navbar
- ✅ Paleta unificada — fondo #080C16 en toda la app, sin azul inconsistente
- ✅ Reducción de amarillo — dorado solo en número del pozo y botón CTA
- ✅ LOADER APROBADO (pendiente de implementar):
     Secuencia: estrella desde centro → crosshair crece → anillos
     de adentro hacia afuera → todos giran continuamente →
     ATÍNALE + "Cargando..." al final

---

## ESTADO ACTUAL DEL SISTEMA

| Módulo | Estado |
|--------|--------|
| Landing page | En refinamiento final |
| Autenticación Google | ✅ Producción |
| Registro de usuarios | ✅ Producción |
| Dashboard | ✅ Producción |
| Predicciones /quiniela/[id] | ✅ Con guard de pago |
| Guard de pago | ✅ Producción |
| Mercado Pago Checkout Pro | ✅ Producción (modo pruebas) |
| Panel admin | ✅ Producción |
| Cálculo de puntos | ✅ Vía admin |
| Loader con diana | ⏳ Aprobado, pendiente código |
| Sistema de referidos | ⏳ Pendiente |
| Modo Próximamente | ⏳ Necesario antes del 27 mayo |
| Salas privadas | ⏳ Modelo de negocio por definir |

---

## PRÓXIMAS TAREAS EN ORDEN DE PRIORIDAD

| # | Tarea | Prioridad | Fecha límite |
|---|-------|-----------|--------------|
| 1 | Fixes landing — diana derecha, quitar texto repetido, mover CÓBRATE, salas privadas | Alta | ASAP |
| 2 | Definir modelo de negocio salas privadas | Alta | ASAP |
| 3 | Implementar loader con diana en todas las páginas | Alta | Antes de beta |
| 4 | Sistema de referidos — código único +5pts | Media | Mayo |
| 5 | Modo Próximamente con captura de emails | Alta | 27 mayo |
| 6 | Cambiar MP a credenciales de producción | Alta | Antes del lanzamiento |
| 7 | Unificación visual completa dashboard | Media | Mayo |

---

## FIXES PENDIENTES EN LANDING

1. Diana saliendo a la IZQUIERDA — debe ir a la DERECHA de la E
2. "Quinielas Deportivas" repetido en hero — quitar, ya está en navbar
3. "CÓBRATE / ¿CUÁNTO SABES?" — mover ARRIBA del contador del pozo
4. "Predice. Compite. Gana." → cambiar a "Predice y Gana"
5. Contenido salas privadas — agregar cuando esté definido el modelo

---

## SALAS PRIVADAS — PENDIENTE DE DEFINIR

Preguntas por responder antes de implementar:
- ¿Quién puede crear una sala? ¿Cualquier usuario o solo admin?
- ¿El costo de entrada es configurable por el creador?
- ¿Qué porcentaje/beneficio recibe el creador?
- ¿Aparece como sección separada en landing o dentro de tipos de quiniela?

---

## NOTAS TÉCNICAS CLAVE

- Arranque local: `npm run dev -- --webpack` (nunca Turbopack)
- Siempre `// @ts-nocheck` en archivos nuevos de Next.js
- Usar `createBrowserClient` de `@supabase/ssr` (nunca createClientComponentClient)
- El webhook de MP usa SUPABASE_SERVICE_ROLE_KEY para saltear RLS
- En localhost el checkout NO usa back_urls (MP no acepta localhost)
- El parámetro de la función SQL es p_pool_id (con prefijo p_)
- Git config: email ivie.munoz8606@alumnos.udg.mx | user iviemunoz8606-bit
- round = 'Fase de Grupos' (en español, no 'group')
- group_name = 'A' hasta 'L'

---

## COLORES Y DISEÑO

| Elemento | Valor |
|----------|-------|
| Fondo | #080C16 |
| Cards | #111520 |
| Dorado principal | #F5B731 |
| Dorado oscuro | #C9930A |
| Verde éxito | #00C46A |
| Fuente títulos | Bebas Neue |
| Fuente cuerpo | Outfit |
| Banderas | flagcdn.com |

**Regla de uso del dorado:** Solo en número del pozo y botón CTA principal.
El resto usa blanco en diferentes opacidades.

---

## CALENDARIO

| Fecha | Hito |
|-------|------|
| Hoy — 30 Abril | Desarrollo activo |
| 1 — 15 Mayo | Testing interno |
| 27 Mayo | Soft Launch — Modo Próximamente |
| 1 Junio | Beta con 20-30 usuarios |
| 10 Junio 11:59pm | Cierre de registro |
| **11 Junio 5:00pm** | **KICKOFF — México vs Sudáfrica** |

---

## COMANDOS DEL DÍA A DÍA
```bash
npm run dev -- --webpack     # Arrancar local
git add .                    # Marcar cambios
git commit -m "descripción"  # Guardar con mensaje
git push                     # Subir a GitHub → Vercel publica
```

## Sesión 9 — 7 de abril 2026 — Landing page completa + Mobile

### Lo que se construyó:

**Landing page rediseñada completa:**
- NavLogo: ATÍNALE + diana animada con 3 anillos + Quinielas Deportivas / Predice y Gana
- Hero desktop: CÓBRATE! con efecto neón blanco, diana anclada a la E, orden reorganizado
- Hero mobile: sección completamente separada con CSS media queries (no JavaScript)
- Contador del pozo: $5,400 animado con CountUp, proyección $18,000 si se llena
- Partido inaugural México vs Sudáfrica con banderas y sistema de puntos
- Tarjetas Salas y Referidos en columna derecha con links a secciones
- Sección 3 Pasos: título centrado, tarjetas horizontales en desktop
- Sección Salas Privadas: comisión escalonada 3/4/5%, diseño original
- Sección Referidos: tarjetas de premios, mini dashboard con colores vibrantes
- CTA Final: aviso urgencia rojo + 11 DE JUNIO dorado
- Botón "Entrar" con animación btnPulse dorada continua
- Botón "Crear mi sala" con misma animación que Entrar
- Dashboard ranking: colores F5B731 / 00C46A / 4FADFF

**Mobile optimizado:**
- CSS media queries puras para evitar bug de SSR con window
- Hero mobile con orden: ATÍNALE → CÓBRATE → $5,400 → Partido → Features → CTA
- Acordeones colapsables: ¿Cómo funciona? / Salas / Referidos
- Secciones desktop-only: 3 Pasos, Salas completa, Referidos completo ocultos en mobile

**Decisiones de producto:**
- Salas privadas: comisión 3/4/5% escalonada por participantes
- Ranking de Promotores: top 3 gana quiniela gratis Champions/Liga MX
- Pozo: opción B — mostrar real + proyección
- Modo claro: agendado para v2 post-Mundial
- Deploy exitoso en producción

### Pendientes para sesión 10:
- [ ] Mostrar "3 Pasos" directo en mobile (sin acordeón)
- [ ] CountUp con animación en mobile
- [ ] Botones mobile que funcionen correctamente
- [ ] Botón "Entrar" más angosto en mobile
- [ ] Bug doble registro en /auth/callback
- [ ] Cambiar Mercado Pago a credenciales de producción
### Contexto técnico
STACK:         Next.js 14 (--webpack) + Supabase + Vercel + Mercado Pago
OS:            Windows 11 + VS Code + CMD
ARRANQUE:      npm run dev -- --webpack
DEPLOY:        git add . → git commit → git push (Vercel auto-deploy)
REGLA CSS:     // @ts-nocheck siempre en archivos nuevos
SUPABASE:      createBrowserClient de @supabase/ssr (nunca createClientComponentClient)
MOBILE:        CSS media queries puras — NO usar window.innerWidth para mostrar/ocultar
COLORES:       BG #080C16 | CARD #111520 | Dorado #F5B731/#C9930A | Verde #00C46A
FUENTES:       Bebas Neue (títulos) + Outfit (cuerpo)
### Sesión 10 — 8 de abril 2026 — Mobile fixes + Quinielas + Dashboard

**Mobile hero:**
- ✅ Botones "QUIERO GANAR EL POZO" reducidos a 2 en mobile
- ✅ Aviso rojo duplicado eliminado
- ✅ "CÓBRATE" cambiado a "GANATE" en mobile
- ✅ 3 Pasos visibles directo en mobile (sin acordeón) con título centrado
- ✅ Horas corregidas a UTC — 1:00 PM hora centro (UTC-6)
- ✅ Cierre de registro — 12:50 PM del 11 de junio

**Bugs resueltos:**
- ✅ Bug doble login — route.ts ahora verifica name+phone antes de redirigir
- ✅ Nav inferior sin 404 — Ranking y Perfil apuntan a /dashboard temporalmente

**Base de datos:**
- ✅ 3 quinielas públicas creadas en Supabase ($100/$300/$500)
- ✅ Quiniela beta test cerrada (status=closed) — pagos preservados
- ✅ Fechas en UTC corregidas en todas las quinielas

**Dashboard:**
- ✅ Colores unificados con landing (#080C16)

**Pendientes sesión 11:**
- [ ] Modo Próximamente + captura emails (URGENTE antes 27 mayo)
- [ ] Cambiar MP a credenciales producción
- [ ] Sistema de referidos (tabla referrals ya existe)
- [ ] Botón cerrar sesión
- [ ] Dashboard desktop redistribuir layout
- [ ] Páginas Ranking y Perfil
- [ ] Formulario crear quinielas desde /admin
- [ ] Tabs quinielas en tabla posiciones (se ven apretados en desktop)

## Sesión 11 — 9 de abril de 2026 — Primera venta real 🎉

### Lo que se hizo
- ✅ Bug doble login eliminado — archivo renombrado de middleware.ts a proxy.ts
- ✅ Función exportada renombrada de `middleware` a `proxy` (requerimiento Next.js 16)
- ✅ Fix `supabase is not defined` en landing page (faltaba inicializar el cliente en Home())
- ✅ Fix `framer-motion` SSR en /registro — eliminado completamente, reemplazado con divs/buttons nativos
- ✅ Fix `useEffect` roto en /registro — faltaba la palabra `useEffect` y había una línea suelta dentro de guardarPerfil()
- ✅ Dashboard rediseñado — logo con NavDiana animada igual que landing
- ✅ Cards de quinielas con identidad visual por competencia (borde izquierdo de color)
- ✅ Todos los botones de acción siempre en amarillo dorado — consistencia de marca
- ✅ Menú cerrar sesión en avatar del topbar — tap → menú desplegable con Mi perfil y Cerrar sesión
- ✅ Página /ranking creada — podio top 3, lista completa, EN VIVO, resalta "Tú"
- ✅ Página /perfil creada — avatar, stats, historial de quinielas, datos de contacto, cerrar sesión
- ✅ Nav inferior 100% funcional — sin ningún 404 en ningún botón
- ✅ Mercado Pago credenciales de producción activadas y configuradas en Vercel
- ✅ PRIMER PAGO REAL PROCESADO — Ivie y su esposa, $100 c/u = $200 pozo real
- ✅ Deploy limpio en producción

### Errores encontrados y soluciones
| Error | Causa | Solución |
|-------|-------|----------|
| `middleware deprecated` | Next.js 16 renombró la convención | Renombrar archivo y función a `proxy` |
| `supabase is not defined` | Cliente no inicializado en Home() | Agregar `createBrowserClient` dentro del componente |
| `useState is not a function` en Vercel | framer-motion no compatible con SSR | Eliminar framer-motion completamente del registro |
| `useEffect` roto | Faltaba la palabra useEffect y había línea suelta | Corregir sintaxis completa |

### Hito histórico
Primera transacción real de Atínale: 9 de abril de 2026
Participantes: Ivie Eduardo + esposa
Monto: $200 MXN (2 × $100)
Pozo neto: $180 MXN
Comisión plataforma: $20 MXN (10%)
MP producción: funcionando ✅

## Contexto Técnico Rápido — Referencia de sesión a sesión

### Arranque local

# SESIÓN 13 — 17 de abril de 2026

## LO QUE CONSTRUIMOS

### /unirse/[codigo] — página completa
- Lee el access_code de la URL
- Valida: código inválido, sala llena, registro cerrado, ya es miembro
- Muestra tarjeta de sala con pozo, lugares, fecha cierre
- Botón de pago conectado a MP
- Fix: sala sin fecha de cierre no bloquea acceso (null check)
- Fix: parámetros correctos a /api/mp/crear-preferencia (entryFee, userEmail, userName)
- Fix: leer data.url en lugar de data.init_point en la respuesta

### Registro con redirect
- registro/page.tsx acepta ?redirect= param
- Al completar perfil manda al redirect en lugar de siempre /dashboard
- auth/callback/route.ts pasa el ?redirect= hacia adelante en todos los casos
- Flujo: /unirse/SALA-Q137 → sin cuenta → /registro?redirect=/unirse/SALA-Q137 → Google → callback → registro completa datos → /unirse/SALA-Q137

### Dashboard fixes
- Salas privadas ocultas del dashboard (.eq('type','public'))
- Botón "+ Crear sala" en navbar visible para todos
- Fix fecha UTC: timeZone 'America/Mexico_City' en toLocaleDateString
- Quiniela J17 fecha corregida en Supabase a 2026-04-25 01:55:00+00

### loading.tsx global
- Diana animada con 4 anillos rotando en direcciones alternas
- Aplica automáticamente a todas las páginas de Next.js
- "Cargando..." en letras pequeñas debajo

## DECISIONES DE PRODUCTO

### Nombre
- Existe otro "Atínale" (plataforma de productos/regalos, no deportes)
- Decisión: mantener identidad visual, comprar atinale.com en Namecheap
- No cambiar diseño ni diana

### Sistema alias + emoji
- Usuarios eligen alias público (no nombre real) + emoji de galería 40 opciones
- Filtro lista negra + moderación manual admin
- Ranking muestra alias + emoji, no fotos de Google
- Primer lugar: corona 👑 + borde dorado + banner "VA GANANDO $X,XXX"

### Estrategia 3 estados landing
- Estado 1: Demo Liguilla en vivo (captación antes del Mundial)
- Estado 2: Landing actual (registro abierto)
- Estado 3: Mundial en vivo (mismo componente que Estado 1, dinámico)
- Estados 1 y 3 son el mismo componente — se construye una vez

### Correo bienvenida
- Tono amistoso: "más que dinero, es diversión"
- Servicio: Resend (gratis 3,000/mes)
- Requiere dominio propio

## APRENDIZAJES TÉCNICOS
- UTC en Supabase: México CDT = UTC−5 en verano. Guardar 01:55 UTC para 8:55pm México
- El warning DEP0169 de url.parse() en logs de Vercel no es un error real — es interno del SDK de MP
- Las salas privadas necesitan filtro explícito .eq('type','public') en el query del dashboard
- El parámetro redirect viaja por URL (no localStorage) desde el login de Google

## PENDIENTE INMEDIATO
1. Alias + emoji en registro (columna alias en tabla users primero)
2. Ranking público con alias+emoji+corona líder
3. Partidos Liguilla (insertar 27 abril)
4. Estado 1 landing — Demo Liguilla
5. Toggle admin para cambiar estados
6. Correo bienvenida con Resend
7. Sistema de referidos
8. Formulario crear quinielas /admin

# Sesión 14 — 17 de abril 2026 — UX fixes + Rediseño registro y perfil

## Lo que se construyó y arregló

**Fix salas privadas en dashboard:**
- ✅ Query separado: públicas + privadas donde creator_id = user.id
- ✅ Fix JSX: .filter(pool => pool.type === 'public' || pool.creator_id === user?.id) en "Disponibles"
- ✅ Salas privadas de otros usuarios ya no aparecen en el dashboard de nadie
- ✅ Salas "Prueba" y "Los ajustadores prueba" eliminadas de Supabase

**Fix loaders — diana animada en todas las páginas:**
- ✅ Identificados 3 archivos con loader viejo: dashboard, admin, quiniela/[id], unirse/[codigo]
- ✅ Todos reemplazados: if(loading) return <Loading /> + import Loading from '@/app/loading'
- ✅ Diana animada consistente en toda la app

**Rediseño completo /registro:**
- ✅ Identidad visual Atínale: fondo #080C16, tarjeta #111520, dorado #F5B731, Bebas Neue
- ✅ Diana animada arriba del logo
- ✅ Galería de 40 emojis curados en step perfil
- ✅ Campo alias (apodo público, máx 20 chars) con contador
- ✅ Preview en tiempo real "Así te verán en el ranking"
- ✅ ALTER TABLE users ADD COLUMN IF NOT EXISTS emoji text DEFAULT '⚽'
- ✅ guardarPerfil() guarda emoji: emoji en Supabase

**Fix dashboard — emoji + nombre completo:**
- ✅ Avatar navbar: círculo con inicial → emoji del usuario
- ✅ Saludo "HOLA, EL" → "HOLA, EL REY IVIE" (quitado .split(' ')[0])

**Rediseño completo /perfil:**
- ✅ Emoji grande como avatar + botón ✏ abre panel de edición inline
- ✅ Panel edición: alias + teléfono + picker 40 emojis + botón guardar
- ✅ Fix guardar: upsert → update().eq('id') para evitar conflicto con auth.users
- ✅ Stats 2x2: puntos totales, mejor posición, quinielas jugadas, exactos
- ✅ Logros automáticos: primer pago, primer exacto, top 3, líder, fan activo, referido
- ✅ Quinielas conectadas a Supabase — fix query pool_members sin created_at
- ✅ Feed últimos 5 eventos (unirse, pago aprobado, puntos ganados)
- ✅ Badge quiniela: usa pool.status (open/closed) no payment_status
- ✅ Sección "Link invitación" en quinielas privadas del creador con botón Copiar

**Fix URL compartir sala:**
- ✅ crear-sala/page.tsx generaba link sin /unirse/ — corregido a ${origin}/unirse/${codigo}
- ✅ El link de WhatsApp ahora lleva directo a la página de unirse

## Notas técnicas importantes
- pool_members NO tiene columna created_at — nunca usar .order('created_at') en ese query
- Para editar perfil usar .update().eq('id') no .upsert() — evita conflicto con auth.users
- Emoji guardado en public.users columna emoji (text, default ⚽)
- El creador de una sala privada NO aparece en pool_members — solo aparece si pagó entrada
- Salas privadas visibles para creador: filter(pool.type==='public' || pool.creator_id===user.id)
- Badge quiniela: usar pool.status no payment_status

## Pendientes identificados en sesión 14
- [ ] Sección "Salas que administro" en /perfil (creator_id = user.id, sin pagar entrada)
- [ ] Quinielas cerradas separar en historial vs activas en /perfil
- [ ] Alias + emoji en /ranking público
- [ ] Rediseño /ranking — podio, filtros, mis vecinos (mockup aprobado sesión 13)
- [ ] Reestructurar dashboard — menos cascada, más limpio
- [ ] Cron job anti-pausa Supabase (antes 1 mayo — URGENTE)
- [ ] Upgrade Supabase Pro ~$25/mes (antes 1 mayo — URGENTE)
- [ ] Insertar partidos Liguilla cuando se conozcan clasificados J17 (27 abr)
- [ ] Estado 1 landing — Demo Liguilla en vivo
- [ ] Sistema de referidos con código único +5pts
- [ ] Modo Próximamente con captura de emails (antes 27 mayo)

## Contexto técnico rápido
STACK:      Next.js 16 (--webpack) + Supabase + Vercel + MP PRODUCCIÓN
OS:         Windows 11 + VS Code + CMD
ARRANQUE:   npm run dev -- --webpack
REGLAS:     // @ts-nocheck + 'use client' primeras 2 líneas · NUNCA framer-motion
SUPABASE:   createBrowserClient de @supabase/ssr siempre
MOBILE:     CSS media queries puras — NO window.innerWidth
COLORES:    BG #080C16 | CARD #111520 | Dorado #F5B731/#C9930A | Verde #00C46A
FUENTES:    Bebas Neue (títulos) + Outfit (cuerpo)
UTC:        México CDT verano = UTC-5. Guardar 01:55 UTC = 8:55pm México


## SESIÓN (Ver que sesion es) —20 de abril del 2026 

### ✅ Completado

#### 1. Cron job anti-pausa Supabase
- Endpoint `/api/ping` creado y desplegado en producción
- cron-job.org configurado — se ejecuta todos los días a las 3:00 AM
- Test exitoso: 200 OK confirmado

#### 2. Salas que administro en /perfil
- Nueva sección debajo de "Mis quinielas"
- Muestra: nombre de sala, competición, entrada, participantes, pozo, comisión estimada, barra de progreso
- Lista de participantes con emoji, nombre y badge de pago (✅ Pagó / ⏳ Pendiente)
- Botones "Copiar código" y "Copiar link" con feedback visual (cambia a ✅ ¡Copiado! por 2 segundos)

### 🔧 Problemas resueltos
- RLS bloqueaba al creador leer `pool_members` ajenos → nueva política `creator_can_read_pool_members`
- RLS bloqueaba leer `users` de esos members → nueva política `creator_can_read_member_users`
- Nested select de Supabase con foreign key no funcionaba → separado en dos queries independientes

### ⏳ Pendiente
- Alias + emoji en /ranking público
- Rediseño /ranking — podio, filtros, mis vecinos
- Reestructurar dashboard
- Insertar partidos Liguilla (27 abr)
- Estado 1 landing (27 abr)

## Sesión 15 — 24-25 de abril 2026 — PRIMER LANZAMIENTO REAL

### Hitos
- 10 participantes pagados · $1,000 en el pozo · $900 premio neto
- Primer partido jugado: Puebla 1-2 Querétaro
- Armalobo lidera con 3pts (marcador exacto)
- Sistema funcionando en producción con usuarios reales

### Lo que se construyó
- /liguilla: OAuth directo, diana animada, mensaje motivador premio neto
- DianaHero extraído a componente /components/DianaHero.tsx
- Admin rediseñado: resumen global, desglose por quiniela, tab jugadores/resultados/análisis
- API route /api/admin/members con service role key para ver todos los participantes
- Webhook corregido: suma entry_fee a total_pot en cada pago aprobado
- /predecir: removido useSearchParams (causaba crash), sin Suspense wrapper
- /quiniela/[id]: filtra por competition del pool, no por round hardcodeado

### Bugs corregidos
- useSearchParams en /predecir crasheaba la página
- Admin solo mostraba datos propios (RLS) → service role key via API route
- total_pot no subía con pagos → webhook ahora suma amount al pozo
- Escudos Liga MX rotos (sofifa/ESPN bloqueaban) → removidos, solo nombres
- Filtro partidos /quiniela usaba round='Fase de Grupos' → ahora usa competition

### Bugs pendientes (ver contexto siguiente sesión)
CONTEXTO ATÍNALE — Sesión 16 — 25 abril 2026
Stack: Next.js 16 + Supabase + Vercel + Mercado Pago
Repo: iviemunoz8606-bit/atinale · URL: atinale-ecru.vercel.app
Windows 11, VS Code, CMD · Dev: npm run dev -- --webpack
Reglas: // @ts-nocheck + 'use client' · createBrowserClient · nunca framer-motion

ESTADO ACTUAL
- 10 participantes · $1,000 pozo · Jornada 17 Liga MX activa
- Pool ID Jornada 17: c7b6e451-d671-41d8-b615-723a98098fb8
- Armalobo: 3pts (único con puntos, acertó Puebla 1-2 Querétaro exacto)
- Puebla 1-2 Querétaro ya guardado con status='finished' en BD

PARTIDOS HOY (25 abril, hora México Centro)
1. Pachuca vs Pumas UNAM — 5:00pm
2. Tigres UANL vs Mazatlán FC — 5:00pm  
3. Toluca vs León — 7:05pm
4. Guadalajara vs Tijuana — 7:07pm
5. FC Juárez vs Atlético de San Luis — 9:00pm

BUGS CRÍTICOS A RESOLVER HOY (en orden)
1. Puntos no se calculan automáticamente al guardar resultado en admin
   → handleSaveResult actualiza pool_members.points pero NO users.total_points
   → Hay que agregar UPDATE users SET total_points al final del handleSaveResult

2. Predicciones no se revelan cuando inicia partido
   → Transparencia clave: cuando status='live' o 'finished', mostrar predicciones de TODOS
   → Fix en /quiniela/[id]: query adicional de todas las predicciones del partido

3. Horarios muestran 1 hora menos
   → Partidos de hoy en BD están en UTC correcto pero se muestran mal
   → Verificar scheduled_at de Pachuca vs Pumas: debe ser 2026-04-25 23:00:00+00
   → Si está mal: UPDATE matches SET scheduled_at = scheduled_at + interval '1 hour' WHERE competition='LIGA_MX' AND status != 'finished'

4. Registro no se cierra automáticamente cuando inicia primer partido
   → Alguien pagó después de que Puebla ya había iniciado
   → Fix: en webhook verificar si algún match del pool ya tiene scheduled_at <= now()

BUGS IMPORTANTES (después de los críticos)
5. Ranking en tiempo real provisional (con marcador live)
6. total_pot desincronizado — monitorear si sigue sumando con nuevos pagos
7. Admin muestra todas las quinielas de prueba — limpiar Supabase

NOTAS TÉCNICAS
- points_earned en predictions + points en pool_members + total_points en users = tres lugares que se deben actualizar juntos
- scheduled_at en Supabase está en UTC, México Centro verano = UTC-6
- handleSaveResult está en /app/admin/page.tsx
- API admin members: /app/api/admin/members/route.ts con SUPABASE_SERVICE_ROLE_KEY
- Nunca .order('created_at') en pool_members (no tiene esa columna)

## Sesión 16 — 25 abril 2026

### Completado

- Fix Bug 1: función SQL `add_points_to_member` ahora actualiza `users.total_points` además de `pool_members.points`
- Fix Bug 3: horarios de 3 partidos Liga MX corregidos en BD (UTC-6 México Centro verano)
- Admin: flujo completo `upcoming → live → finished` con recálculo de puntos sin acumular, editar horario desde tarjeta, leyenda "Hora Centro México"
- RLS `matches`: nueva política UPDATE solo para admins
- `/predecir`: emoji 🎯✅❌ + puntos ganados en partidos `live` y `finished`
- `/quiniela/[id]`: marcador real corregido (home/away estaban invertidos) + emoji y puntos
- `/ranking`: vista por quiniela con podio, tabla de posiciones, partidos expandibles con predicciones de todos en tiempo real
- RLS `pool_members`: reemplazadas 3 políticas conflictivas por una sola `using(true)` para usuarios autenticados
- Webhook `/api/mp/webhook`: no activa membresía si algún partido del pool ya inició (`live` o `finished`)
- Dashboard: botones 🎯 (predecir) y 🏆 (ranking) en cards de quiniela aprobada

### Estado actual

- 10 participantes · $1,000 pozo · Jornada 17 activa
- Pool ID Jornada 17: c7b6e451-d671-41d8-b615-723a98098fb8
- Armalobo líder con 3pts (acertó Puebla 1-2 Querétaro exacto)
- Partidos hoy: Pachuca vs Pumas 5pm, Tigres vs Mazatlán 5pm, Toluca vs León 7:05pm, Guadalajara vs Tijuana 7:07pm, FC Juárez vs San Luis 9pm

### Pendientes

- Banderas en `/ranking` y `/predecir` para mejor visual
- Limpiar quinielas de prueba en Supabase
- Insertar partidos Liguilla (~27 abril, después de J17)
- Supabase Pro upgrade — urgente antes del 1 de mayo
- WhatsApp canal de difusión para comunidad
- Revisar UX del botón 🏆 desde dashboard (parámetro `pool=id` funciona)


# ATÍNALE — BITÁCORA DEL PROYECTO
Actualizado: 1 de mayo de 2026

## DATOS DEL PROYECTO
| Campo | Valor |
|-------|-------|
| URL Producción | https://atinale-ecru.vercel.app |
| GitHub | iviemunoz8606-bit/atinale |
| Supabase ID | pqrcwbevquhpsymmpryi |
| Stack | Next.js 16 + Supabase + Vercel + Mercado Pago |
| Lanzamiento soft | 27 mayo 2026 |
| Kickoff Mundial | 11 junio 2026 — México vs Sudáfrica |

---

## ESTADO ACTUAL DEL SISTEMA
| Módulo | Estado |
|--------|--------|
| Landing page | ✅ Funcionando |
| Google OAuth | ✅ Funcionando |
| Registro de usuarios | ✅ Funcionando |
| Dashboard | ✅ Funcionando |
| Página /quinielas | ✅ Con código de sala y botón crear sala |
| Página /predecir | ✅ Con round_filter corregido |
| Página /ranking | ✅ Con round_filter en loadPoolData |
| Página /quiniela/[id] | ✅ Con paywall y round_filter |
| Flujo de pago MP | ✅ Producción activa |
| Webhook MP | ✅ Modo productivo activado |
| Panel admin /admin | ✅ Funcionando |
| Crear sala privada | ✅ Con selector de ronda |
| Unirse con código | ✅ /unirse/[codigo] |
| Botón WhatsApp | ✅ WAButton.tsx flotante |
| Cálculo de puntos | ⏳ Manual desde admin — falta automatizar |
| Modo Próximamente | ❌ Pendiente antes del 27 mayo |
| Historial quinielas | ❌ Pendiente |

---

## HISTORIAL DE SESIONES

### Sesiones 1-4 — Infraestructura base
- Landing page con animaciones, diana, CountUp
- Schema Supabase: 7 tablas con RLS
- 104 partidos FIFA 2026 cargados
- Google OAuth completo
- Dashboard con stats y bottom nav
- /quiniela/[id] con 48 partidos grupos A-L
- Inputs predicción con bloqueo automático
- Primera quiniela: Quiniela Grupos FIFA 2026

### Sesión 5 — Página de predicciones
- /quiniela/[id] completa con banderas y grupos
- Guardado en lote con botón flotante dorado
- Tabs de grupo se vuelven verdes al completar
- Constraint UNIQUE en predictions
- Deploy exitoso

### Sesión 6 — Pagos y admin
- Bucket "comprobantes" en Supabase Storage
- JoinPoolModal con subida de comprobante
- Panel admin /admin con validación de pagos
- is_admin activado para ivie.munoz8606@alumnos.udg.mx
- Fix total_pot en dashboard

### Sesión 7 — Mercado Pago
- SDK mercadopago instalado
- API /api/mp/crear-preferencia
- API /api/mp/webhook
- Páginas /pago/exitoso, /pago/fallido, /pago/pendiente
- Pago de prueba completado
- Deploy exitoso

### Sesiones 8-10 — Liga MX y mejoras
- Jornada 17 y Liguilla Cuartos cargados en DB
- round_filter implementado en pools
- /liguilla-cuartos página dedicada
- Salas Privadas: /crear-sala y /unirse/[codigo]
- /ranking con podio, vecinos y vista por quiniela
- /perfil con alias, emoji y teléfono
- Sistema de referidos con código único

### Sesión 11 — 1 mayo 2026
**Fixes:**
- Webhook MP: verificar member antes de insertar (insert vs upsert)
- Webhook MP: modo productivo activado en panel MP
- round_filter en ranking/loadPoolData
- round_filter en predecir/loadData  
- framer-motion removido completamente (page.tsx + package.json)
- camelCase corregido en fetch crear-preferencia
- Validación: código SALA- no puede usarse como código de referido

**Features:**
- WAButton.tsx — botón WhatsApp flotante minimalista sin fondo
- Metadata og-image para preview en WhatsApp
- Selector de ronda (Jornada 17 / Liguilla) al crear sala privada
- Banner código de sala en /quinielas
- Botón crear sala en /quinielas
- Grid 2 columnas para acciones rápidas en /quinielas

---

## NOTAS TÉCNICAS CLAVE

### Patrones importantes
- `round_filter` en pools filtra partidos por ronda dentro de una competition
- Leer `poolData` directamente (no `pool` state que puede ser null)
- `pool_members` NO tiene columna `created_at` — nunca usar `.order('created_at')`
- Usar `update().eq('id')` no `upsert()` para saves de perfil
- `activeGroup` default `''` con detección dinámica del primer grupo

### Reglas de código
- Primeras dos líneas: `// @ts-nocheck` luego `'use client'`
- Nunca framer-motion — usar CSS keyframes
- Siempre `createBrowserClient` de `@supabase/ssr`
- `proxy.ts` reemplaza `middleware.ts`
- Dev: `npm run dev -- --webpack`
- Build: `next build --webpack`

### Webhook MP
- URL producción: https://atinale-ecru.vercel.app/api/mp/webhook
- Evento activo: Pagos
- Modo: Productivo ✅
- Fix aplicado: verifica existencia de member antes de insertar

### Variables de entorno requeridas
- `MERCADOPAGO_ACCESS_TOKEN`
- `NEXT_PUBLIC_MP_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Tablas DB clave
- `pools` — incluye `round_filter`, `type`, `creator_id`, `access_code`
- `pool_members` — sin `created_at`
- `matches` — `competition`, `round`, `group_name`, `status`, `home_score`, `away_score`
- `predictions` — `predicted_home`, `predicted_away`, `points_earned`
- `payments` — diagnóstico con LEFT JOIN a pool_members

---

## PENDIENTES

### Urgente (antes del 11 junio)
1. **Cálculo automático de puntos** — trigger cuando se actualizan goles
   - Exacto: 3pts | Resultado: 1pt | Fallo: 0pts
   - Actualizar `points_earned` en predictions
   - Actualizar `points` en pool_members
   - Actualizar `total_points` en users
2. **Modo Próximamente** — captura de emails antes del 27 mayo
3. **Admin acceso sin pagar** — bypass paywall para is_admin

### Media prioridad
4. Página métodos de pago (OXXO, SPEI, tarjeta sin cuenta MP)
5. Quinielas terminadas → historial en /perfil
6. Semis+Final Liguilla pool (abrir 12 mayo)
7. Salas que administro en /perfil

### Post-lanzamiento
8. Automatización resultados con n8n
9. Imagen compartible con link directo al pool
10. Automatización comisión creador via MP
11. Registro IMPI marca ATÍNALE (~$2,500 MXN, clase 41)

---

## CALENDARIO
| Fecha | Hito |
|-------|------|
| 12 mayo | Abrir Semis+Final Liguilla |
| 27 mayo | Soft launch — Modo Próximamente + emails |
| 1 junio | Beta con 20-30 usuarios |
| 10 junio 11:59pm | Cierre de registro Mundial |
| 11 junio 5pm | México vs Sudáfrica — kickoff |
| 28 junio | Fin Fase de Grupos — primer ganador |
| 19 julio | Gran Final Mundial |

---

## COMANDOS DIARIOS
```bash
# Arrancar
npm run dev -- --webpack

# Subir cambios
git add .
git commit -m "descripcion"
git push

# Al llegar a nueva compu
git pull
npm install
```


# ATÍNALE — BITÁCORA DEL PROYECTO
Registro acumulado de sesiones — Actualizado el 3 de mayo de 2026

## DATOS DEL PROYECTO

| Proyecto | Atínale — Quinielas Deportivas |
|---|---|
| URL Producción | https://atinale-ecru.vercel.app |
| GitHub | github.com/iviemunoz8606-bit/atinale |
| Supabase ID | pqrcwbevquhpsymmpryi |
| Stack | Next.js 16 + Supabase + Vercel + Mercado Pago |
| Lanzamiento | 11 de junio de 2026 — México vs Sudáfrica |

---

## HISTORIAL DE SESIONES

### Sesiones 1-4 — Infraestructura base
- ✅ Landing page con animaciones, diana, CountUp, tarjeta México vs Sudáfrica
- ✅ Schema completo de Supabase: 7 tablas con RLS y funciones
- ✅ 104 partidos FIFA 2026 cargados con banderas y venues
- ✅ Google OAuth: landing → /registro → /dashboard
- ✅ Dashboard con stats, quinielas, leaderboard y bottom nav
- ✅ Página /quiniela/[id] con 48 partidos agrupados por grupo
- ✅ Inputs de predicción con bloqueo automático al iniciar partido
- ✅ Botón flotante "Guardar predicciones" en lote

### Sesión 5 — Documentada en archivo separado

### Sesión 6 — Flujo de pagos y admin
- ✅ Bucket "comprobantes" en Supabase Storage
- ✅ Funciones SQL: increment_participants y add_points_to_member
- ✅ Panel admin /admin: comprobantes + resultados + stats
- ✅ Deploy exitoso en producción

### Sesión 7 — Mercado Pago
- ✅ Checkout Pro funcionando en producción
- ✅ Webhook activando membresías automáticamente
- ✅ Páginas /pago/exitoso, /pago/fallido, /pago/pendiente

### Sesión — 1 de mayo de 2026
- ✅ Trigger automático de puntos instalado en Supabase
- ✅ Recálculo forzado de puntos históricos Liga MX
- ✅ Admin bypass paywall en /quiniela/[id] y /predecir
- ✅ Pestaña Rankings en /admin con podio y predicciones por partido
- ✅ Activación manual de pagos pendientes vía SQL

### Sesión — 3 de mayo de 2026
- ✅ Diagnóstico: calcular_puntos_partido es trigger, no función callable
- ✅ SQL manual de recálculo creado (3 pasos: predictions → pool_members → users)
- ✅ Fix recalcularPuntos() en admin: ahora actualiza users.total_points al finalizar Y al actualizar en vivo
- ✅ Fix inputs de marcador en admin: ya no dan NaN cuando campo está vacío
- ✅ Realtime agregado a /ranking/page.tsx — se actualiza solo sin F5
- ✅ Fix "Cierra en Cerrada" — ahora muestra solo "⏰ Cerrada"
- ✅ Tres estados de quiniela en /quinielas: Abierta / ⚽ En juego / ✅ Finalizada
- ✅ Botón VER RANKING en quinielas cerradas/en juego
- ✅ Jornada 17 marcada como status=finished en Supabase
- ✅ current_participants corregido en Liguilla Cuartos (4 aprobados)

---

## ESTADO ACTUAL DEL SISTEMA

| Módulo | Estado |
|---|---|
| Landing page | ✅ Producción |
| Google OAuth | ✅ Producción |
| Dashboard | ✅ Producción |
| Mercado Pago producción | ✅ Activo |
| Cálculo automático de puntos | ✅ Trigger instalado |
| Recálculo manual vía SQL | ✅ Disponible |
| Panel admin completo | ✅ Con pestaña Rankings |
| Admin bypass paywall | ✅ Funcionando |
| Ranking en tiempo real | ✅ Supabase Realtime activo |
| Estados de quiniela | ✅ Abierta / En juego / Finalizada |
| Modo Próximamente | ⏳ Pendiente — antes del 27 mayo |
| Historial quinielas finalizadas | ⏳ Pendiente |
| API deportes automática | ⏳ Pendiente |
| Semis+Final Liguilla pool | ⏳ Abrir ~12 mayo |

---

## QUINIELAS ACTIVAS

| Nombre | Status | Participantes | Pozo |
|---|---|---|---|
| Liguilla Cuartos de Final 2026 | open · En juego | 4 | $400 |
| Puñetas del ajuste | open | 13 | $2,600 |
| Quiniela FIFA 2026 · $100 | open | 3 | $300 |
| Quiniela FIFA 2026 · $300 | open | 0 | $0 |
| Quiniela FIFA 2026 · $500 | open | 0 | $0 |
| Quiniela Jornada 17 · Liga MX | finished | 10 | $1,000 |

---

## PRÓXIMAS TAREAS

| # | Tarea | Prioridad | Fecha |
|---|---|---|---|
| 1 | Historial público de quinielas finalizadas | Alta | Próxima sesión |
| 2 | Comprobante de pago al ganador desde admin | Alta | Próxima sesión |
| 3 | Página /historial con ganador + comprobante | Alta | Próxima sesión |
| 4 | API de deportes para resultados automáticos | Media | Mayo |
| 5 | Semis+Final Liguilla pool | Alta | ~12 mayo |
| 6 | Modo Próximamente + captura emails | Alta | Antes 27 mayo |

---

## NOTAS TÉCNICAS CLAVE

- Arranque local: `npm run dev -- --webpack` (nunca Turbopack)
- Siempre usar `// @ts-nocheck` en archivos nuevos
- Usar `createBrowserClient` de `@supabase/ssr`
- El trigger `calcular_puntos_partido` es un TRIGGER — no se puede llamar directamente
- Cuando actives un pago manualmente con SQL, correr también `SELECT increment_participants('pool_id')`
- `current_participants` puede desincronizarse si se activan pagos con SQL directo
- México Centro = UTC-6 permanente (sin horario de verano)
- `pool_members` no tiene columna `created_at` — nunca usar `.order('created_at')` en esa tabla

## SQL DE RECÁLCULO MANUAL (usar después de cada partido)

```sql
UPDATE predictions
SET points_earned = CASE
  WHEN predicted_home = m.home_score 
    AND predicted_away = m.away_score THEN 3
  WHEN (predicted_home > predicted_away AND m.home_score > m.away_score) OR
       (predicted_home < predicted_away AND m.home_score < m.away_score) OR
       (predicted_home = predicted_away AND m.home_score = m.away_score) THEN 1
  ELSE 0
END
FROM matches m
WHERE predictions.match_id = m.id
AND m.status = 'finished'
AND m.competition = 'LIGA_MX';

UPDATE pool_members pm
SET points = (
  SELECT COALESCE(SUM(p.points_earned), 0)
  FROM predictions p
  WHERE p.user_id = pm.user_id
    AND p.pool_id = pm.pool_id
);

UPDATE users u
SET total_points = (
  SELECT COALESCE(SUM(pm.points), 0)
  FROM pool_members pm
  WHERE pm.user_id = u.id
);
```