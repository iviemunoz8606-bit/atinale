# 📋 BITÁCORA — ATÍNALE
### Plataforma de Quinielas Deportivas · FIFA 2026

---

## 🎯 DATOS DEL PROYECTO

| Campo | Detalle |
|-------|---------|
| **Nombre** | Atínale |
| **Descripción** | Plataforma web de quinielas deportivas multideporte |
| **URL producción** | https://atinale-ecru.vercel.app |
| **GitHub** | https://github.com/iviemunoz8606-bit/atinale |
| **Stack** | Next.js 16.2 + Supabase + Vercel + Mercado Pago (pendiente) |
| **Sistema operativo** | Windows 11 |
| **Editor** | VS Code con terminal CMD |
| **Comando arranque** | `npm run dev` |
| **Dueño del producto** | Ivie Muñoz |

---

## 🏗️ ARQUITECTURA

### Stack tecnológico
- **Frontend:** Next.js 16.2 con Turbopack, TypeScript, React
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Google OAuth via Supabase Auth
- **Hosting:** Vercel (deploy automático con cada git push)
- **Pagos:** Mercado Pago (pendiente de integrar)
- **Fuentes:** Bebas Neue, Outfit (Google Fonts)
- **Animaciones:** Framer Motion

### Estructura de archivos
```
src/
  app/
    auth/callback/    → route.ts (maneja OAuth de Google)
    dashboard/        → page.tsx (dashboard del participante)
    registro/         → page.tsx (formulario de perfil)
    page.tsx          → Landing page
  lib/
    supabase.ts       → Cliente de Supabase
.env.local            → Variables de entorno
```

---

## 🗄️ BASE DE DATOS (Supabase)

### Tablas y columnas completas

#### `users`
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK, vinculado a auth |
| name | text | Nombre del usuario |
| email | text | Email |
| phone | text | Teléfono (opcional) |
| avatar_url | text | Foto de Google |
| referral_code | text | Código único auto-generado |
| referred_by | uuid | FK → users |
| total_points | integer | Puntos acumulados históricos |
| total_quinelas | integer | Quinielas en las que ha participado |
| is_admin | boolean | Si es administrador |
| created_at | timestamptz | Fecha de registro |

#### `pools` (quinielas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| name | text | Nombre de la quiniela |
| description | text | Descripción |
| type | text | 'public', 'private', 'referral' |
| competition | text | 'FIFA_2026', 'UEFA_CL', 'LIGA_MX' |
| entry_fee | integer | Costo de entrada en pesos |
| max_participants | integer | Límite de participantes |
| current_participants | integer | Participantes actuales |
| total_pot | integer | Pozo total acumulado |
| net_prize | integer | Premio neto (pozo - comisión) |
| platform_commission | integer | Comisión de la plataforma |
| creator_id | uuid | FK → users |
| creator_commission_pct | integer | % de comisión del creador (salas privadas) |
| access_code | text | Código para salas privadas |
| status | text | 'upcoming', 'open', 'closed', 'finished' |
| registration_closes_at | timestamptz | Fecha límite de registro |
| starts_at | timestamptz | Inicio de la quiniela |
| ends_at | timestamptz | Fin de la quiniela |
| winner_id | uuid | FK → users (ganador) |
| created_at | timestamptz | Fecha de creación |

#### `matches` (partidos)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| competition | text | Competencia (default: FIFA_2026) |
| round | text | Fase del torneo |
| group_name | text | Grupo (A-L) |
| home_team | text | Equipo local |
| away_team | text | Equipo visitante |
| home_flag | text | Emoji bandera local |
| away_flag | text | Emoji bandera visitante |
| venue | text | Estadio |
| city | text | Ciudad sede |
| scheduled_at | timestamptz | Fecha y hora del partido |
| status | text | 'scheduled', 'live', 'finished' |
| home_score | integer | Goles local (null hasta que termine) |
| away_score | integer | Goles visitante |
| match_number | integer | Número de partido (1-104) |
| created_at | timestamptz | Fecha de creación |

#### `predictions` (predicciones)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| pool_id | uuid | FK → pools |
| match_id | uuid | FK → matches |
| user_id | uuid | FK → users |
| predicted_home | integer | Goles predichos local |
| predicted_away | integer | Goles predichos visitante |
| points_earned | integer | Puntos ganados (0, 1 o 3) |
| created_at | timestamptz | Fecha de predicción |

