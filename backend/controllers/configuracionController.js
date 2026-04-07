const Configuracion = require('../models/Configuracion');

exports.obtenerConfiguracion = async (req, res) => {
    try {
        let config = await Configuracion.findOne(); 
        if (!config) {
            return res.json({ fotoHero: '' }); 
        }
        res.json(config);
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
};

exports.actualizarFotoHero = async (req, res) => {
    try {
        let config = await Configuracion.findOne();

        if (!config) {
            config = new Configuracion({ fotoHero: '' });
        }

        if (req.file) {
            config.fotoHero = req.file.path;
        } else {
            return res.status(400).json({ msg: 'Debes seleccionar una imagen.' });
        }

        await config.save();
        res.json({ msg: 'Foto de inicio actualizada con éxito', config });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al actualizar la configuración');
    }
};