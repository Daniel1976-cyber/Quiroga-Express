import 'dotenv/config';          // carga .env.local
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Cargar productos desde Supabase
let productos = [];

function fetchProductsFromSupabase() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'muipdomswcqajrpjtefp.supabase.co',
      path: '/rest/v1/productos?select=*',
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXBkb21zd2NxYWpycGp0ZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTQxNDksImV4cCI6MjA5NzU3MDE0OX0.c--lf28DFfi4VSrRT1nesMvVLy4sHhYzF32O0cbjw9o',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXBkb21zd2NxYWpycGp0ZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5OTQxNDksImV4cCI6MjA5NzU3MDE0OX0.c--lf28DFfi4VSrRT1nesMvVLy4sHhYzF32O0cbjw9o'
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
    subcategoria: "General",
    disponible: p.disponible,
    img: `https://via.placeholder.com/400x300?text=${encodeURIComponent(p.nombre)}`
  }));
  console.log(`[SERVER] Cargados ${productos.length} productos desde Supabase`);
}).catch(e => {
  console.error("Error al cargar productos desde Supabase:", e);
  // Fallback a mercy.json
  try {
    const fileData = fs.readFileSync(path.join(__dirname, 'mercy.json'), 'utf8');
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
    console.log(`[SERVER] Fallback: Cargados ${productos.length} productos desde mercy.json`);
  } catch (err) {
    console.error("Error en fallback de mercy.json:", err);
  }
});

// ─── Autenticación del panel admin ─────────────────────────────────────────
app.post('/api/validatePassword', (req, res) => {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('[AUTH] ADMIN_PASSWORD no está definida en .env.local');
    return res.status(500).json({ error: 'Configuración del servidor incorrecta' });
  }

  if (password && password === adminPassword) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Contraseña incorrecta' });
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
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
