const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { verificarToken, esAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload'); 

// GET: Para que el Home lea la foto (Público)
router.get('/', configuracionController.obtenerConfiguracion);

// POST: Para que el Admin suba la foto en /api/configuracion/hero
router.post('/hero', verificarToken, esAdmin, upload.single('imagen'), configuracionController.actualizarFotoHero);

module.exports = router;