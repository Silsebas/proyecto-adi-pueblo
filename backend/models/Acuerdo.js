const mongoose = require('mongoose');

const AcuerdoSchema = mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    fechaAcuerdo: { 
                    type: Date, 
                    default: () => new Date(Date.now() - 6 * 60 * 60 * 1000), // Por defecto, la fecha es 6 horas antes para evitar problemas de zona horaria        , 
                    required: true 
                    }, // La fecha real en que se tomó el acuerdo
    puntos: [{ type: String, required: true }], // Lista de viñetas con las decisiones
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Acuerdo', AcuerdoSchema);