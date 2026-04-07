const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, esSuperAdmin } = require('../middleware/auth'); // Importamos los guardas

// Ruta temporal para crear el primer Super Admin (Queda libre)
router.post('/setup', usuarioController.crearSuperAdmin);

// Ruta para iniciar sesión (Queda libre)
router.post('/login', usuarioController.login);

// Ruta para invitar (PROTEGIDA: Requiere Token y ser Super Admin)
router.post('/invitar', verificarToken, esSuperAdmin, usuarioController.invitarUsuario);

// Ruta para activar la cuenta usando el token enviado por correo (Queda libre)
router.post('/activar/:token', usuarioController.activarCuenta);

module.exports = router;