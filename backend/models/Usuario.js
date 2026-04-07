const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: false // Opcional al inicio porque se crea mediante invitación
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin'],
        default: 'admin'
    },
    isActivated: {
        type: Boolean,
        default: false
    },
    activationToken: {
        type: String
    },
    tokenExpiration: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);