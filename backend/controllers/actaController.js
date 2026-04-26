const Acta = require('../models/Acta');

// 1. Crear una nueva acta (Solo Secretario o Super Admin)
exports.crearActa = async (req, res) => {
    try {
        const { titulo } = req.body;
        const acta = new Acta({ titulo });
        acta.autor = req.usuario.id; 

        // CAMBIO AQUÍ: Atrapamos el archivo que viene de multer/Cloudinary
        if (req.file) {
            acta.archivoUrl = req.file.path; 
        } else {
            return res.status(400).json({ msg: 'Debes subir un archivo escaneado (PDF o Imagen)' });
        }

        await acta.save();
        res.status(201).json({ msg: 'Acta guardada exitosamente', acta });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al guardar el acta');
    }
};
// 2. Obtener TODAS las actas (Para el panel de auditoría)
exports.obtenerActas = async (req, res) => {
    try {
        const actas = await Acta.find()
            .populate('autor', 'nombre') 
            .populate('modificadoPor', 'nombre') // Traemos el nombre del que modificó
            .populate('eliminadoPor', 'nombre')  // Traemos el nombre del que eliminó
            .sort({ createdAt: -1 });

        res.json(actas);
    } catch (error) {
        res.status(500).send('Hubo un error al obtener las actas');
    }
};

// 3. Modificar un acta (Solo actualizar el archivo PDF)
exports.actualizarActa = async (req, res) => {
    try {
        let acta = await Acta.findById(req.params.id);
        if (!acta) return res.status(404).json({ msg: 'Acta no encontrada' });

        if (req.file) {
            acta.archivoUrl = req.file.path; // Subimos el nuevo documento
            acta.modificadoPor = req.usuario.id; // Registramos al usuario que hizo el cambio
            await acta.save(); // Esto actualiza el 'updatedAt' automáticamente
            res.json({ msg: 'Documento actualizado correctamente', acta });
        } else {
            res.status(400).json({ msg: 'Debes adjuntar el nuevo documento PDF' });
        }
    } catch (error) {
        res.status(500).send('Hubo un error al actualizar');
    }
};

// 4. Eliminar un acta (Borrado Lógico)
exports.eliminarActa = async (req, res) => {
    try {
        let acta = await Acta.findById(req.params.id);
        if (!acta) return res.status(404).json({ msg: 'Acta no encontrada' });

        // En lugar de borrarlo de la base de datos, lo marcamos como eliminado
        acta.estado = 'Eliminado';
        acta.eliminadoPor = req.usuario.id;
        acta.fechaEliminacion = new Date();
        
        await acta.save();
        res.json({ msg: 'Acta marcada como eliminada en el registro histórico' });
    } catch (error) {
        res.status(500).send('Hubo un error al eliminar');
    }
};