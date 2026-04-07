const mongoose = require('mongoose');

const ActaSchema = mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    acuerdos: {
        type: String,
        required: true
    },
    // Guardamos al Secretario que subió el acta
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true // 🪄 MAGIA: Gracias a esto sabremos si el acta fue "Modificada"
});

module.exports = mongoose.model('Acta', ActaSchema);