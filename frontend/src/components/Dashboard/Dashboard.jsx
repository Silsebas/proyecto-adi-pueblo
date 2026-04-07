// src/components/Dashboard/Dashboard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    // Este "useEffect" es un guarda de seguridad del Frontend
    // Se ejecuta apenas carga la página
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Si alguien intenta entrar a /dashboard sin token, lo pateamos al login
            navigate('/login'); 
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Destruimos el pase VIP
        navigate('/login'); // Lo devolvemos a la pantalla de login
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <h2>Panel de Control - ADI</h2>
                <button 
                    onClick={handleLogout}
                    style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Cerrar Sesión
                </button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <h3>Bienvenido a la zona segura</h3>
                <p>Aquí es donde el Super Admin invitará a otros miembros y el Secretario subirá las actas.</p>
                {/* Más adelante aquí pondremos el formulario para invitar usuarios */}
            </div>
        </div>
    );
};

export default Dashboard;