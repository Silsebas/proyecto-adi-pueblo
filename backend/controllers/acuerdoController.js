const Acuerdo = require('../models/Acuerdo');

exports.crearAcuerdo = async (req, res) => {
    try {
        const { titulo, fechaAcuerdo, puntos } = req.body;
        
        // Convertimos los puntos a un array si vienen como texto separado por saltos de línea
        const puntosArray = Array.isArray(puntos) ? puntos : puntos.split('\n').filter(p => p.trim() !== '');

        const nuevoAcuerdo = new Acuerdo({
            titulo,
            fechaAcuerdo,
            puntos: puntosArray,
            autor: req.usuario.id
        });

        await nuevoAcuerdo.save();
        res.json({ msg: 'Acuerdo publicado para los vecinos', acuerdo: nuevoAcuerdo });
    } catch (error) {
        res.status(500).send('Hubo un error al crear el acuerdo');
    }
};

exports.obtenerAcuerdos = async (req, res) => {
    try {
        const acuerdos = await Acuerdo.find().sort({ fechaAcuerdo: -1 }); // Del más nuevo al más viejo
        res.json(acuerdos);
    } catch (error) {
        res.status(500).send('Hubo un error al obtener los acuerdos');
    }
};

exports.eliminarAcuerdo = async (req, res) => {
    try {
        await Acuerdo.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Acuerdo eliminado del muro público' });
    } catch (error) {
        res.status(500).send('Hubo un error al eliminar');
    }
};