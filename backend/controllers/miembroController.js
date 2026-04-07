const Miembro = require('../models/Miembro');

// Obtener todos los miembros (Público)
exports.obtenerMiembros = async (req, res) => {
    try {
        const miembros = await Miembro.find().sort({ orden: 1 });
        res.json(miembros);
    } catch (error) {
        res.status(500).send('Error al obtener la junta');
    }
};

// Agregar un nuevo miembro (Solo Admin)
exports.agregarMiembro = async (req, res) => {
    try {
        const { nombre, puesto, orden } = req.body;
        const miembro = new Miembro({ nombre, puesto, orden });

        if (req.file) {
            miembro.foto = req.file.path;
        } else {
            return res.status(400).json({ msg: 'La foto es obligatoria' });
        }

        await miembro.save();
        res.json({ msg: 'Miembro añadido correctamente', miembro });
    } catch (error) {
        res.status(500).send('Error al guardar miembro');
    }
};

// Eliminar miembro (Solo Admin)
exports.eliminarMiembro = async (req, res) => {
    try {
        await Miembro.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Miembro eliminado' });
    } catch (error) {
        res.status(500).send('Error al eliminar');
    }
};