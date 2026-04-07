const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// 1. Le pasamos tus llaves a Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configuramos dónde y cómo se van a guardar
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'adi_publicaciones', // Se creará esta carpeta en tu Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Formatos permitidos
        transformation: [{ width: 1000, crop: 'limit' }] // Achica la imagen si es demasiado gigante para no gastar espacio
    }
});

// 3. Creamos el "camión" que transportará el archivo
const upload = multer({ storage: storage });

module.exports = upload;