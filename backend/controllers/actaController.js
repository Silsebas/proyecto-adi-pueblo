const Acta = require('../models/Acta');

// 1. Crear una nueva acta (Solo Secretario o Super Admin)
exports.crearActa = async (req, res) => {
    try {
        const acta = new Acta(req.body);
        acta.autor = req.usuario.id; // Asignamos el autor desde el token

        await acta.save();
        res.status(201).json({ msg: 'Acta guardada exitosamente', acta });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al guardar el acta');
    }
};

// 2. Obtener todas las actas (Público - Para que los vecinos vean los acuerdos)
exports.obtenerActas = async (req, res) => {
    try {
        const actas = await Acta.find()
            .populate('autor', 'nombre') 
            .sort({ createdAt: -1 }); // Las más recientes primero

        res.json(actas);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al obtener las actas');
    }
};

// 3. Modificar un acta (Solo Secretario o Super Admin)
exports.actualizarActa = async (req, res) => {
    try {
        let acta = await Acta.findById(req.params.id);

        if (!acta) {
            return res.status(404).json({ msg: 'Acta no encontrada' });
        }

        // Actualizamos (Mongoose cambiará el 'updatedAt' automáticamente para decir "Modificada")
        acta = await Acta.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );

        res.json({ msg: 'Acta actualizada correctamente', acta });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al actualizar');
    }
};

// 4. Eliminar un acta
exports.eliminarActa = async (req, res) => {
    try {
        let acta = await Acta.findById(req.params.id);

        if (!acta) {
            return res.status(404).json({ msg: 'Acta no encontrada' });
        }

        await Acta.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Acta eliminada del registro' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al eliminar');
    }
};