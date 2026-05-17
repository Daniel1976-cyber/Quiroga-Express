const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Cargar productos desde mercy.json
const fs = require('fs');
let productos = [];
try {
  const data = fs.readFileSync(path.join(__dirname, 'mercy.json'), 'utf8');
  const rawProducts = JSON.parse(data);
  productos = rawProducts.map((p, index) => ({
    id: index + 1,
    nombre: p.Nombre,
    precio: p['Precio (CUP)'],
    categoria: p.Categoria,
    subcategoria: "General", // Subcategoría por defecto
    disponible: true, // Forzar disponible true ya que el usuario dijo "no uses disponibilidad por ahora"
    img: `https://via.placeholder.com/400x300?text=${encodeURIComponent(p.Nombre)}`
  }));
  console.log(`[SERVER] Cargados ${productos.length} productos desde mercy.json`);
} catch (e) {
  console.error("Error al cargar mercy.json:", e);
  productos = [
    { id: 1, nombre: "Error al cargar productos", precio: 0, categoria: "ERROR", subcategoria: "ERROR", img: "" }
  ];
}

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

// Ruta para obtener categorías únicas
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(productos.map(p => p.categoria))];
  res.json(categories);
});

// Ruta para obtener subcategorías por categoría
app.get('/api/subcategories/:category', (req, res) => {
  const subcategories = [...new Set(
    productos
      .filter(p => p.categoria === req.params.category)
      .map(p => p.subcategoria)
  )];
  res.json(subcategories);
});

// Servir archivos estáticos desde el directorio raíz (para romero.html)
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'romero.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});