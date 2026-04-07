const mongoose = require('mongoose');

const PublicacionSchema = mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    contenido: {
        type: String,
        required: true
    },
    // NUEVO: Aquí guardaremos el link seguro de Cloudinary 🚨
    imagen: {
        type: String,
        required: false // Es opcional, por si la junta quiere subir un aviso solo de texto
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Publicacion', PublicacionSchema);