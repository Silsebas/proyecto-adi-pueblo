import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [vistaActual, setVistaActual] = useState('inicio');

    // ==========================================
    // ESTADOS: NOTICIAS, CONFIGURACIÓN Y MIEMBROS
    // ==========================================
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [imagen, setImagen] = useState(null);
    const [mensajePub, setMensajePub] = useState('');
    const [cargandoPub, setCargandoPub] = useState(false);
    
    const [fotoHero, setFotoHero] = useState(null);
    const [mensajeConfig, setMensajeConfig] = useState('');

    const [nombreMiembro, setNombreMiembro] = useState('');
    const [puestoMiembro, setPuestoMiembro] = useState('');
    const [ordenMiembro, setOrdenMiembro] = useState('');
    const [fotoMiembro, setFotoMiembro] = useState(null);
    const [mensajeMiembro, setMensajeMiembro] = useState('');
    const [cargandoMiembro, setCargandoMiembro] = useState(false);
    const [listaMiembros, setListaMiembros] = useState([]);

    // ==========================================
    // ESTADOS: MÓDULO DE ACTAS
    // ==========================================
    const [tituloActa, setTituloActa] = useState('');
    const [archivoActa, setArchivoActa] = useState(null);
    const [mensajeActa, setMensajeActa] = useState('');
    const [cargandoActa, setCargandoActa] = useState(false);
    const [listaActas, setListaActas] = useState([]);

    // ==========================================
    // LÓGICA GLOBAL DE SEGURIDAD (Cierre automático)
    // ==========================================
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/'); // Redirige al inicio público
    };

    // 🚨 NUEVO: Guarda de seguridad global para la sesión expirada
    const verificarExpiracion = (res) => {
        if (res.status === 401 || res.status === 403) {
            alert("⏳ Por seguridad, tu sesión ha expirado tras 15 minutos de inactividad.\n\nSerás redirigido a la pantalla principal.");
            handleLogout();
            return true; // Indica que la sesión murió
        }
        return false; // Todo en orden, puede continuar
    };


    // ==========================================
    // SEGURIDAD INICIAL Y SINCRONIZACIÓN DE DATOS
    // ==========================================
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
            handleLogout();
        }
    }, [navigate]);

    const cargarListaActas = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/actas');
            setListaActas(await res.json());
        } catch (error) { console.error("Error al cargar actas", error); }
    };

    const cargarListaMiembros = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/miembros');
            setListaMiembros(await res.json());
        } catch (error) { console.error("Error al cargar miembros", error); }
    };

    useEffect(() => {
        if (vistaActual === 'actas') cargarListaActas();
        if (vistaActual === 'usuarios') cargarListaMiembros();
    }, [vistaActual]);


    // ==========================================
    // CONTROLADORES DE EVENTOS (HANDLERS)
    // ==========================================
    
    const handleSubirNoticia = async (e) => {
        e.preventDefault();
        setCargandoPub(true);
        setMensajePub('Subiendo publicación...');
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('contenido', contenido);
        if (imagen) formData.append('imagen', imagen);

        try {
            const res = await fetch('http://localhost:4000/api/publicaciones', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            
            if (verificarExpiracion(res)) return; // Corta aquí si expiró

            if (res.ok) {
                setMensajePub('✅ Noticia publicada con éxito');
                setTitulo(''); setContenido(''); setImagen(null);
                document.getElementById('input-imagen').value = ''; 
            } else { setMensajePub('❌ Error al publicar'); }
        } catch (error) { setMensajePub('❌ Error de conexión.'); } 
        finally { setCargandoPub(false); }
    };

    const handleActualizarHero = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('imagen', fotoHero);
        try {
            const res = await fetch('http://localhost:4000/api/configuracion/hero', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            
            if (verificarExpiracion(res)) return; // Corta aquí si expiró

            if (res.ok) setMensajeConfig('✅ Foto de inicio actualizada.');
            else setMensajeConfig('❌ Error al actualizar.');
        } catch (error) { setMensajeConfig('❌ Error de conexión.'); }
    };

    const handleSubirMiembro = async (e) => {
        e.preventDefault();
        setCargandoMiembro(true);
        const formData = new FormData();
        formData.append('nombre', nombreMiembro);
        formData.append('puesto', puestoMiembro);
        formData.append('orden', ordenMiembro);
        if (fotoMiembro) formData.append('imagen', fotoMiembro);

        try {
            const res = await fetch('http://localhost:4000/api/miembros', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            
            if (verificarExpiracion(res)) return; // Corta aquí si expiró

            if (res.ok) {
                setMensajeMiembro('✅ Miembro agregado');
                setNombreMiembro(''); setPuestoMiembro(''); setOrdenMiembro(''); setFotoMiembro(null);
                document.getElementById('input-foto-miembro').value = ''; 
                cargarListaMiembros();
            } else { setMensajeMiembro('❌ Error al guardar'); }
        } catch (error) { setMensajeMiembro('❌ Error de conexión'); } 
        finally { setCargandoMiembro(false); }
    };

    const handleEliminarMiembro = async (id) => {
        if (!window.confirm("¿Seguro de eliminar a este directivo?")) return;
        try {
            const res = await fetch(`http://localhost:4000/api/miembros/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (verificarExpiracion(res)) return; // Corta aquí si expiró

            if (res.ok) {
                cargarListaMiembros(); 
                setMensajeMiembro('🗑️ Miembro eliminado.');
            }
        } catch (error) { setMensajeMiembro('❌ Error al eliminar.'); }
    };

    const handleSubirActa = async (e) => {
        e.preventDefault();
        setCargandoActa(true);
        const formData = new FormData();
        formData.append('titulo', tituloActa);
        if (archivoActa) formData.append('archivo', archivoActa);

        try {
            const res = await fetch('http://localhost:4000/api/actas', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            
            if (verificarExpiracion(res)) return; // Corta aquí si expiró

            if (res.ok) {
                setMensajeActa('✅ Acta publicada legalmente.');
                setTituloActa(''); setArchivoActa(null);
                document.getElementById('input-archivo-acta').value = ''; 
                cargarListaActas();
            } else { setMensajeActa('❌ Error al guardar acta'); }
        } catch (error) { setMensajeActa('❌ Error de conexión.'); } 
        finally { setCargandoActa(false); }
    };

    const handleEliminarActa = async (id) => {
        if (!window.confirm("¿Confirmas la eliminación de este documento legal?")) return;
        try {
            const res = await fetch(`http://localhost:4000/api/actas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (verificarExpiracion(res)) return; // Corta aquí si expiró

            if (res.ok) {
                cargarListaActas();
                setMensajeActa('🗑️ Acta eliminada.');
            }
        } catch (error) { setMensajeActa('❌ Error al eliminar.'); }
    };

    if (!usuario) return <p>Cargando panel...</p>;

    return (
        <div className="dashboard-container">
            {/* --- BARRA LATERAL (SIDEBAR) --- */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2>Panel ADI</h2>
                    <p className="user-badge">{usuario.role.toUpperCase()}</p>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/" className="nav-btn" style={{ borderBottom: '1px solid #4b545c', marginBottom: '10px', color: '#4fc3f7' }}>
                        🌐 Ver Sitio Público
                    </Link>

                    <button className={vistaActual === 'inicio' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('inicio')}>🏠 Inicio</button>
                    <button className={vistaActual === 'publicaciones' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('publicaciones')}>📰 Mis Publicaciones</button>
                    
                    {(usuario.role === 'super_admin' || usuario.role === 'admin') && (
                        <>
                            <button className={vistaActual === 'usuarios' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('usuarios')}>👥 Miembros de Junta</button>
                            <button className={vistaActual === 'configuracion' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('configuracion')}>⚙️ Ajustes del Sitio</button>
                        </>
                    )}

                    {(usuario?.role === 'super_admin' || usuario?.role === 'secretario') && (
                        <button className={vistaActual === 'actas' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('actas')}>📝 Gestión de Actas</button>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <p>Hola, <strong>{usuario.nombre}</strong></p>
                    <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
                </div>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="dashboard-main">
                
                {vistaActual === 'inicio' && (
                    <div className="vista-inicio">
                        <h1>Panel de Administración</h1>
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
                                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Ej: Gran Feria del Agricultor" />
                            </div>
                            <div className="form-grupo">
                                <label>Contenido Completo:</label>
                                <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} required rows="5" placeholder="Detalles del aviso..."></textarea>
                            </div>
                            <div className="form-grupo">
                                <label>Imagen (Opcional):</label>
                                <input type="file" id="input-imagen" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />
                                <small>Formatos permitidos: JPG, PNG.</small>
                            </div>
                            <button type="submit" className="btn-submit-panel" disabled={cargandoPub}>{cargandoPub ? 'Publicando...' : 'Publicar Noticia'}</button>
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
                                <label>Foto de Portada (Hero):</label>
                                <input type="file" onChange={(e) => setFotoHero(e.target.files[0])} required />
                            </div>
                            <button type="submit" className="btn-submit-panel">Actualizar Portada</button>
                            {mensajeConfig && <p className="mensaje-respuesta">{mensajeConfig}</p>}
                        </form>
                    </div>
                )}

                {vistaActual === 'actas' && (
                    <div className="vista-contenido">
                        <h2>📝 Registro Legal de Actas</h2>
                        <form onSubmit={handleSubirActa} className="formulario-panel">
                            <div className="form-grupo">
                                <label>Identificador del Acta:</label>
                                <input type="text" value={tituloActa} onChange={(e) => setTituloActa(e.target.value)} required placeholder="Ej: Acta Ordinaria #45 - Marzo" />
                            </div>
                            <div className="form-grupo">
                                <label>Documento Escaneado (PDF/Imagen):</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input type="file" id="input-archivo-acta" accept=".pdf, image/*" onChange={(e) => setArchivoActa(e.target.files[0])} required={!archivoActa} />
                                    {archivoActa && (
                                        <button type="button" className="btn-accion btn-amarillo" onClick={() => {setArchivoActa(null); document.getElementById('input-archivo-acta').value = '';}}>
                                            ❌ Quitar Archivo
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button type="submit" className="btn-submit-panel" disabled={cargandoActa}>{cargandoActa ? 'Procesando...' : 'Publicar Acta'}</button>
                            {mensajeActa && <p className="mensaje-respuesta">{mensajeActa}</p>}
                        </form>

                        <hr style={{ margin: '40px 0', borderColor: '#eee' }} />
                        
                        <h3>Log de Auditoría</h3>
                        <div className="tabla-responsiva">
                            <table className="tabla-panel">
                                <thead>
                                    <tr>
                                        <th>Documento Registrado</th>
                                        <th>Fecha y Hora (Sistema)</th>
                                        <th>Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaActas.map((a) => (
                                        <tr key={a._id}>
                                            <td style={{ fontWeight: 'bold' }}>{a.titulo}</td>
                                            <td>{new Date(a.createdAt).toLocaleString()}</td>
                                            <td>
                                                <a href={a.archivoUrl} target="_blank" rel="noopener noreferrer" className="btn-accion btn-verde">Ver PDF</a>
                                                <button onClick={() => handleEliminarActa(a._id)} className="btn-accion btn-rojo">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {listaActas.length === 0 && (
                                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay actas en el sistema.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {vistaActual === 'usuarios' && (
                    <div className="vista-contenido">
                        <h2>Gestión de Junta Directiva</h2>
                        <form onSubmit={handleSubirMiembro} className="formulario-panel">
                            <div className="form-grupo">
                                <label>Nombre Completo:</label>
                                <input type="text" value={nombreMiembro} onChange={(e) => setNombreMiembro(e.target.value)} required placeholder="Ej: Juan Pérez" />
                            </div>
                            <div className="form-grupo">
                                <label>Puesto o Cargo:</label>
                                <input type="text" value={puestoMiembro} onChange={(e) => setPuestoMiembro(e.target.value)} required placeholder="Ej: Presidente" />
                            </div>
                            <div className="form-grupo">
                                <label>Orden de aparición:</label>
                                <input type="number" value={ordenMiembro} onChange={(e) => setOrdenMiembro(e.target.value)} required placeholder="1 = Primero" />
                            </div>
                            <div className="form-grupo">
                                <label>Fotografía Formal:</label>
                                <input type="file" id="input-foto-miembro" accept="image/*" onChange={(e) => setFotoMiembro(e.target.files[0])} required />
                            </div>
                            <button type="submit" className="btn-submit-panel" disabled={cargandoMiembro}>{cargandoMiembro ? 'Guardando...' : 'Añadir Directivo'}</button>
                            {mensajeMiembro && <p className="mensaje-respuesta">{mensajeMiembro}</p>}
                        </form>

                        <hr style={{ margin: '40px 0', borderColor: '#eee' }} />
                        
                        <h3>Mantenimiento de Directivos</h3>
                        <div className="tabla-responsiva">
                            <table className="tabla-panel">
                                <thead>
                                    <tr>
                                        <th>Orden</th>
                                        <th>Nombre</th>
                                        <th>Puesto</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaMiembros.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>No hay miembros registrados.</td></tr>
                                    ) : (
                                        listaMiembros.map((m) => (
                                            <tr key={m._id}>
                                                <td>{m.orden}</td>
                                                <td style={{ fontWeight: 'bold' }}>{m.nombre}</td>
                                                <td>{m.puesto}</td>
                                                <td>
                                                    <button onClick={() => handleEliminarMiembro(m._id)} className="btn-accion btn-rojo">Eliminar</button>
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