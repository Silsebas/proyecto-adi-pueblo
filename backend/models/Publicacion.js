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
    // Guardamos quién hizo la publicación vinculándolo a la colección de Usuarios
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true // 🪄 MAGIA: Crea automáticamente 'createdAt' y 'updatedAt'
});

module.exports = mongoose.model('Publicacion', PublicacionSchema);