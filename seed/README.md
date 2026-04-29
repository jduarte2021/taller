# 🔧 TallerData — Guía de instalación completa

## Requisitos previos
- Node.js v18+
- MongoDB Community Server (local)
- Visual Studio Code

---

## 1. Estructura del proyecto

```
/
├── src/                  ← Backend (Express + Node)
├── taller/               ← Frontend (React + Vite)
├── seed/                 ← Script de datos de prueba ← NUEVO
├── package.json          ← Backend
└── README.md
```

---

## 2. Configurar variables de entorno

Crea el archivo `.env` en la **raíz del proyecto** (junto a `src/`):

```env
MONGODB_URI=mongodb://localhost:27017/taller
TOKEN_SECRET=tallerdata_secret_2024
PORT=3000
```

---

## 3. Instalar dependencias

Abre **2 terminales** en VSC (`Ctrl + J`):

**Terminal 1 — Backend:**
```bash
npm install
```

**Terminal 2 — Frontend:**
```bash
cd taller
npm install
```

---

## 4. Cargar datos de prueba (seed)

**Terminal 3 — Seed:**
```bash
cd seed
npm install
npm run seed
```

Salida esperada:
```
✅ Conectado a MongoDB
🗑  Colecciones limpiadas
👤 5 usuarios creados
🔧 15 órdenes de trabajo creadas

╔═══════════════════════════════════════╗
║        SEED COMPLETADO ✅              ║
╠═══════════════════════════════════════╣
║  Usuarios:    5                       ║
║  Órdenes:     15 (8 completadas, 7...)║
║  Ingresos:    $1.630.000 CLP          ║
╠═══════════════════════════════════════╣
║  CREDENCIALES DE ACCESO               ║
║  Email:    jimmy.duarte@tallerdata.cl ║
║  Password: Admin1234                  ║
╚═══════════════════════════════════════╝
```

---

## 5. Levantar el proyecto

**Terminal 1 — Backend:**
```bash
node src/index.js
# Escucha en http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd taller
npm run dev
# Abre http://localhost:5173
```

> Si MongoDB no corre como servicio, agrega una **Terminal 3:**
> ```bash
> mongod
> ```

---

## 6. Acceso al sistema

| URL | Descripción |
|-----|-------------|
| http://localhost:5173 | App principal |
| http://localhost:5173/dashboard | Dashboard nuevo |
| http://localhost:3000/api | Backend API |

**Usuarios disponibles:**

| Email | Cargo | Password |
|-------|-------|----------|
| jimmy.duarte@tallerdata.cl | Administrador | Admin1234 |
| carlos.morales@tallerdata.cl | Mecánico Senior | Admin1234 |
| lucia.soto@tallerdata.cl | Recepcionista | Admin1234 |
| pedro.contreras@tallerdata.cl | Mecánico | Admin1234 |
| andres.valdes@tallerdata.cl | Mecánico | Admin1234 |

---

## 7. Extensión MongoDB en VSC

1. Abre VSC → Extensions (`Ctrl+Shift+X`)
2. Busca: **MongoDB for VS Code** (autor: MongoDB)
3. Instalar
4. En el panel izquierdo aparece el ícono 🍃
5. Click → **Add Connection** → pega:
   ```
   mongodb://localhost:27017
   ```
6. Navega: `taller` → `users` / `tasks`

---

## 8. MongoDB Compass (GUI visual)

1. Abre MongoDB Compass
2. En **New Connection** pega:
   ```
   mongodb://localhost:27017
   ```
3. Click **Connect**
4. Selecciona la base de datos **taller**
5. Verás las colecciones `users` y `tasks` con los datos del seed

---

## 9. Ir directo al Dashboard al iniciar sesión

En `taller/src/pages/LoginPage.jsx`, cambia:
```js
navigate("/tasks")
```
por:
```js
navigate("/dashboard")
```

---

## Problemas comunes

| Error | Solución |
|-------|----------|
| `ECONNREFUSED 27017` | MongoDB no está corriendo → ejecuta `mongod` |
| `Cannot find module` | Falta `npm install` en backend o frontend |
| `ENOENT .env` | Crea el archivo `.env` en la raíz |
| Puerto 3000 ocupado | Cambia `PORT=3001` en `.env` y actualiza el proxy en `vite.config.js` |
