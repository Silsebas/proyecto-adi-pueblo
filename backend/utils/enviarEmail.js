const sgMail = require('@sendgrid/mail');

const enviarEmail = async (opciones) => {
    // Le pasamos la llave desde el archivo .env
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const mensaje = {
        to: opciones.email,
        from: process.env.EMAIL_FROM, // Tu correo verificado
        subject: opciones.asunto,
        html: opciones.mensajeHtml // Permite enviar correos bonitos con diseño HTML
    };

    try {
        await sgMail.send(mensaje);
        console.log('✉️ Correo enviado exitosamente a:', opciones.email);
    } catch (error) {
        console.error('❌ Error enviando correo con SendGrid:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};

module.exports = enviarEmail;