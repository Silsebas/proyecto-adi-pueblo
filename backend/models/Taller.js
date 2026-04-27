const mongoose = require('mongoose');

const TallerSchema = mongoose.Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    icono: { type: String, default: '🎓' } // Guardaremos un emoji como ícono
}, { timestamps: true });

module.exports = mongoose.model('Taller', TallerSchema);