#### `pool_members` (participantes por quiniela)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| pool_id | uuid | FK → pools |
| user_id | uuid | FK → users |
| payment_status | text | 'pending', 'approved', 'rejected' |
| payment_proof_url | text | URL del comprobante de pago |
| points | integer | Puntos en esta quiniela |
| rank | integer | Posición en esta quiniela |
| joined_at | timestamptz | Fecha de ingreso |

#### `payments` (pagos/comprobantes)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| pool_id | uuid | FK → pools |
| user_id | uuid | FK → users |
| amount | integer | Monto pagado |
| proof_url | text | URL del comprobante |
| status | text | 'pending', 'approved', 'rejected' |
| reviewed_by | uuid | Admin que revisó |
| reviewed_at | timestamptz | Fecha de revisión |
| notes | text | Notas del admin |
| created_at | timestamptz | Fecha del pago |

#### `referrals` (referidos)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | PK |
| referrer_id | uuid | FK → users (quien refirió) |
| referred_id | uuid | FK → users (quien llegó) |
| pool_id | uuid | FK → pools |
| bonus_points | integer | Puntos de bonus (default: 5) |
| commission_pct | integer | % de comisión (default: 3) |
| commission_amount | integer | Monto de comisión en pesos |
| paid | boolean | Si ya se pagó la comisión |
| created_at | timestamptz | Fecha del referido |

---

## 💰 MODELO DE NEGOCIO

### Comisiones
- **Plataforma:** 10% del pozo total (siempre visible)
- **Creador de sala privada:** 3% (sale del 10% de la plataforma)
- **Referidor:** 3% efectivo en cash (Versión 2)
- **Usuarios normales:** +5 puntos por amigo referido y pagado

### Tipos de quiniela
1. **Pública** — admin crea, casa retiene 10%
2. **Referidos** — casa 7%, referidor 3% efectivo
3. **Sala Privada** — creator elige monto y límite, casa 7%, creator 3%

### Ejemplo transparente visible para todos
```
Pozo total: $6,000
Premio neto: $5,400
Comisión plataforma: $600 (10%)
```

---

## 🎯 LÓGICA DE PUNTUACIÓN

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto (ej. 2-1 predicho y real) | +3 pts |
| Resultado correcto (gana/empata/pierde) | +1 pt |
| Fallo completo | 0 pts |
| Bonus por referido registrado y pagado | +5 pts |

**Empate final:** El pozo neto se divide en partes iguales entre los empatados.

**Ranking histórico:** Acumulado entre todas las quinielas en las que ha participado.

---

## 📅 CALENDARIO FIFA 2026

| Dato | Detalle |
|------|---------|
| Formato | 48 equipos, 12 grupos de 4 |
| Total partidos | 104 |
| Inicio | 11 junio 2026 — México vs Sudáfrica |
| Final | 19 julio 2026 — MetLife Stadium, NY |
| Sedes México | CDMX, Guadalajara, Monterrey |
| Grupo México | Grupo A: México, Sudáfrica, Corea del Sur, Chequia |

---

## 📅 CALENDARIO DEL PROYECTO

| Fase | Fechas | Estado |
|------|--------|--------|
| Desarrollo | 3 abril – 30 abril 2026 | 🟡 En curso |
| Testing interno | 1 – 15 mayo 2026 | ⏳ Pendiente |
| Soft Launch (modo próximamente) | 27 mayo 2026 | ⏳ Pendiente |
| Beta real (20-30 personas) | 1 junio 2026 | ⏳ Pendiente |
| Cierre de registro | 10 junio 11:59pm | ⏳ Pendiente |
| KICKOFF | 11 junio 5pm — México vs Sudáfrica | 🎯 Meta |

---

## ✅ SESIONES DE DESARROLLO

### Sesión 1 — Landing Page
- Landing page completa y responsive
- Diana animada con Framer Motion
- Contador animado $5,400
- Card México vs Sudáfrica con banderas reales
- 3 pasos animados
- Logo ATÍNALE con animación de pulso

### Sesión 2 — Base de Datos
- 7 tablas creadas en Supabase con RLS
- 104 partidos FIFA 2026 cargados con fechas reales
- Google OAuth configurado y funcionando
- Página /registro con formulario de perfil
- Deploy en Vercel con CI/CD automático
- Primer usuario real registrado

