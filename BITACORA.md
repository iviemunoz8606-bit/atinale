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