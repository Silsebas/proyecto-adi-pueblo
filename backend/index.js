/*require('dotenv').config();
const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');*/
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log("🔑 TEST DE SECRETO:", process.env.JWT_SECRET);

const express = require('express'); 
const conectarDB = require('./config/db');
const cors = require('cors');

const app = express();
// Conectar a la base de datos
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/publicaciones', require('./routes/publicaciones'));
app.use('/api/actas', require('./routes/actas'));
app.use('/api/configuracion', require('./routes/configuracion'));
app.use('/api/miembros', require('./routes/miembros'));
app.use('/api/acuerdos', require('./routes/acuerdos'));
app.use('/api/talleres', require('./routes/talleres'));
app.use('/api/habitantes', require('./routes/habitantes'));

// Ruta base de prueba
app.get('/', (req, res) => res.send('API de la Asociación funcionando 🚀'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});