### Sesión 3 — (Pendiente documentar)

### Sesión 4 — Dashboard + Auth Flow (5 abril 2026)
**Logros:**
- BD auditada completamente con SQL query
- Identificado que pools ya tenía columnas avanzadas
- Primera quiniela real insertada: "Quiniela Grupos FIFA 2026"
- Instalado y configurado `@supabase/ssr`
- Dashboard `/dashboard` construido completo:
  - Saludo personalizado con nombre del usuario
  - 3 tarjetas de stats (puntos, posición, quinielas)
  - Tab "Disponibles" con card de quiniela real
  - Tab "Mis Quinielas"
  - Predicciones recientes con banderas emoji
  - Tabla de posiciones EN VIVO
  - Navegación inferior (5 secciones)
- Auth callback corregido para Next.js 16 con `await cookies()`
- Flujo completo funcionando: Landing → Login Google → Dashboard
- Login de Google conectado a los 3 botones de la landing

**Pendiente de esta sesión:**
- Ajustar tamaño en desktop (todo se ve grande)
- Unificar colores del logo (morado #534AB7 de landing vs verde del dashboard)
- Subir a Vercel para ver en celular y compartir con beta testers

---

## 🔧 VARIABLES DE ENTORNO (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ Nunca subir el .env.local a GitHub. Está en .gitignore.

---

## 🚀 COMANDOS FRECUENTES

```bash
# Arrancar en local
npm run dev

# Subir cambios a Vercel
git add .
git commit -m "descripción del cambio"
git push

# Instalar dependencia nueva
npm install nombre-del-paquete

# Ver versión de Node
node --version
```

---

## 📱 IDENTIDAD VISUAL

### Colores
| Color | Hex | Uso |
|-------|-----|-----|
| Dorado | #EFC84A / #F5B731 | Puntos, CTAs principales, logo |
| Verde | #00C46A | Aciertos, estado activo |
| Morado | #534AB7 | Botones secundarios, landing |
| Fondo oscuro | #0A0D12 / #0A0F2E | Background principal |
| Superficie | #111520 / #111827 | Cards y contenedores |
| Texto muted | #6B7280 | Texto secundario |

### Identidad por competencia
- **Mundial FIFA 2026:** Verde + Dorado 🌍
- **Champions League:** Azul + Plateado ⭐
- **Liga MX:** Colores mexicanos 🦅

### Tipografía
- **Títulos:** Bebas Neue (impacto, deportivo)
- **Cuerpo:** Outfit (moderno, legible)

---

## 📋 BACKLOG — PRÓXIMAS SESIONES

### Sesión 5 (próxima)
- [ ] git push → deploy a Vercel
- [ ] Unificar colores landing ↔ dashboard
- [ ] Ajustar tamaño desktop
- [ ] Página `/quiniela/[id]` — hacer predicciones (máx 3 clics)
- [ ] Flujo completo: ver partido → poner marcador → guardar

### Sesión 6
- [ ] Panel de administrador básico
- [ ] Validar comprobantes de pago
- [ ] Capturar resultados manualmente
- [ ] Cálculo automático de puntos

### Sesión 7
- [ ] Sistema de referidos con link único
- [ ] Subida de comprobante de pago (Supabase Storage)
- [ ] Notificaciones cuando el pozo sube

### Sesión 8
- [ ] Optimización mobile completa
- [ ] Pruebas con usuarios beta reales
- [ ] Deploy final para soft launch 27 mayo

---

## 🐛 ERRORES CONOCIDOS Y SOLUCIONES

| Error | Causa | Solución |
|-------|-------|---------|
| `createClientComponentClient doesn't exist` | Versión nueva de Supabase | Usar `createBrowserClient` de `@supabase/ssr` |
| `Can't resolve '@supabase/ssr'` | Paquete no instalado | `npm install @supabase/ssr` |
| `HTTP ERROR 500 en /auth/callback` | Next.js 16 requiere await en cookies | `const cookieStore = await cookies()` |
| Dashboard redirige al inicio | Sin sesión activa | Hacer login primero con Google |

---

*Última actualización: 5 de abril 2026 — Sesión 4*
*Desarrollado con Claude (Anthropic) — Dueño del producto: Ivie Muñoz*
