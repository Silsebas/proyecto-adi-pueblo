import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ActivarCuenta = () => {
    const { token } = useParams(); // Atrapa el token de la URL
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        setError(''); setMensaje('');

        try {
            const respuesta = await fetch(`https://adi-santa-rita.onrender.com/api/usuarios/activar/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                setMensaje('✅ ¡Cuenta activada con éxito! Redirigiendo al Login...');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(`❌ ${data.msg || 'Error al activar'}`);
            }
        } catch (err) {
            setError('❌ Error de conexión con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '10px', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: '#2c3e50' }}>Bienvenido a la Junta</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Crea tu contraseña segura para activar tu cuenta.</p>
            
            <form onSubmit={handleSubmit}>
                <input 
                    type="password" 
                    placeholder="Escribe tu nueva contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                    style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #bdc3c7', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={cargando} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {cargando ? 'Guardando...' : 'Activar Cuenta'}
                </button>
            </form>

            {mensaje && <p style={{ color: '#27ae60', marginTop: '15px', fontWeight: 'bold' }}>{mensaje}</p>}
            {error && <p style={{ color: '#e74c3c', marginTop: '15px', fontWeight: 'bold' }}>{error}</p>}
        </div>
    );
};

export default ActivarCuenta;