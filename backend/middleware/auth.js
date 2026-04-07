const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No hay token, permiso denegado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = cifrado.usuario; 
        next(); 
    } catch (error) {
        res.status(401).json({ msg: 'Token no válido o expirado' });
    }
};

const esSuperAdmin = (req, res, next) => {
    if (req.usuario.role !== 'super_admin') {
        return res.status(403).json({ msg: 'Acceso denegado: Solo para Super Administradores' });
    }
    next();
};

// NUEVO: Guarda de seguridad para Actas
const esSecretario = (req, res, next) => {
    // Permitimos pasar al secretario (o al super_admin por si necesita arreglar algo)
    if (req.usuario.role !== 'secretario' && req.usuario.role !== 'super_admin') {
        return res.status(403).json({ msg: 'Acceso denegado: Solo el Secretario puede gestionar actas' });
    }
    next();
};

// Asegúrate de exportar el nuevo middleware
module.exports = { verificarToken, esSuperAdmin, esSecretario };