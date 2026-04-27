const express = require('express');
const router = express.Router();
const acuerdoController = require('../controllers/acuerdoController');
const { verificarToken, esSecretario } = require('../middleware/auth'); // Usa los mismos permisos que las actas

// Rutas
router.post('/', verificarToken, esSecretario, acuerdoController.crearAcuerdo);
router.get('/', acuerdoController.obtenerAcuerdos); // Público para los vecinos
router.delete('/:id', verificarToken, esSecretario, acuerdoController.eliminarAcuerdo);

module.exports = router;