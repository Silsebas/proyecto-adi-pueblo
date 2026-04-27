const Taller = require('../models/Taller');
const Inscripcion = require('../models/Inscripcion');

// --- ADMINISTRACIÓN DE TALLERES ---
exports.crearTaller = async (req, res) => {
    try {
        // REGLA DE NEGOCIO: Límite de 6 talleres
        const total = await Taller.countDocuments();
        if (total >= 6) {
            return res.status(400).json({ msg: 'Debe eliminar una publicacion, maximo 6' });
        }

        const nuevoTaller = new Taller(req.body);
        await nuevoTaller.save();
        res.json({ msg: 'Taller publicado exitosamente', taller: nuevoTaller });
    } catch (error) {
        res.status(500).send('Error al crear el taller');
    }
};

exports.obtenerTalleres = async (req, res) => {
    try {
        const talleres = await Taller.find().sort({ createdAt: -1 });
        res.json(talleres);
    } catch (error) { res.status(500).send('Error al obtener talleres'); }
};

exports.eliminarTaller = async (req, res) => {
    try {
        await Taller.findByIdAndDelete(req.params.id);
        // Al borrar el taller, borramos sus inscripciones para mantener la BD limpia
        await Inscripcion.deleteMany({ taller: req.params.id }); 
        res.json({ msg: 'Taller eliminado' });
    } catch (error) { res.status(500).send('Error al eliminar'); }
};

// --- INSCRIPCIONES (Público y Privado) ---
exports.inscribirPersona = async (req, res) => {
    try {
        const nuevaInscripcion = new Inscripcion(req.body);
        await nuevaInscripcion.save();
        res.json({ msg: '¡Inscripción exitosa! Te esperamos.' });
    } catch (error) {
        res.status(500).send('Error en la inscripción');
    }
};

// Trae todas las inscripciones y adjunta el nombre del Taller
exports.obtenerInscripciones = async (req, res) => {
    try {
        const inscripciones = await Inscripcion.find().populate('taller', 'titulo').sort({ createdAt: -1 });
        res.json(inscripciones);
    } catch (error) { res.status(500).send('Error al obtener inscripciones'); }
};