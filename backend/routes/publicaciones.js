const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const { verificarToken } = require('../middleware/auth');

// api/publicaciones

// Leer todas las publicaciones (PÚBLICO - No ocupa token)
router.get('/', publicacionController.obtenerPublicaciones);

// Crear publicación (PROTEGIDO - Ocupa token)
router.post('/', verificarToken, publicacionController.crearPublicacion);

// Modificar publicación (PROTEGIDO - Ocupa token)
router.put('/:id', verificarToken, publicacionController.actualizarPublicacion);

// Eliminar publicación (PROTEGIDO - Ocupa token)
router.delete('/:id', verificarToken, publicacionController.eliminarPublicacion);

module.exports = router;