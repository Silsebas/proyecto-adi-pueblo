import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    // Estados base
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [cargando, setCargando] = useState(false);
    
    // 🚨 NUEVOS ESTADOS: Control de Vistas de Seguridad 🚨
    const [modoRecuperacion, setModoRecuperacion] = useState(false);
    const [requiereCambio, setRequiereCambio] = useState(false);
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [userIdTemp, setUserIdTemp] = useState(''); // Guarda el ID temporalmente para el cambio

    const navigate = useNavigate();

    // --- LÓGICA 1: INICIO DE SESIÓN NORMAL ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeExito('');
        setCargando(true);

        try {
            const respuesta = await fetch('http://localhost:4000/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(data.msg || 'Error al iniciar sesión');
            }

            // 🚨 VALIDACIÓN DE CAMBIO OBLIGATORIO
            if (data.debeCambiarPassword) {
                setUserIdTemp(data.id);
                setRequiereCambio(true); // Dispara la vista de cambio de contraseña
            } else {
                localStorage.setItem('token', data.token);
                navigate('/dashboard');
            }
            
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // --- LÓGICA 2: OLVIDÉ MI CONTRASEÑA ---
    const handleRecuperacionSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeExito('');
        setCargando(true);

        try {
            const respuesta = await fetch('http://localhost:4000/api/usuarios/olvide-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) throw new Error(data.msg || 'Error al procesar solicitud');

            setMensajeExito('Revisa tu bandeja de entrada o spam. Te hemos enviado un enlace de recuperación.');
            setEmail(''); // Limpiar para evitar reenvíos accidentales
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // --- LÓGICA 3: CAMBIAR CONTRASEÑA OBLIGATORIA ---
    const handleCambioPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            const respuesta = await fetch('http://localhost:4000/api/usuarios/cambiar-password-obligatorio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userIdTemp, nuevaPassword })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) throw new Error(data.msg || 'Error al actualizar contraseña');

            setMensajeExito('✅ ¡Contraseña actualizada con éxito! Por favor, inicia sesión con tu nueva clave.');
            setRequiereCambio(false);
            setPassword('');
            setNuevaPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // ==========================================
    // RENDERIZADO CONDICIONAL DE VISTAS
    // ==========================================

    // VISTA A: FORMULARIO DE CAMBIO OBLIGATORIO
    if (requiereCambio) {
        return (
            <div className="login-container">
                <h2 className="login-title" style={{ color: '#dc3545' }}>Cambio de Seguridad</h2>
                <p className="login-warning" style={{ color: '#333' }}>
                    Por políticas de seguridad del sistema, <strong>debes cambiar tu contraseña temporal</strong> antes de ingresar al panel de administración.
                </p>
                <form className="login-form" onSubmit={handleCambioPasswordSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    <div>
                        <input 
                            type="password" 
                            placeholder="Escribe tu nueva contraseña" 
                            value={nuevaPassword}
                            onChange={(e) => setNuevaPassword(e.target.value)}
                            required
                            minLength="6"
                            className="login-input"
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </button>
                </form>
            </div>
        );
    }

    // VISTA B: FORMULARIO DE RECUPERACIÓN (Olvidé mi contraseña)
    if (modoRecuperacion) {
        return (
            <div className="login-container">
                <h2 className="login-title">Recuperar Acceso</h2>
                <p className="login-warning" style={{ color: '#666', fontSize: '0.9rem' }}>
                    Ingresa el correo con el que te registraron y te enviaremos un enlace para crear una nueva contraseña.
                </p>
                <form className="login-form" onSubmit={handleRecuperacionSubmit}>
                    {error && <div className="error-message">{error}</div>}
                    {mensajeExito && <div className="error-message" style={{ backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>{mensajeExito}</div>}
                    <div>
                        <input 
                            type="email" 
                            placeholder="Correo electrónico" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="login-input"
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={cargando}>
                        {cargando ? 'Enviando...' : 'Enviar Correo de Recuperación'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => { setModoRecuperacion(false); setError(''); setMensajeExito(''); }} 
                        style={{ marginTop: '15px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                        Volver a Iniciar Sesión
                    </button>
                </form>
            </div>
        );
    }

    // VISTA C: FORMULARIO NORMAL DE LOGIN
    return (
        <div className="login-container">
            <h2 className="login-title">Iniciar Sesión</h2>
            
            <p className="login-warning">
                ⚠️ <em>Acceso exclusivo solo para miembros de la junta con cuenta.</em>
            </p>

            <form className="login-form" onSubmit={handleLoginSubmit}>
                
                {error && <div className="error-message">{error}</div>}
                {mensajeExito && <div className="error-message" style={{ backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>{mensajeExito}</div>}

                <div>
                    <input 
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="login-input"
                    />
                </div>
                
                <div>
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="login-input"
                    />
                </div>

                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                    <span 
                        onClick={() => { setModoRecuperacion(true); setError(''); setMensajeExito(''); }} 
                        style={{ fontSize: '0.85rem', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                        ¿Olvidaste tu contraseña?
                    </span>
                </div>

                <button type="submit" className="login-button" disabled={cargando}>
                    {cargando ? 'Verificando...' : 'Entrar al Sistema'}
                </button>
            </form>
        </div>
    );
};

export default Login;