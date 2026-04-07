// src/components/Login/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // 👈 Importamos los estilos separados

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const respuesta = await fetch('http://localhost:4000/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(data.msg || 'Error al iniciar sesión');
            }

            localStorage.setItem('token', data.token);
            navigate('/dashboard');
            
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Iniciar Sesión</h2>
            
            <p className="login-warning">
                ⚠️ <em>Acceso exclusivo solo para miembros de la junta con cuenta.</em>
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
                
                {error && <div className="error-message">{error}</div>}

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

                <button type="submit" className="login-button">
                    Entrar al Sistema
                </button>
            </form>
        </div>
    );
};

export default Login;