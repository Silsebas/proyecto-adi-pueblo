import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

    const [nombreMiembro, setNombreMiembro] = useState('');
    const [puestoMiembro, setPuestoMiembro] = useState('');
    const [ordenMiembro, setOrdenMiembro] = useState('');
    const [fotoMiembro, setFotoMiembro] = useState(null);
    const [mensajeMiembro, setMensajeMiembro] = useState('');
    const [cargandoMiembro, setCargandoMiembro] = useState(false);

    const [listaMiembros, setListaMiembros] = useState([]);

    const cargarListaMiembros = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/miembros');
            const data = await res.json();
            setListaMiembros(data);
        } catch (error) {
            console.error("Error al cargar miembros", error);
        }
    };

    useEffect(() => {
        if (vistaActual === 'usuarios') {
            cargarListaMiembros();
        }
    }, [vistaActual]);

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

    // --- FUNCIÓN PARA AGREGAR MIEMBRO DE LA JUNTA ---
    const handleSubirMiembro = async (e) => {
        e.preventDefault();
        setCargandoMiembro(true);
        setMensajeMiembro('Guardando miembro, por favor espera...');

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('nombre', nombreMiembro);
        formData.append('puesto', puestoMiembro);
        formData.append('orden', ordenMiembro);
        if (fotoMiembro) formData.append('imagen', fotoMiembro);

        try {
            const respuesta = await fetch('http://localhost:4000/api/miembros', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (respuesta.ok) {
                setMensajeMiembro('✅ ¡Miembro de la junta agregado con éxito!');
                setNombreMiembro('');
                setPuestoMiembro('');
                setOrdenMiembro('');
                setFotoMiembro(null);
                document.getElementById('input-foto-miembro').value = ''; 
            } else {
                const errorData = await respuesta.json();
                setMensajeMiembro(`❌ Error: ${errorData.msg || 'No se pudo guardar'}`);
            }
        } catch (error) {
            setMensajeMiembro('❌ Error de conexión con el servidor.');
        } finally {
            setCargandoMiembro(false);
        }
    };

    // --- FUNCIÓN PARA ELIMINAR UN MIEMBRO (RENOVACIÓN DE JUNTA) ---
    const handleEliminarMiembro = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar a este directivo? Esto lo quitará de la página principal.")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:4000/api/miembros/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // Volvemos a cargar la lista para que desaparezca al instante
                cargarListaMiembros(); 
                setMensajeMiembro('🗑️ Miembro eliminado correctamente.');
                cargarListaMiembros();
            }
        } catch (error) {
            setMensajeMiembro('❌ Error al intentar eliminar.');
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

                {/* NUEVO: Botón para regresar a ver los cambios en la página pública */}
                <div style={{ padding: '0 20px', marginBottom: '15px' }}>
                    <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        🏠 Ver Sitio Público
                    </Link>
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
                        <h2>Gestión de la Junta Directiva</h2>
                        <p>Agrega a los directivos para que aparezcan en la página principal.</p>
                        
                        <form onSubmit={handleSubirMiembro} className="formulario-panel">
                            <div className="form-grupo">
                                <label>Nombre Completo:</label>
                                <input 
                                    type="text" 
                                    value={nombreMiembro} 
                                    onChange={(e) => setNombreMiembro(e.target.value)} 
                                    required 
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>

                            <div className="form-grupo">
                                <label>Puesto / Cargo:</label>
                                <input 
                                    type="text" 
                                    value={puestoMiembro} 
                                    onChange={(e) => setPuestoMiembro(e.target.value)} 
                                    required 
                                    placeholder="Ej: Presidente"
                                />
                            </div>

                            <div className="form-grupo">
                                <label>Orden de aparición (Número):</label>
                                <input 
                                    type="number" 
                                    value={ordenMiembro} 
                                    onChange={(e) => setOrdenMiembro(e.target.value)} 
                                    required 
                                    placeholder="1 = Primero en salir"
                                />
                            </div>

                            <div className="form-grupo">
                                <label>Foto Formal:</label>
                                <input 
                                    type="file" 
                                    id="input-foto-miembro"
                                    accept="image/*" 
                                    onChange={(e) => setFotoMiembro(e.target.files[0])} 
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-submit-panel" disabled={cargandoMiembro}>
                                {cargandoMiembro ? 'Guardando...' : 'Guardar Directivo'}
                            </button>

                            {mensajeMiembro && <p className="mensaje-respuesta">{mensajeMiembro}</p>}
                        </form>

                        {/* 🚨 NUEVA SECCIÓN: MANTENIMIENTO DE JUNTA 🚨 */}
                        <hr style={{ margin: '40px 0', borderColor: '#ccc' }} />
                        
                        <h3>Directivos Actuales</h3>
                        <p>Usa esta lista para eliminar miembros cuando la junta se renueve.</p>
                        
                        <div className="tabla-responsiva">
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '15px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                        <th style={{ padding: '10px' }}>Orden</th>
                                        <th style={{ padding: '10px' }}>Nombre</th>
                                        <th style={{ padding: '10px' }}>Puesto</th>
                                        <th style={{ padding: '10px' }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaMiembros.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>No hay miembros registrados aún.</td></tr>
                                    ) : (
                                        listaMiembros.map((m) => (
                                            <tr key={m._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                <td style={{ padding: '10px' }}>{m.orden}</td>
                                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.nombre}</td>
                                                <td style={{ padding: '10px' }}>{m.puesto}</td>
                                                <td style={{ padding: '10px' }}>
                                                    <button 
                                                        onClick={() => handleEliminarMiembro(m._id)}
                                                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;