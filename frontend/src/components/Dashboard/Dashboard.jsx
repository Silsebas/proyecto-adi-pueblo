import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [vistaActual, setVistaActual] = useState('inicio');

    // --- ESTADOS PARA EL FORMULARIO DE NOTICIAS ---
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [imagen, setImagen] = useState(null);
    const [mensajePub, setMensajePub] = useState('');
    const [cargandoPub, setCargandoPub] = useState(false);
    
    // --- ESTADOS PARA CONFIGURACIÓN (FOTO HERO) ---
    const [fotoHero, setFotoHero] = useState(null);
    const [mensajeConfig, setMensajeConfig] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const payloadDecodificado = JSON.parse(atob(token.split('.')[1]));
            setUsuario(payloadDecodificado.usuario);
        } catch (error) {
            console.error("Error al leer el token");
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/'); 
    };

    // --- FUNCIÓN PARA SUBIR LA NOTICIA ---
    const handleSubirNoticia = async (e) => {
        e.preventDefault();
        setCargandoPub(true);
        setMensajePub('Subiendo publicación, por favor espera...');

        const token = localStorage.getItem('token');
        
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('contenido', contenido);
        if (imagen) {
            formData.append('imagen', imagen);
        }

        try {
            const respuesta = await fetch('http://localhost:4000/api/publicaciones', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
                body: formData
            });

            if (respuesta.ok) {
                setMensajePub('✅ ¡Noticia publicada con éxito en el Muro!');
                setTitulo('');
                setContenido('');
                setImagen(null);
                document.getElementById('input-imagen').value = ''; 
            } else {
                const errorData = await respuesta.json();
                setMensajePub(`❌ Error: ${errorData.msg || 'No se pudo publicar'}`);
            }
        } catch (error) {
            console.error(error);
            setMensajePub('❌ Error de conexión con el servidor.');
        } finally {
            setCargandoPub(false);
        }
    };

    // --- FUNCIÓN PARA ACTUALIZAR FOTO PRINCIPAL ---
    const handleActualizarHero = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('imagen', fotoHero);

        try {
            const respuesta = await fetch('http://localhost:4000/api/configuracion/hero', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (respuesta.ok) {
                setMensajeConfig('✅ Foto de inicio actualizada. ¡Revisa la página principal!');
            } else {
                setMensajeConfig('❌ Error al subir la imagen. Verifica tus permisos.');
            }
        } catch (error) {
            setMensajeConfig('❌ Error de conexión con el servidor.');
        }
    };

    if (!usuario) return <p>Cargando panel...</p>;

    return (
        <div className="dashboard-container">
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2>Panel ADI</h2>
                    <p className="user-badge">{usuario.role.toUpperCase()}</p>
                </div>

                <nav className="sidebar-nav">
                    <button className={vistaActual === 'inicio' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('inicio')}>🏠 Inicio</button>
                    <button className={vistaActual === 'publicaciones' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('publicaciones')}>📰 Mis Publicaciones</button>
                    
                    {(usuario.role === 'secretario' || usuario.role === 'super_admin') && (
                        <button className={vistaActual === 'actas' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('actas')}>📁 Gestión de Actas</button>
                    )}

                    {/* CORRECCIÓN: Botones de Admin sin duplicados */}
                    {(usuario.role === 'super_admin' || usuario.role === 'admin') && (
                        <>
                            <button className={vistaActual === 'usuarios' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('usuarios')}>👥 Miembros de Junta</button>
                            <button className={vistaActual === 'configuracion' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('configuracion')}>⚙️ Ajustes del Sitio</button>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <p>Hola, <strong>{usuario.nombre}</strong></p>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </aside>

            <main className="dashboard-main">
                {vistaActual === 'inicio' && (
                    <div className="vista-inicio">
                        <h1>Bienvenido al Panel de Administración</h1>
                        <p>Desde aquí podrás gestionar la información pública de la Asociación de Desarrollo.</p>
                        <p>Selecciona una opción en el menú lateral para comenzar.</p>
                    </div>
                )}

                {vistaActual === 'publicaciones' && (
                    <div className="vista-contenido">
                        <h2>Redactar Nueva Noticia</h2>
                        <form onSubmit={handleSubirNoticia} className="formulario-panel">
                            
                            <div className="form-grupo">
                                <label>Título del Aviso o Noticia:</label>
                                <input 
                                    type="text" 
                                    value={titulo} 
                                    onChange={(e) => setTitulo(e.target.value)} 
                                    required 
                                    placeholder="Ej: Gran Feria del Agricultor este Domingo"
                                />
                            </div>

                            <div className="form-grupo">
                                <label>Contenido Completo:</label>
                                <textarea 
                                    value={contenido} 
                                    onChange={(e) => setContenido(e.target.value)} 
                                    required 
                                    rows="5"
                                    placeholder="Escribe aquí todos los detalles..."
                                ></textarea>
                            </div>

                            <div className="form-grupo">
                                <label>Imagen (Opcional):</label>
                                <input 
                                    type="file" 
                                    id="input-imagen"
                                    accept="image/*" 
                                    onChange={(e) => setImagen(e.target.files[0])} 
                                />
                                <small>Formatos permitidos: JPG, PNG. La imagen se optimizará automáticamente.</small>
                            </div>

                            <button type="submit" className="btn-submit-panel" disabled={cargandoPub}>
                                {cargandoPub ? 'Publicando...' : 'Publicar Noticia'}
                            </button>

                            {mensajePub && <p className="mensaje-respuesta">{mensajePub}</p>}
                        </form>
                    </div>
                )}
                
                {vistaActual === 'configuracion' && (
                    <div className="vista-contenido">
                        <h2>Ajustes Visuales de la Web</h2>
                        <p>Cambia la imagen principal que ven los vecinos al entrar al sitio.</p>
                        <form onSubmit={handleActualizarHero} className="formulario-panel">
                            <div className="form-grupo">
                                <label>Foto de Portada (Pueblo / Salón):</label>
                                <input type="file" onChange={(e) => setFotoHero(e.target.files[0])} required />
                            </div>
                            <button type="submit" className="btn-submit-panel">Actualizar Portada</button>
                            {mensajeConfig && <p className="mensaje-respuesta">{mensajeConfig}</p>}
                        </form>
                    </div>
                )}

                {vistaActual === 'actas' && (
                    <div className="vista-contenido">
                        <h2>Libro de Actas Digital</h2>
                        <p>Área exclusiva para la subida y modificación de Actas.</p>
                    </div>
                )}

                {vistaActual === 'usuarios' && (
                    <div className="vista-contenido">
                        <h2>Gestión de Miembros</h2>
                        <p>Próximamente: Formulario para gestionar la Junta Directiva.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;