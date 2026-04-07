const mongoose = require('mongoose');

const MiembroSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    puesto: {
        type: String,
        required: true,
        trim: true
    },
    foto: {
        type: String, // URL de Cloudinary
        required: true
    },
    orden: {
        type: Number,
        default: 0 // Para decidir quién sale primero (ej: Presidente = 1)
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Miembro', MiembroSchema);