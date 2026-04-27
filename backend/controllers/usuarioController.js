const Usuario = require('../models/Usuario');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- FUNCIÓN 1: Invitar Usuario ---
exports.invitarUsuario = async (req, res) => {
    const { nombre, email, role } = req.body;

    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) return res.status(400).json({ msg: 'El usuario ya existe' });

        const token = crypto.randomBytes(32).toString('hex');
        
        usuario = new Usuario({
            nombre,
            email,
            role,
            activationToken: token,
            tokenExpiration: Date.now() + 3600000 * 24 // 24 horas
        });

        await usuario.save();

       const urlActivacion = `${process.env.FRONTEND_URL}/activar-cuenta/${token}`;

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: 'Invitación a la plataforma ADI - Activa tu cuenta',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #e2e2e2; padding: 20px;">
                    <h2>Hola ${nombre}</h2>
                    <p>Has sido invitado a la plataforma de la Asociación de Desarrollo como <strong>${role}</strong>.</p>
                    <p>Para activar tu cuenta y crear tu contraseña, haz clic en el siguiente botón:</p>
                    <a href="${urlActivacion}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Activar Cuenta</a>
                </div>
            `,
        };

        await sgMail.send(msg);
        res.json({ msg: 'Invitación enviada exitosamente' });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al enviar la invitación');
    }
}; 


// --- FUNCIÓN 2: Crear Super Admin ---
exports.crearSuperAdmin = async (req, res) => {
    try {
        const existeAdmin = await Usuario.findOne({ role: 'super_admin' });
        if (existeAdmin) {
            return res.status(400).json({ msg: 'Ya existe un Super Admin en el sistema' });
        }

        const superAdmin = new Usuario({
            nombre: 'Jordan Cubillo', 
            email: 'jordancubillo@gmail.com', 
            password: 'silsebas1990.', 
            role: 'super_admin',
            isActivated: true,
            debeCambiarPassword: false // 🚨 El Super Admin no necesita cambio forzado inicial
        });

        const salt = await bcrypt.genSalt(10);
        superAdmin.password = await bcrypt.hash(superAdmin.password, salt);

        await superAdmin.save();
        res.json({ msg: 'Super Admin creado exitosamente', admin: superAdmin });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al crear el Super Admin');
    }
}; 

// --- FUNCIÓN 3: Login de Usuario ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: 'El usuario no existe' });
        }

        if (!usuario.isActivated) {
            return res.status(401).json({ msg: 'Debes activar tu cuenta primero revisando tu correo.' });
        }

        const passCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passCorrecto) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        const payload = {
            usuario: {
                id: usuario.id,
                role: usuario.role 
            }
        };

        jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'palabraSecretaTemporal', 
            { expiresIn: '15m' }, 
            (error, token) => {
                if (error) throw error;
                // 🚨 INYECCIÓN: Enviamos el ID y la bandera de debeCambiarPassword
                res.json({ 
                    token, 
                    msg: 'Login exitoso', 
                    role: usuario.role, 
                    nombre: usuario.nombre,
                    id: usuario.id,
                    debeCambiarPassword: usuario.debeCambiarPassword 
                });
            }
        );

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al iniciar sesión');
    }
}; 

// --- FUNCIÓN 4: Activar Cuenta (Por invitación) ---
exports.activarCuenta = async (req, res) => {
    const { token } = req.params; 
    const { password } = req.body;

    try {
        const usuario = await Usuario.findOne({ 
            activationToken: token,
            tokenExpiration: { $gt: Date.now() } 
        });

        if (!usuario) {
            return res.status(400).json({ msg: 'El enlace es inválido o ha expirado' });
        }

        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(password, salt);

        usuario.isActivated = true;
        usuario.activationToken = undefined;
        usuario.tokenExpiration = undefined;
        usuario.debeCambiarPassword = false; // 🚨 Como ya eligió clave, apagamos la alerta

        await usuario.save();

        res.json({ msg: 'Cuenta activada correctamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al activar la cuenta');
    }
}; 

// =======================================================
// 🚨 INYECCIONES NUEVAS: GESTIÓN DE ACCESOS Y RECUPERACIÓN
// =======================================================

// --- FUNCIÓN 5: Obtener Lista de Usuarios (Para el Admin) ---
exports.obtenerUsuarios = async (req, res) => {
    try {
        // Excluimos datos sensibles de la respuesta
        const usuarios = await Usuario.find().select('-password -activationToken -tokenRecuperacion');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al obtener los usuarios');
    }
};

// --- FUNCIÓN 6: Eliminar / Revocar Acceso a Usuario ---
exports.eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

        // Protección: Evitar que se borre al Super Admin por error
        if (usuario.role === 'super_admin') {
            return res.status(403).json({ msg: 'No se puede eliminar la cuenta principal del sistema' });
        }

        await Usuario.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Acceso revocado y usuario eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al eliminar el usuario');
    }
};

// --- FUNCIÓN 7: Forzar Cambio de Contraseña (Pantalla de bloqueo) ---
exports.cambiarPasswordObligatorio = async (req, res) => {
    const { userId, nuevaPassword } = req.body;

    try {
        const usuario = await Usuario.findById(userId);
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(nuevaPassword, salt);
        
        // 🚨 ¡Apagamos el interruptor! Ya puede entrar libremente
        usuario.debeCambiarPassword = false;

        await usuario.save();
        res.json({ msg: 'Contraseña actualizada correctamente. Redirigiendo...' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar la contraseña');
    }
};

// --- FUNCIÓN 8: Solicitud de "Olvidé mi contraseña" ---
exports.olvidePassword = async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(404).json({ msg: 'No existe una cuenta registrada con este correo' });

        // Generar un token único
        const token = crypto.randomBytes(32).toString('hex');
        usuario.tokenRecuperacion = token;
        usuario.expiracionToken = Date.now() + 3600000; // 1 hora de validez
        
        await usuario.save();

        const urlRecuperacion = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM,
            subject: 'Recuperación de Contraseña - Panel ADI',
            html: `
                <div style="font-family: sans-serif; border: 1px solid #e2e2e2; padding: 20px;">
                    <h2>Recuperación de Acceso</h2>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>
                    <a href="${urlRecuperacion}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
                    <p style="margin-top: 20px; font-size: 0.9rem; color: #666;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura. El enlace caducará en 1 hora.</p>
                </div>
            `,
        };

        await sgMail.send(msg);
        res.json({ msg: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al procesar la solicitud');
    }
};

// --- FUNCIÓN 9: Restablecer Contraseña (Desde el correo) ---
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const usuario = await Usuario.findOne({
            tokenRecuperacion: token,
            expiracionToken: { $gt: Date.now() }
        });

        if (!usuario) return res.status(400).json({ msg: 'El enlace de recuperación es inválido o ha caducado' });

        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(password, salt);
        
        // Limpiamos los tokens de seguridad y apagamos la alerta de cambio forzado
        usuario.tokenRecuperacion = undefined;
        usuario.expiracionToken = undefined;
        usuario.debeCambiarPassword = false; 

        await usuario.save();
        res.json({ msg: 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al restablecer la contraseña');
    }
};