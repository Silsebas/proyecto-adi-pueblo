const express = require('express');
const router = express.Router();
const tallerController = require('../controllers/tallerController');
const { verificarToken } = require('../middleware/auth');

// Rutas de administración de Talleres
router.post('/', verificarToken, tallerController.crearTaller);
router.get('/', tallerController.obtenerTalleres); // Pública
router.delete('/:id', verificarToken, tallerController.eliminarTaller);

// Rutas de Inscripciones
router.post('/inscribir', tallerController.inscribirPersona); // Pública
router.get('/inscripciones/listado', verificarToken, tallerController.obtenerInscripciones); // Privada

module.exports = router;