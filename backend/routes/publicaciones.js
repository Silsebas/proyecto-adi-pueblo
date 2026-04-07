const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacionController');
const configuracionController = require('../controllers/configuracionController');
const { verificarToken } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Importamos Multer/Cloudinary

// Leer todas las publicaciones (PÚBLICO)
router.get('/', publicacionController.obtenerPublicaciones);

// Crear publicación (PROTEGIDO). Usamos upload.single('imagen') para recibir 1 sola foto.
router.post('/', verificarToken, upload.single('imagen'), publicacionController.crearPublicacion);

// Modificar publicación (PROTEGIDO)
router.put('/:id', verificarToken, upload.single('imagen'), publicacionController.actualizarPublicacion);

// Eliminar publicación (PROTEGIDO)
router.delete('/:id', verificarToken, publicacionController.eliminarPublicacion);

module.exports = router;