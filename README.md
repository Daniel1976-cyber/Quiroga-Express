# Mercy Market - Panel Administrador

## 🚀 Cómo Empezar

### Acceso
- **Tienda**: `https://mercymarket.vercel.app/`
- **Panel Admin**: `https://mercymarket.vercel.app/admin.html`
- **Contraseña**: Configurada vía variable de entorno `ADMIN_PASSWORD`. No expongas la contraseña en el código ni en este documento.

---

## 📋 Características

### Tienda (romero.html)
- ✅ Catálogo de productos por categorías
- ✅ Carrito de compras flotante
- ✅ Integración con WhatsApp para pedidos
- ✅ Filtrado por categoría
- ✅ Datos desde Supabase en tiempo real

### Panel Administrador (admin.html)
- 🔐 Login con contraseña
- 📊 Dashboard con estadísticas
- 📦 Tabla de productos
- ➕ Agregar nuevos productos
- ✏️ Editar productos existentes
- 🗑️ Eliminar productos
- 🎨 Interfaz profesional y responsive

### API (api/products.js)
- GET `/api/products` - Obtiene todos los productos
- CORS habilitado para solicitudes públicas

---

## 🔧 Configuración

### Variables de Entorno (Vercel)

Ve a **Settings → Environment Variables** en Vercel y agrega:

```env
SUPABASE_URL=https://<your-supabase-url>.supabase.co
SUPABASE_KEY=<your-anon-key>
ADMIN_PASSWORD=<your-secure-admin-password>
```

---

## ⚠️ Seguridad (IMPORTANTE)

### 1. Credenciales Expuestas
- Las claves de Supabase están en `index.html` y `admin.html`
- **Debes regenerarlas inmediatamente**

### 2. Pasos de Seguridad

**a) Regenerar Claves en Supabase**
```
1. Supabase Dashboard
2. Project Settings → API Keys
3. Haz clic en "Regenerate" (o crear una nueva)
4. Copia la nueva clave anónima
```

**b) Cambiar Contraseña Admin**
```javascript
// In admin.html (better: fetch from secure endpoint or env)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // use environment variable, not hardcoded
```

**c) Usar Variables de Entorno**
```javascript
// En lugar de hardcodear, usar fetch a un endpoint seguro
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
```

**d) Configurar Row Level Security (RLS) en Supabase**
```sql
-- Solo lectura pública
CREATE POLICY "public_read" ON productos 
FOR SELECT TO anon USING (true);

-- Solo admin puede modificar
CREATE POLICY "admin_write" ON productos 
FOR INSERT, UPDATE, DELETE TO authenticated USING (true);
```

---

## 📁 Estructura del Proyecto

```
mercy/
├── index.html          # Tienda pública
├── admin.html           # Panel de administración
├── api/
│   └── products.js      # Función serverless GET
├── vercel.json          # Configuración de Vercel
├── .env.example         # Template de variables
├── package.json         # Dependencias
└── README.md            # Este archivo
```

---

## 🔄 Flujo de Datos

```
index.html (Cliente)
    ↓
    └→ Supabase (Base de datos)
    
admin.html (Admin)
    ↓
    └→ Supabase (Insertar/Actualizar/Eliminar)
    
api/products.js (Serverless)
    ↓
    └→ Supabase (Lectura)
```

---

## 🛠️ Tabla de Productos (Supabase)

Estructura esperada:

```sql
CREATE TABLE productos (
  id BIGINT PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  disponible BOOLEAN DEFAULT true,
  img TEXT,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 📱 Uso del Admin

### Login
1. Ve a `mercymarket.vercel.app/admin.html`
2. Ingresa: `mercy123`
3. Click en "Ingresar"

### Dashboard
- Ve estadísticas de productos
- Total, disponibles, agotados, categorías

### Gestionar Productos
- **Ver**: Tabla con todos los productos
- **Editar**: Click en botón "Editar"
- **Eliminar**: Click en botón "Eliminar" + confirmación

### Agregar Producto
1. Click en "Agregar Producto"
2. Completa el formulario
3. Click en "Guardar Producto"

---

## 🚨 Problemas Comunes

### "Error al conectar a Supabase"
- Verifica que las claves estén correctas
- Revisa que la tabla `productos` exista
- Abre la consola (F12) para ver errores

### "Contraseña incorrecta"
- Verifica que escribas `mercy123` correctamente
- Cambia la contraseña en `admin.html` si es necesario

### "CORS Error"
- Revisa `vercel.json` - debe tener headers de CORS
- Verifica que `api/products.js` tenga CORS habilitado

---

## 📞 Soporte

¿Necesitas ayuda? Revisa:
- Console del navegador (F12)
- Logs de Supabase
- Vercel Deployment Logs

---

## 📄 Licencia

Proyecto privado de Mercy Market © 2025
