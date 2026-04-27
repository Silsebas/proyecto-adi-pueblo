const mongoose = require('mongoose');

const InscripcionSchema = mongoose.Schema({
    taller: { type: mongoose.Schema.Types.ObjectId, ref: 'Taller', required: true },
    nombreCompleto: { type: String, required: true },
    telefono: { type: String, required: true },
    cedula: { type: String } // Opcional
}, { timestamps: true });

module.exports = mongoose.model('Inscripcion', InscripcionSchema);