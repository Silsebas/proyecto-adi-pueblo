const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Conectar a la base de datos
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta base de prueba
app.get('/', (req, res) => res.send('API de la Asociación funcionando 🚀'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});