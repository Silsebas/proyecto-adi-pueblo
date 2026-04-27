const express = require('express');
const router = express.Router();
const habitanteController = require('../controllers/habitanteController');
const { verificarToken } = require('../middleware/auth');

router.post('/', habitanteController.registrarHabitante); // Público para los vecinos
router.get('/', verificarToken, habitanteController.obtenerHabitantes); // Solo la Junta
router.delete('/:id', verificarToken, habitanteController.eliminarHabitante);

module.exports = router;