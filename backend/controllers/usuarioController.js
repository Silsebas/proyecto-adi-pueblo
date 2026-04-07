const Usuario = require('../models/Usuario');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcryptjs'); // Es mejor requerirlo aquí arriba
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

        const urlActivacion = `http://localhost:5173/activar-cuenta/${token}`;

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
}; // <-- AQUÍ SE CIERRA LA PRIMERA FUNCIÓN


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
            isActivated: true 
        });

        const salt = await bcrypt.genSalt(10);
        superAdmin.password = await bcrypt.hash(superAdmin.password, salt);

        await superAdmin.save();
        res.json({ msg: 'Super Admin creado exitosamente', admin: superAdmin });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al crear el Super Admin');
    }
}; // <-- AQUÍ SE CIERRA LA SEGUNDA FUNCIÓN

// --- FUNCIÓN 3: Login de Usuario ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Revisar si el usuario existe
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: 'El usuario no existe' });
        }

        // 2. Verificar si la cuenta está activada (Vital para los invitados)
        if (!usuario.isActivated) {
            return res.status(401).json({ msg: 'Debes activar tu cuenta primero revisando tu correo.' });
        }

        // 3. Verificar el password
        const passCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passCorrecto) {
            return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }

        // 4. Crear y firmar el JWT
        const payload = {
            usuario: {
                id: usuario.id,
                role: usuario.role // Guardamos el rol en el token para el Frontend
            }
        };

        // Firmar el token (asegúrate de tener JWT_SECRET en tu .env)
        jwt.sign(
            payload, 
            process.env.JWT_SECRET || 'palabraSecretaTemporal', 
            { expiresIn: '8h' }, // El token durará 8 horas
            (error, token) => {
                if (error) throw error;
                res.json({ token, msg: 'Login exitoso', role: usuario.role, nombre: usuario.nombre });
            }
        );

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al iniciar sesión');
    }
}; // <-- AQUÍ SE CIERRA LA FUNCIÓN DE LOGIN

// --- FUNCIÓN 4: Activar Cuenta y Asignar Contraseña ---
exports.activarCuenta = async (req, res) => {
    // El token viene en la URL, el password viene en el formulario que llenará el usuario
    const { token } = req.params; 
    const { password } = req.body;

    try {
        // 1. Buscar al usuario que tenga ese token exacto y que no haya expirado
        const usuario = await Usuario.findOne({ 
            activationToken: token,
            tokenExpiration: { $gt: Date.now() } // Verifica que la fecha actual no supere la expiración
        });

        if (!usuario) {
            return res.status(400).json({ msg: 'El enlace es inválido o ha expirado' });
        }

        // 2. Encriptar la nueva contraseña que eligió el usuario
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(password, salt);

        // 3. Activar la cuenta y borrar los tokens (para que el enlace no se pueda reusar)
        usuario.isActivated = true;
        usuario.activationToken = undefined;
        usuario.tokenExpiration = undefined;

        await usuario.save();

        res.json({ msg: 'Cuenta activada correctamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al activar la cuenta');
    }
}; // <-- AQUÍ SE CIERRA LA FUNCIÓN DE ACTIVACIÓN DE CUENTA