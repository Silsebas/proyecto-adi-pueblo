import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    // Estados principales
    const [publicaciones, setPublicaciones] = useState([]);
    const [acuerdos, setAcuerdos] = useState([]); 
    const [config, setConfig] = useState({ fotoHero: '' });
    const [miembros, setMiembros] = useState([]); 
    const [cargando, setCargando] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 🚨 NUEVOS ESTADOS: Talleres, Paginación e Inscripción 🚨
    const [talleres, setTalleres] = useState([]); // Ahora los talleres vienen de la BD
    const [visibleAcuerdos, setVisibleAcuerdos] = useState(6);
    const [visibleMiembros, setVisibleMiembros] = useState(6);
    
    // Estados para la Ventana de Inscripción (Modal)
    const [tallerSeleccionado, setTallerSeleccionado] = useState(null);
    const [datosInscripcion, setDatosInscripcion] = useState({ nombreCompleto: '', telefono: '', cedula: '' });
    const [mensajeInscripcion, setMensajeInscripcion] = useState('');
    const [cargandoInscripcion, setCargandoInscripcion] = useState(false);

    // 🚨 NUEVOS ESTADOS: PADRÓN COMUNAL 🚨
    const [censoModal, setCensoModal] = useState(false);
    const [datosCenso, setDatosCenso] = useState({ 
        tipoIdentificacion: '1', 
        identificacion: '', 
        nombreCompleto: '', 
        nacionalidad: '',
        fechaNacimiento: '',
        edad: ''
    });
    const [modoManualCenso, setModoManualCenso] = useState(false);
    const [cargandoConsulta, setCargandoConsulta] = useState(false);
    const [mensajeCenso, setMensajeCenso] = useState('');
    const [cargandoCenso, setCargandoCenso] = useState(false);

    // Carga de datos iniciales
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsLoggedIn(true);

        const obtenerDatos = async () => {
            try {
                // 🚨 Se añade la petición de los Talleres al Promise.all
                const [resNoticias, resAcuerdos, resConfig, resMiembros, resTalleres] = await Promise.all([
                    fetch('http://localhost:4000/api/publicaciones'),
                    fetch('http://localhost:4000/api/acuerdos'),
                    fetch('http://localhost:4000/api/configuracion'),
                    fetch('http://localhost:4000/api/miembros'),
                    fetch('http://localhost:4000/api/talleres')
                ]);

                const dataNoticias = await resNoticias.json();
                setPublicaciones(dataNoticias);

                if (resAcuerdos.ok) {
                    const dataAcuerdos = await resAcuerdos.json();
                    setAcuerdos(dataAcuerdos);
                }

                if (resConfig.ok) {
                    const dataConfig = await resConfig.json();
                    if (dataConfig.fotoHero) setConfig(dataConfig);
                }

                if (resMiembros.ok) {
                    const dataMiembros = await resMiembros.json();
                    setMiembros(dataMiembros);
                }

                if (resTalleres.ok) {
                    const dataTalleres = await resTalleres.json();
                    setTalleres(dataTalleres);
                }

                setCargando(false);
            } catch (error) {
                console.error("Error cargando datos:", error);
                setCargando(false);
            }
        };

        obtenerDatos();
    }, []);

    const formatearFecha = (fechaMongo) => {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaMongo).toLocaleDateString('es-CR', { ...opciones, timeZone: 'UTC' });
    };

    // 🚨 NUEVO: Controlador para enviar la inscripción al backend
    const handleInscripcionSubmit = async (e) => {
        e.preventDefault();
        setCargandoInscripcion(true);
        setMensajeInscripcion('');
        try {
            const res = await fetch('http://localhost:4000/api/talleres/inscribir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taller: tallerSeleccionado._id,
                    nombreCompleto: datosInscripcion.nombreCompleto,
                    telefono: datosInscripcion.telefono,
                    cedula: datosInscripcion.cedula
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMensajeInscripcion('✅ ' + data.msg);
                setTimeout(() => {
                    setTallerSeleccionado(null); // Cierra la ventana tras 2.5 segundos
                    setMensajeInscripcion('');
                }, 2500);
            } else {
                setMensajeInscripcion('❌ Hubo un error al inscribir.');
            }
        } catch (error) {
            setMensajeInscripcion('❌ Error de conexión al servidor.');
        } finally {
            setCargandoInscripcion(false);
        }
    };

    // 🚨 NUEVAS FUNCIONES: Lógica del Padrón Comunal 🚨
    const handleFechaNacimientoCenso = (e) => {
        const fechaStr = e.target.value;
        setDatosCenso(prev => ({ ...prev, fechaNacimiento: fechaStr }));
        
        if (fechaStr) {
            const hoy = new Date();
            const nacimiento = new Date(fechaStr);
            let edadCalc = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                edadCalc--;
            }
            setDatosCenso(prev => ({ ...prev, edad: edadCalc }));
        } else {
            setDatosCenso(prev => ({ ...prev, edad: '' }));
        }
    };

    const buscarCedulaTSE = async () => {
        if (!datosCenso.identificacion || datosCenso.tipoIdentificacion !== '1') return;
        
        setCargandoConsulta(true);
        setMensajeCenso('');
        
        try {
            const res = await fetch(`https://apis.gometa.org/cedulas/${datosCenso.identificacion}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.nombre) {
                    setDatosCenso(prev => ({
                        ...prev,
                        nombreCompleto: data.nombre,
                        nacionalidad: 'Costarricense'
                    }));
                    setModoManualCenso(false); 
                    setMensajeCenso('✅ Cédula verificada');
                } else {
                    setModoManualCenso(true);
                    setMensajeCenso('⚠️ Cédula no encontrada. Por favor ingrese sus datos manualmente.');
                }
            } else {
                setModoManualCenso(true);
                setMensajeCenso('⚠️ Servicio inactivo. Ingrese sus datos manualmente.');
            }
        } catch (error) {
            setModoManualCenso(true);
            setMensajeCenso('⚠️ Sin conexión. Ingrese sus datos manualmente.');
        } finally {
            setCargandoConsulta(false);
        }
    };

    const handleTipoIdCenso = (e) => {
        const nuevoTipo = e.target.value;
        setDatosCenso({ ...datosCenso, tipoIdentificacion: nuevoTipo, identificacion: '', nombreCompleto: '', nacionalidad: '' });
        setMensajeCenso('');
        setModoManualCenso(nuevoTipo !== '1'); 
    };

    const handleRegistrarCenso = async (e) => {
        e.preventDefault();
        setCargandoCenso(true);
        setMensajeCenso('');
        try {
            const res = await fetch('http://localhost:4000/api/habitantes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosCenso)
            });
            const data = await res.json();
            if (res.ok) {
                setMensajeCenso('✅ ' + data.msg);
                setTimeout(() => {
                    setCensoModal(false); 
                    setMensajeCenso('');
                    setDatosCenso({ tipoIdentificacion: '1', identificacion: '', nombreCompleto: '', nacionalidad: '', fechaNacimiento: '', edad: '' });
                }, 2500);
            } else {
                setMensajeCenso(`❌ ${data.msg || 'Hubo un error al registrar.'}`);
            }
        } catch (error) {
            setMensajeCenso('❌ Error de conexión al servidor.');
        } finally {
            setCargandoCenso(false);
        }
    };

    return (
        <div className="home-container">
            {/* Navegación Principal */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="logo-placeholder">ADI</div> 
                    <span className="brand-text">Desarrollo Integral</span>
                </div>
                
                {isLoggedIn ? (
                    <Link to="/dashboard" className="btn-junta">⚙️ Administrar Sitio</Link>
                ) : (
                    <Link to="/login" className="btn-junta">Acceso Junta Directiva</Link>
                )}
            </nav>

            {/* Sección de Portada (Hero) */}
            <header className="hero-section">
                <div className="hero-image-container">
                    {config.fotoHero ? (
                        <img src={config.fotoHero} alt="Portada Comunidad" className="hero-image-viva" />
                    ) : (
                        <div className="hero-image-placeholder">
                            <span>Espacio para imagen de portada</span>
                        </div>
                    )}
                </div>
                
                <div className="hero-content">
                    <span className="sub-title">IMPULSANDO NUESTRA COMUNIDAD</span>
                    <h1>Transformando Comunidades a través del Desarrollo Integral</h1>
                    <p>Promoviendo la colaboración comunitaria, el crecimiento social y económico para mejorar la calidad de vida de nuestros ciudadanos.</p>
                    <div className="hero-buttons">
                        <button className="btn-outline">Contáctenos</button>
                        {/* 🚨 BOTÓN PARA ABRIR EL PADRÓN COMUNAL (SIN EMOJI Y EN VERDE) */}
                        <button className="btn-primary" onClick={() => setCensoModal(true)}>Padrón Comunal</button>
                    </div>
                </div>
            </header>

            {/* Sección de Talleres y Servicios (Fondo Blanco) */}
            <section className="servicios-section">
                <h2>Talleres y Servicios</h2>
                {talleres.length === 0 && !cargando && <p className="mensaje-vacio">No hay talleres disponibles en este momento.</p>}
                <div className="grid-servicios">
                    {/* 🚨 Se dibuja usando los talleres reales de la BD */}
                    {talleres.map(taller => (
                        <div key={taller._id} className="tarjeta-servicio">
                            <div className="icono-servicio">{taller.icono}</div>
                            <h3>{taller.titulo}</h3>
                            <p>{taller.descripcion}</p>
                            {/* Al dar clic, se abre el modal con los datos de este taller */}
                            <button className="btn-taller-mas" onClick={() => {
                                setTallerSeleccionado(taller);
                                setDatosInscripcion({ nombreCompleto: '', telefono: '', cedula: '' });
                            }}>
                                Inscribirse a Taller
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sección de Noticias y Publicaciones (Fondo Gris) */}
            <main className="noticias-section alternate-bg">
                <h2>Últimas Noticias y Publicaciones</h2>
                {cargando ? (
                    <p className="mensaje-carga">Cargando información del servidor...</p>
                ) : publicaciones.length === 0 ? (
                    <p className="mensaje-vacio">No hay publicaciones recientes. Vuelve pronto.</p>
                ) : (
                    <div className="grid-noticias">
                        {publicaciones.map(publi => (
                            <article key={publi._id} className="tarjeta-noticia">
                                {publi.imagen && (
                                    <img src={publi.imagen} alt={publi.titulo} className="imagen-noticia" />
                                )}

                                <div className="tarjeta-contenido">
                                    <span className="fecha-noticia">{formatearFecha(publi.createdAt)}</span>
                                    <h3 className="titulo-noticia">{publi.titulo}</h3>
                                    <p className="texto-noticia">{publi.contenido}</p>
                                </div>
                                <div className="tarjeta-footer">
                                    <span className="autor-noticia">Autor: {publi.autor?.nombre || 'Junta Directiva'}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* SECCIÓN TRANSPARENCIA (Fondo Blanco) */}
            <section className="transparencia-section">
                <h2>Transparencia: Acuerdos de Junta</h2>
                {cargando ? (
                    <p className="mensaje-carga">Sincronizando acuerdos legales...</p>
                ) : acuerdos.length === 0 ? (
                    <p className="mensaje-vacio">Aún no hay acuerdos publicados por la secretaría.</p>
                ) : (
                    <>
                        <div className="grid-acuerdos">
                            {/* 🚨 Se limita la lista a la cantidad de "visibleAcuerdos" (Empieza en 6) */}
                            {acuerdos.slice(0, visibleAcuerdos).map(acuerdo => (
                                <div key={acuerdo._id} className="tarjeta-acuerdo">
                                    <div className="acuerdo-header">
                                        <div className="acuerdo-fecha">
                                            <span className="icono-calendario">📅</span>
                                            {formatearFecha(acuerdo.fechaAcuerdo)}
                                        </div>
                                    </div>
                                    <h3 className="acuerdo-titulo">{acuerdo.titulo}</h3>
                                    <ul className="acuerdo-lista">
                                        {acuerdo.puntos.map((punto, idx) => (
                                            <li key={idx}>{punto}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        {/* 🚨 Botón para cargar más si aún hay elementos ocultos */}
                        {visibleAcuerdos < acuerdos.length && (
                            <button className="btn-cargar-mas" onClick={() => setVisibleAcuerdos(prev => prev + 6)}>
                                Ver Acuerdos Anteriores 👇
                            </button>
                        )}
                    </>
                )}
            </section>

            {/* Sección de Junta Directiva (Fondo Gris) */}
            <section className="junta-section alternate-bg">
                <h2>Conozca a su Junta Directiva</h2>
                    <div className="grid-junta" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {miembros.length === 0 ? (
                                <p className="mensaje-vacio">La información de la junta se actualizará pronto.</p>
                            ) : (
                                /* 🚨 Se limita la lista a "visibleMiembros" */
                                miembros.slice(0, visibleMiembros).map((m) => (
                                    <div key={m._id} className="tarjeta-miembro" style={{ textAlign: 'center' }}>
                                        <img 
                                            src={m.foto} 
                                            alt={m.nombre} 
                                            className="foto-miembro" 
                                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + m.nombre + '&background=28a745&color=fff&size=150'; }}
                                        />
                                        <h4>{m.nombre}</h4>
                                        <p style={{ color: '#495057' }}>{m.puesto}</p>
                                    </div>
                                ))
                            )}
                    </div>
                    {/* 🚨 Botón para cargar más miembros */}
                    {visibleMiembros < miembros.length && (
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button className="btn-cargar-mas" onClick={() => setVisibleMiembros(prev => prev + 6)}>
                                Conocer a más miembros 👇
                            </button>
                        </div>
                    )}
            </section>

            {/* 🚨 VENTANA FLOTANTE DE INSCRIPCIÓN A TALLERES (MODAL) 🚨 */}
            {tallerSeleccionado && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-cerrar" onClick={() => setTallerSeleccionado(null)}>✖</button>
                        <h3 style={{ color: 'var(--color-primary)', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                            {tallerSeleccionado.icono} Inscripción a Taller
                        </h3>
                        <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>{tallerSeleccionado.titulo}</p>
                        
                        <form onSubmit={handleInscripcionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre Completo:</label>
                                <input type="text" value={datosInscripcion.nombreCompleto} onChange={(e) => setDatosInscripcion({...datosInscripcion, nombreCompleto: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="Ej: Juan Pérez" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teléfono / WhatsApp:</label>
                                <input type="text" value={datosInscripcion.telefono} onChange={(e) => setDatosInscripcion({...datosInscripcion, telefono: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="Ej: 8888-8888" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cédula (Opcional):</label>
                                <input type="text" value={datosInscripcion.cedula} onChange={(e) => setDatosInscripcion({...datosInscripcion, cedula: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="0-0000-0000" />
                            </div>
                            
                            <button type="submit" disabled={cargandoInscripcion} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                                {cargandoInscripcion ? 'Enviando solicitud...' : 'Confirmar Inscripción'}
                            </button>
                            {mensajeInscripcion && <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>{mensajeInscripcion}</p>}
                        </form>
                    </div>
                </div>
            )}

            {/* 🚨 NUEVA VENTANA FLOTANTE DEL PADRÓN COMUNAL (MODAL) 🚨 */}
            {censoModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <button className="modal-cerrar" onClick={() => setCensoModal(false)}>✖</button>
                        <h3 style={{ color: 'var(--color-primary)', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                            📊 Registro Padrón Comunal
                        </h3>
                        <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>Control de Habitantes</p>
                        
                        <form onSubmit={handleRegistrarCenso} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: '1' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Tipo ID:</label>
                                    <select value={datosCenso.tipoIdentificacion} onChange={handleTipoIdCenso} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                        <option value="1">1 - Nacional</option>
                                        <option value="2">2 - Inmigrante (DIMEX)</option>
                                        <option value="3">3 - Extranjero</option>
                                    </select>
                                </div>
                                <div style={{ flex: '2' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Número:</label>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input type="text" value={datosCenso.identificacion} onChange={(e) => setDatosCenso({...datosCenso, identificacion: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                        {datosCenso.tipoIdentificacion === '1' && (
                                            <button type="button" onClick={buscarCedulaTSE} disabled={cargandoConsulta} style={{ padding: '0 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                                {cargandoConsulta ? '...' : 'Buscar'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Nombre Completo:</label>
                                <input type="text" value={datosCenso.nombreCompleto} onChange={(e) => setDatosCenso({...datosCenso, nombreCompleto: e.target.value})} required readOnly={!modoManualCenso} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: !modoManualCenso ? '#e9ecef' : 'white' }} placeholder="Nombre y apellidos" />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: '1' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Nacionalidad:</label>
                                    <input type="text" value={datosCenso.nacionalidad} onChange={(e) => setDatosCenso({...datosCenso, nacionalidad: e.target.value})} required readOnly={!modoManualCenso} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: !modoManualCenso ? '#e9ecef' : 'white' }} placeholder="Ej: Costarricense" />
                                </div>
                            </div>

                            {/* 🚨 CORRECCIÓN ESTRUCTURA FLEX: FECHA Y EDAD JUNTAS SIEMPRE 🚨 */}
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap' }}>
                                <div style={{ flex: '1', minWidth: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Fecha Nacimiento:</label>
                                    <input type="date" value={datosCenso.fechaNacimiento} onChange={handleFechaNacimientoCenso} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ width: '80px', flexShrink: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Edad:</label>
                                    <input type="number" value={datosCenso.edad} readOnly style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: '#e9ecef', textAlign: 'center' }} />
                                </div>
                            </div>
                            
                            <button type="submit" disabled={cargandoCenso} style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                                {cargandoCenso ? 'Procesando...' : 'Registrar Habitante'}
                            </button>
                            {mensajeCenso && <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '10px', color: mensajeCenso.includes('❌') || mensajeCenso.includes('⚠️') ? '#dc3545' : '#28a745' }}>{mensajeCenso}</p>}
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;