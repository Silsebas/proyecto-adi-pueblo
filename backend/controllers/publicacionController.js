const Publicacion = require('../models/Publicacion');

// 1. Crear una nueva publicación (Solo Junta)
exports.crearPublicacion = async (req, res) => {
    try {
        const publicacion = new Publicacion(req.body);
        
        // Asignamos como autor al usuario que hizo la petición (gracias al Token)
        publicacion.autor = req.usuario.id; 

        await publicacion.save();
        res.status(201).json({ msg: 'Publicación creada exitosamente', publicacion });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al crear la publicación');
    }
};

// 2. Obtener todas las publicaciones (Público - Para los vecinos)
exports.obtenerPublicaciones = async (req, res) => {
    try {
        // Buscamos todas y usamos populate para traer el nombre del autor
        const publicaciones = await Publicacion.find()
            .populate('autor', 'nombre role') 
            .sort({ createdAt: -1 }); // Las más nuevas primero

        res.json(publicaciones);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al obtener las publicaciones');
    }
};

// 3. Modificar una publicación (Solo el autor o un Admin)
exports.actualizarPublicacion = async (req, res) => {
    try {
        let publicacion = await Publicacion.findById(req.params.id);

        if (!publicacion) {
            return res.status(404).json({ msg: 'Publicación no encontrada' });
        }

        // Verificamos si es el dueño de la publicación, o si es un admin/super_admin
        if (publicacion.autor.toString() !== req.usuario.id && req.usuario.role !== 'admin' && req.usuario.role !== 'super_admin') {
            return res.status(401).json({ msg: 'No tienes permiso para editar esta publicación' });
        }

        // Actualizamos (esto actualizará el updatedAt automáticamente)
        publicacion = await Publicacion.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );

        res.json({ msg: 'Publicación actualizada', publicacion });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al actualizar');
    }
};

// 4. Eliminar una publicación (Solo el autor o un Admin)
exports.eliminarPublicacion = async (req, res) => {
    try {
        let publicacion = await Publicacion.findById(req.params.id);

        if (!publicacion) {
            return res.status(404).json({ msg: 'Publicación no encontrada' });
        }

        if (publicacion.autor.toString() !== req.usuario.id && req.usuario.role !== 'admin' && req.usuario.role !== 'super_admin') {
            return res.status(401).json({ msg: 'No tienes permiso para eliminar esta publicación' });
        }

        await Publicacion.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Publicación eliminada' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al eliminar');
    }
};