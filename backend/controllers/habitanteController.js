const Habitante = require('../models/Habitante');

exports.registrarHabitante = async (req, res) => {
    try {
        const { identificacion } = req.body;
        // Evitar duplicados
        let existe = await Habitante.findOne({ identificacion });
        if (existe) return res.status(400).json({ msg: 'Esta persona ya se encuentra registrada en el padrón comunal.' });

        const nuevoHabitante = new Habitante(req.body);
        await nuevoHabitante.save();
        res.json({ msg: 'Registro completado exitosamente.' });
    } catch (error) {
        res.status(500).send('Error al registrar habitante');
    }
};

exports.obtenerHabitantes = async (req, res) => {
    try {
        const habitantes = await Habitante.find().sort({ createdAt: -1 });
        res.json(habitantes);
    } catch (error) { res.status(500).send('Error al obtener el padrón'); }
};

exports.eliminarHabitante = async (req, res) => {
    try {
        await Habitante.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Habitante removido del padrón' });
    } catch (error) { res.status(500).send('Error al eliminar'); }
};