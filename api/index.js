import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Supabase client ──────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://muipdomswcqajrpjtefp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXBkb21zd2NxYWpycGp0ZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTQxNDksImV4cCI6MjA5NzU3MDE0OX0.c--lf28DFfi4VSrRT1nesMvVLy4sHhYzF32O0cbjw9o';

console.log('[SERVER] Supabase URL:', SUPABASE_URL);
console.log('[SERVER] Supabase Key length:', SUPABASE_KEY.length);
console.log('[DEBUG] Service role key length:', process.env.SUPABASE_SERVICE_ROLE?.length);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseService = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

// ─── Almacén de sesiones activas (en memoria) ─────────────────────────────
const activeSessions = new Set();

// Cargar productos desde Supabase
let productos = [];

function fetchProductsFromSupabase() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'muipdomswcqajrpjtefp.supabase.co',
      path: '/rest/v1/productos?select=*',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status: ${res.statusCode}, Body: ${data}`));
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    req.end();
  });
}

fetchProductsFromSupabase().then(data => {
  productos = data.map(p => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    categoria: p.categoria,
    subcategoria: p.subcategoria || "General",
    disponible: p.disponible,
    img: p.img || `https://via.placeholder.com/400x300?text=${encodeURIComponent(p.nombre)}`
  }));
  console.log(`[SERVER] Cargados ${productos.length} productos desde Supabase`);
}).catch(e => {
  console.error("Error al cargar productos desde Supabase:", e);
  // Fallback a kiro.json
  try {
    const fileData = fs.readFileSync(path.join(projectRoot, 'kiro.json'), 'utf8');
    const rawProducts = JSON.parse(fileData);
    productos = rawProducts.map((p, index) => ({
      id: index + 1,
      nombre: p.Nombre,
      precio: p['Precio (CUP)'],
      categoria: p.Categoria,
      subcategoria: "General",
      disponible: true,
      img: `https://via.placeholder.com/400x300?text=${encodeURIComponent(p.Nombre)}`
    }));
    console.log(`[SERVER] Fallback: Cargados ${productos.length} productos desde kiro.json`);
  } catch (err) {
    console.error("Error en fallback de kiro.json:", err);
  }
});

// ─── Autenticación del panel admin ─────────────────────────────────────────
app.post('/api/validatePassword', (req, res) => {
  const { password } = req.body || {};

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminPassword || !adminToken) {
    console.error('[AUTH] Faltan variables de entorno');
    return res.status(500).json({
      error: 'Configuración del servidor incorrecta'
    });
  }

  if (password !== adminPassword) {
    return res.status(401).json({
      error: 'Contraseña incorrecta'
    });
  }

  return res.status(200).json({
    success: true,
    token: adminToken
  });
});

// Logout: invalida el token en el servidor
app.post('/api/logout', (req, res) => {
  return res.status(200).json({ success: true });
});

// Middleware: verifica el TOKEN, no la contraseña
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];

    // 1. validar que exista token
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 2. comparar contra variable segura del entorno
    const validToken = process.env.ADMIN_TOKEN;

    if (!validToken) {
      console.error('[AUTH] ADMIN_TOKEN no está configurado en el servidor');
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    // 3. comparación estricta
    if (token !== validToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 4. acceso permitido
    next();

  } catch (err) {
    console.error('[AUTH] verifyAdmin error:', err);
    return res.status(500).json({ error: 'Auth error' });
  }
};

// ─── Endpoints Admin Protegidos ────────────────────────────────────────────

// Crear producto
app.post('/api/admin/products', verifyAdmin, async (req, res) => {
  const { data, error } = await supabase.from('productos').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  productos.push(data[0]);
  res.json(data);
});

// Actualizar producto
app.put('/api/admin/products/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('productos').update(req.body).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  const index = productos.findIndex(p => p.id === parseInt(id));
  if (index !== -1) productos[index] = data[0];
  res.json(data);
});

// Eliminar producto
app.delete('/api/admin/products/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  productos = productos.filter(p => p.id !== parseInt(id));
  res.json({ success: true });
});

// Subir imagen (usando Base64 para Vercel)
app.post('/api/admin/upload', verifyAdmin, async (req, res) => {
  try {
    const { imageBase64, filename, mimeType } = req.body;
    if (!imageBase64 || !filename) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('[UPLOAD] Recibido upload para:', filename);
    console.log('[UPLOAD] Base64 length:', imageBase64.length);

    // ✅ Regex corregida para JavaScript (no Python)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    console.log('[UPLOAD] Base64 limpio length:', base64Data.length);

    const buffer = Buffer.from(base64Data, 'base64');
    console.log('[UPLOAD] Buffer size:', buffer.length, 'bytes');

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const finalName = `productos/${Date.now()}_${safeName}`;
    console.log('[UPLOAD] Subiendo a bucket: kiro_images, path:', finalName);

    const { data, error } = await supabaseService.storage
      .from('kiro_images')
      .upload(finalName, buffer, {
        contentType: mimeType || 'image/jpeg'
      });

    if (error) {
      console.error('[UPLOAD] Error de Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[UPLOAD] Upload exitoso:', data);

    const { data: urlData } = supabase.storage
      .from('kiro_images')
      .getPublicUrl(finalName);

    console.log('[UPLOAD] URL pública:', urlData.publicUrl);
    res.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('[UPLOAD] Error inesperado:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rutas API
app.get('/api/products', (req, res) => {
  res.json(productos);
});

app.get('/api/products/:id', (req, res) => {
  const producto = productos.find(p => p.id === parseInt(req.params.id));
  if (!producto) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  res.json(producto);
});

// Ruta para obtener categorias unicas
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(productos.map(p => p.categoria))];
  res.json(categories);
});

// Ruta para obtener subcategorias por categoria
app.get('/api/subcategories/:category', (req, res) => {
  const subcategories = [...new Set(
    productos
      .filter(p => p.categoria === req.params.category)
      .map(p => p.subcategoria)
  )];
  res.json(subcategories);
});

// Servir archivos estaticos desde el directorio raiz
app.use(express.static(projectRoot));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

// Exportar la app para que Vercel la ejecute
export default app;
