const express = require('express');
const router = express.Router();
const actaController = require('../controllers/actaController');
// 🚨 Importamos el verificador de token Y el verificador de Secretario
const { verificarToken, esSecretario } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Leer todas las actas (PÚBLICO - Para los vecinos)
router.get('/', actaController.obtenerActas);

// Crear acta (PROTEGIDO - Solo Token + Rol de Secretario/SuperAdmin)
router.post('/', verificarToken, esSecretario, upload.single('archivo'), actaController.crearActa);

// Modificar acta (PROTEGIDO) - Agregamos upload.single('archivo')
router.put('/:id', verificarToken, esSecretario, upload.single('archivo'), actaController.actualizarActa);

// Eliminar acta (PROTEGIDO)
router.delete('/:id', verificarToken, esSecretario, actaController.eliminarActa);

module.exports = router;