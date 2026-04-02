# Atínale — Tarjeta de Trucos 🎯
> Guárdala. Ábrela cada vez que arranques a trabajar.

---

## Arrancar el proyecto cada día

```bash
# 1. Abrir VS Code en la carpeta del proyecto
# (si ya lo tienes abierto, salta al paso 2)

# 2. Abrir terminal en VS Code
Ctrl + `

# 3. Arrancar el servidor
npm run dev -- --webpack

# 4. Ver en el navegador
http://localhost:3000
```

---

## Guardar en GitHub al terminar

```bash
# Paso 1 — Preparar todos los cambios
git add .

# Paso 2 — Guardar con mensaje descriptivo
git commit -m "lo que hiciste hoy"

# Paso 3 — Subir a GitHub
git push
```

**Ejemplos de mensajes buenos:**
```
git commit -m "feat: pagina de registro de usuarios"
git commit -m "fix: corregir color del boton"
git commit -m "docs: actualizar bitacora sesion 2"
```

---

## Trabajar desde otra máquina (primera vez)

```bash
# 1. Instalar Node.js, Git y VS Code

# 2. Clonar el proyecto
git clone https://github.com/iviemunoz8606-bit/atinale.git

# 3. Entrar a la carpeta
cd atinale

# 4. Instalar dependencias
npm install

# 5. Arrancar
npm run dev -- --webpack
```

---

## Ver el proyecto actualizado

| Dónde | URL | Para qué |
|---|---|---|
| Tu máquina | `localhost:3000` | Ver cambios al instante |
| GitHub | `github.com/iviemunoz8606-bit/atinale` | Ver código guardado |
| Internet | `atinale.vercel.app` | Lo que ve el mundo (Sesión 2) |

---

## Si algo se rompe — no entres en pánico

```bash
# El servidor se cayó → solo vuelve a correr
npm run dev -- --webpack

# Algo raro con los módulos → reinstalar todo
npm install

# Ver qué cambios tienes sin guardar
git status

# Ver historial de lo que has guardado
git log --oneline
```

---

## Flujo completo de una sesión de trabajo

```
1. Abrir VS Code
2. Ctrl+` para abrir terminal
3. npm run dev -- --webpack
4. Abrir localhost:3000 en el navegador
5. Trabajar y ver cambios en tiempo real
6. Al terminar:
   git add .
   git commit -m "mensaje"
   git push
7. Verificar en github.com que subió
```

---

## Lo que NO hay que tocar (nunca)

```
node_modules/     ← Se regenera con npm install
.next/            ← Se regenera automático
package-lock.json ← Se maneja solo
```

---

## Lo que SÍ editamos nosotros

```
src/app/page.tsx        ← La página principal
src/app/layout.tsx      ← El marco de todas las páginas
src/app/globals.css     ← Colores y estilos base
public/                 ← Imágenes y recursos
BITACORA.md             ← Notas del proyecto
```

---

## Sesión 2 — Lo que haremos

1. Crear las 6 tablas en Supabase (SQL — yo te doy el código)
2. Conectar Next.js con Supabase (.env.local)
3. Conectar GitHub con Vercel
4. **Atínale live en internet con URL real** 🌐

**Tiempo estimado: 45-60 minutos**

---

## Recordatorio importante

> Siempre usar `npm run dev -- --webpack`
> (no solo `npm run dev` — falla en Windows)

> Guardar archivos con `Ctrl+S`
> (Next.js recarga automático al guardar)

> Terminal siempre dentro de VS Code
> (`Ctrl+`` para abrirla`)
