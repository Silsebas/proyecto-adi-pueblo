// 1. Leer el archivo .env a la fuerza
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sgMail = require('@sendgrid/mail');

// 2. Configurar SendGrid con la llave que acabas de poner en el .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 3. Crear el mensaje
const msg = {
  to: 'jorcubi1@gmail.com', // El correo que va a recibir la prueba
  from: process.env.EMAIL_FROM,    // Lee jordancubillo@gmail.com desde tu .env
  subject: 'Prueba oficial SendGrid - Sistema ADI',
  text: '¡La configuración de la API Key fue un éxito!',
  html: '<strong>¡La configuración de la API Key fue un éxito, el sistema ya envía correos! 🎉</strong>',
};

// 4. Función para enviar
const enviarPrueba = async () => {
  console.log("Iniciando prueba de envío...");
  try {
    await sgMail.send(msg);
    console.log("✅ ¡ÉXITO TOTAL! El correo fue aceptado por SendGrid y enviado a", msg.to);
  } catch (error) {
    console.log("❌ FALLÓ EL ENVÍO. Aquí está el chisme exacto de SendGrid:");
    if (error.response) {
      console.error(error.response.body); 
    } else {
      console.error(error);
    }
  }
};

enviarPrueba();