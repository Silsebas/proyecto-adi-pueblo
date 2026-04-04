const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        // Usaremos la URI de tu .env o la local por defecto
        const url = process.env.MONGO_URI || 'mongodb://localhost:27017/adi_pueblo';
        await mongoose.connect(url);
        console.log('✅ MongoDB Conectado: Base de datos ADI');
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;