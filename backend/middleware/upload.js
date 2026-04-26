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

// 2. Configuramos dónde y cómo se van a guardar de forma inteligente
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        
        // Si el archivo que viene es un PDF:
        if (file.mimetype === 'application/pdf') {
            
            // 🚨 TU IDEA: Atrapamos el título del formulario
            let nombreLimpio = 'Documento_Legal'; // Nombre por defecto por si acaso
            
            if (req.body.titulo) {
                nombreLimpio = req.body.titulo
                    .trim() // Quita espacios al inicio y al final
                    .replace(/\s+/g, '_') // Cambia espacios en blanco por guiones bajos
                    .replace(/[^a-zA-Z0-9_]/g, ''); // Borra tildes, comas o caracteres raros que dañan el link
            }

            return {
                folder: 'adi_publicaciones',
                resource_type: 'raw', // Usamos 'raw' para evitar el maldito Error 401
                public_id: `${nombreLimpio}.pdf` // Le forzamos el nombre del formulario + la extensión
            };
        }
        
        // Si no es un PDF (es una foto normal):
        return {
            folder: 'adi_publicaciones',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 1000, crop: 'limit' }],
            resource_type: 'image'
        };
    }
});

// 3. Creamos el "camión" que transportará el archivo
const upload = multer({ storage: storage });

module.exports = upload;