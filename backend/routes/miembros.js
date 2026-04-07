const express = require('express');
const router = express.Router();
const miembroController = require('../controllers/miembroController');
const { verificarToken, esAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', miembroController.obtenerMiembros);
router.post('/', verificarToken, esAdmin, upload.single('imagen'), miembroController.agregarMiembro);
router.delete('/:id', verificarToken, esAdmin, miembroController.eliminarMiembro);

module.exports = router;