const mongoose = require('mongoose');

const ConfiguracionSchema = mongoose.Schema({
    fotoHero: {
        type: String, // Aquí guardaremos el link de Cloudinary
        required: true
    }
});

module.exports = mongoose.model('Configuracion', ConfiguracionSchema);