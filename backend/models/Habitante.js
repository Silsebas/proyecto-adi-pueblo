const mongoose = require('mongoose');

const HabitanteSchema = mongoose.Schema({
    tipoIdentificacion: { type: String, required: true }, // '1' Nacional, '2' DIMEX, '3' Pasaporte
    identificacion: { type: String, required: true, unique: true },
    nombreCompleto: { type: String, required: true },
    nacionalidad: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    edad: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Habitante', HabitanteSchema);