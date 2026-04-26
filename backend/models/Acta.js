const mongoose = require('mongoose');

const ActaSchema = mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    archivoUrl: { type: String, required: true },
    
    // El creador original
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    
    // NUEVO: Auditoría de Modificaciones
    modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    
    // NUEVO: Borrado Lógico
    estado: { type: String, enum: ['Activo', 'Eliminado'], default: 'Activo' },
    eliminadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    fechaEliminacion: { type: Date }
}, {
    // Mongoose crea automáticamente 'createdAt' (creación) y 'updatedAt' (modificación)
    timestamps: true 
});

module.exports = mongoose.model('Acta', ActaSchema);