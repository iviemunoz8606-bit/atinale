# Atínale — Bitácora del Proyecto
> Plataforma de quinielas deportivas · Lanzamiento FIFA World Cup 2026  
> Última actualización: Sesión 1 completa — 2 de abril de 2026

---

## ¿Qué es Atínale?

Plataforma web donde grupos de personas predicen marcadores de partidos de fútbol, arman un pozo entre todos, y el que más acierta se lleva el premio. La plataforma retiene automáticamente el **10% como comisión** — siempre visible para todos los participantes.

- **Lanzamiento oficial:** 11 de junio de 2026 (FIFA World Cup 2026)
- **Escala futura:** Champions League → Liga MX → más competencias
- **Modelo de negocio:** 10% del pozo + quinielas privadas empresas + Google Ads

---

## Stack tecnológico elegido

| Herramienta | Versión | Para qué sirve |
|---|---|---|
| Next.js | 16.2.2 | Framework principal — páginas, rutas, APIs |
| TypeScript | incluido | Código más seguro y predecible |
| Tailwind CSS | 3.4 | Sistema de estilos visuales |
| Framer Motion | instalado | Animaciones fluidas |
| Bebas Neue | instalado | Fuente deportiva para títulos |
| Supabase | pendiente conectar | Base de datos + Auth + Storage + Realtime |
| Vercel | cuenta lista | Hosting gratuito con deploy automático |
| Mercado Pago | Checkout Pro | Pagos — 3.49% por transacción |
| GitHub | ✅ conectado | Control de versiones + respaldo en nube |

---

## Identidad visual

### Paleta de colores
| Color | Hex | Uso |
|---|---|---|
| Morado primario | `#534AB7` | Navbar, botones, bordes |
| Dorado acento | `#EFC84A` | Premio, aciertos, crosshair |
| Fondo noche | `#0D0D1A` | Fondo principal |
| Azul profundo | `#0A0F2E` | Gradiente hero |
| Lavanda | `#7F77DD` | Textos secundarios |
| Blanco suave | `#AFA9EC` | Textos de apoyo |
| Verde acierto | `#1D9E75` | Predicción correcta |

### El símbolo — La Diana con Crosshair
Diana con 3 anillos + punto dorado animado + líneas de mira (crosshair) en dorado. Metáfora perfecta: "le atinaste al marcador".

---

## Base de datos — 6 tablas diseñadas

`users` → `participants` → `predictions`  
`quinelas` → `matches` → `payments`

Lógica de puntuación:
- Marcador exacto = **3 puntos**
- Resultado correcto = **1 punto**
- Fallo = **0 puntos**
- Referido inscrito y pagado = **+5 puntos**

Lógica del pozo:
- Pozo total = suma de inscripciones
- Comisión = 10% siempre visible
- Premio neto = pozo total − comisión

---

## Comandos esenciales

```bash
# Arrancar servidor local
npm run dev -- --webpack

# Guardar cambios en GitHub
git add .
git commit -m "descripción del cambio"
git push

# Instalar librería nueva
npm install nombre-libreria
```

---

## Repositorio GitHub
https://github.com/iviemunoz8606-bit/atinale

---

## ✅ Sesión 1 — Lo que se construyó
**Fecha:** 2 de abril de 2026

- Definimos nombre, stack, identidad visual y base de datos
- Instalamos Node.js v22.22.2, Git, VS Code en Windows 11
- Resolvimos bloqueos de Smart App Control de Windows
- Creamos proyecto Next.js con TypeScript + Tailwind
- Instalamos Framer Motion + fuente Bebas Neue
- Construimos landing page completa:
  - Navbar fija con logo + diana animada + crosshair
  - Hero: CÓBRATE + ¿CUÁNTO SABES DE FÚTBOL?
  - Contador animado $0 → $5,400 MXN
  - Tarjeta México 🇲🇽 vs Sudáfrica 🇿🇦 con banderas reales
  - Sistema de puntos visual
  - 3 pasos animados: REGÍSTRATE → PREDICE → GANA
  - CTA con efecto glow dorado
- Subimos todo a GitHub ✅

**Cuentas listas:**
- ✅ GitHub: https://github.com/iviemunoz8606-bit/atinale
- ✅ Supabase: proyecto `atinale` creado
- ✅ Vercel: conectado con GitHub
- ✅ Mercado Pago: Checkout Pro activo

---

## Plan de sesiones

### 🔜 Sesión 2 — Supabase + Deploy
1. Crear las 6 tablas en Supabase con SQL
2. Conectar Next.js con Supabase
3. Deploy en Vercel → URL pública real
4. Atínale live en `atinale.vercel.app` ✅

### 🔜 Sesión 3 — Autenticación
5. Login con Google + Facebook via Supabase Auth
6. Página de registro con nombre + teléfono
7. Rutas protegidas (privadas vs públicas)

### 🔜 Sesión 4 — Quinielas y Pagos
8. Panel admin: crear quiniela + partidos
9. Página de quinielas disponibles
10. Flujo inscripción + pago Mercado Pago
11. Validación automática del pago

### 🔜 Sesión 5 — Predicciones
12. Formulario de predicción por partido
13. Bloqueo automático al iniciar partido
14. Cálculo automático de puntos
15. Vista de mis predicciones

### 🔜 Sesión 6 — Rankings y Dashboard
16. Tabla de posiciones en tiempo real
17. Dashboard animado del participante
18. Historial de aciertos/fallos
19. Ranking histórico entre quinielas

### 🔜 Sesión 7 — Referidos
20. Link único: `atinale.mx/ref/CODIGO`
21. +5 puntos automáticos al confirmar pago
22. Página de mis referidos

### 🔜 Sesión 8 — Panel Admin
23. Dashboard de ingresos y comisiones
24. Validar comprobantes con un clic
25. Capturar resultados → puntos automáticos
26. Cerrar quiniela y mostrar ganadores

### 🔜 Sesión 9 — Ads + Mobile
27. Espacios Google Ads integrados
28. Optimización responsive mobile first
29. Pruebas con usuarios reales

### 🔜 Sesión 10 — Lanzamiento 🏆
30. Dominio propio (atinale.mx)
31. Configuración producción Vercel
32. Primera quiniela real creada
33. **11 junio 2026 — FIFA World Cup arranca**

---

## Notas importantes

> ⚠️ Usar siempre `npm run dev -- --webpack`
> ⚠️ Smart App Control desactivado para desarrollo — correcto y seguro  
> ✅ Guardar con Ctrl+S — Next.js recarga automático  
> ✅ Terminal VS Code (Ctrl+`) para todos los comandos  
> ✅ Subir a GitHub después de cada sesión