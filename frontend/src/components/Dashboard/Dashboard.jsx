import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';
import * as XLSX from 'xlsx';

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
    // ESTADOS: MÓDULO DE ACTAS Y ACUERDOS
    // ==========================================
    const [subVistaActas, setSubVistaActas] = useState('pdfs'); 
    const [tituloActa, setTituloActa] = useState('');
    const [archivoActa, setArchivoActa] = useState(null);
    const [mensajeActa, setMensajeActa] = useState('');
    const [cargandoActa, setCargandoActa] = useState(false);
    const [listaActas, setListaActas] = useState([]);
    const [actaEnEdicion, setActaEnEdicion] = useState(null);

    const [tituloAcuerdo, setTituloAcuerdo] = useState('');
    const [fechaAcuerdo, setFechaAcuerdo] = useState('');
    const [puntosAcuerdo, setPuntosAcuerdo] = useState('');
    const [mensajeAcuerdo, setMensajeAcuerdo] = useState('');
    const [cargandoAcuerdo, setCargandoAcuerdo] = useState(false);
    const [listaAcuerdos, setListaAcuerdos] = useState([]);

    // ==========================================
    // 🚨 ESTADOS PARA TALLERES E INSCRIPCIONES
    // ==========================================
    const [tituloTaller, setTituloTaller] = useState('');
    const [descripcionTaller, setDescripcionTaller] = useState('');
    const [iconoTaller, setIconoTaller] = useState('🎓');
    const [mensajeTaller, setMensajeTaller] = useState('');
    const [cargandoTaller, setCargandoTaller] = useState(false);
    
    const [listaTalleres, setListaTalleres] = useState([]);
    const [listaInscripciones, setListaInscripciones] = useState([]);

    // ==========================================
    // 🚨 NUEVOS ESTADOS: PADRÓN COMUNAL
    // ==========================================
    const [listaPadron, setListaPadron] = useState([]);
    const [mensajePadron, setMensajePadron] = useState('');
    // ==========================================
    // 🚨 NUEVOS ESTADOS: CUENTAS DE ACCESO
    // ==========================================
    const [nombreCuenta, setNombreCuenta] = useState('');
    const [emailCuenta, setEmailCuenta] = useState('');
    const [rolCuenta, setRolCuenta] = useState('admin');
    const [listaCuentas, setListaCuentas] = useState([]);
    const [mensajeCuentas, setMensajeCuentas] = useState('');
    const [cargandoCuentas, setCargandoCuentas] = useState(false);

    // ==========================================
    // 🚨 NUEVOS ESTADOS: FILTROS Y BÚSQUEDA
    // ==========================================
    const [busquedaPadron, setBusquedaPadron] = useState('');

    // --- LÓGICA DE FILTRADO (Se calcula en tiempo real) ---
    const padronFiltrado = listaPadron.filter(habitante => 
        habitante.identificacion.includes(busquedaPadron) ||
        habitante.nombreCompleto.toLowerCase().includes(busquedaPadron.toLowerCase()) ||
        habitante.nacionalidad.toLowerCase().includes(busquedaPadron.toLowerCase())
    );

    // --- FUNCIÓN MAESTRA PARA EXPORTAR A EXCEL REAL (.XLSX) ---
    const exportarAExcel = (datosParaExportar, nombreArchivo) => {
        // 1. Convertir el arreglo de datos JSON a una hoja de cálculo
        const hoja = XLSX.utils.json_to_sheet(datosParaExportar);

        // 2. Crear un libro de Excel virtual
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Datos");

        // 3. Ajustar el ancho de las columnas automáticamente (Opcional pero se ve muy pro)
        const anchos = Object.keys(datosParaExportar[0]).map(key => ({ wch: Math.max(key.length, 20) }));
        hoja['!cols'] = anchos;

        // 4. Descargar el archivo con formato real .xlsx
        XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
    };

    const handleExportarPadron = () => {
        if (padronFiltrado.length === 0) return alert("No hay datos para exportar.");
        
        const datosFormateados = padronFiltrado.map(h => ({
            "Fecha de Registro": new Date(h.createdAt).toLocaleDateString(),
            "Tipo ID": h.tipoIdentificacion === '1' ? 'Nacional' : h.tipoIdentificacion === '2' ? 'DIMEX' : 'Pasaporte',
            "Identificación": h.identificacion,
            "Nombre Completo": h.nombreCompleto.toUpperCase(),
            "Nacionalidad": h.nacionalidad,
            "Edad": h.edad
        }));

        exportarAExcel(datosFormateados, "Padron_Comunal_ADI");
    };

    const handleExportarTaller = (taller, inscritos) => {
        if (inscritos.length === 0) return alert("No hay personas inscritas para descargar.");

        const datosFormateados = inscritos.map(i => ({
            "Fecha de Inscripción": new Date(i.createdAt).toLocaleDateString(),
            "Nombre Completo": i.nombreCompleto.toUpperCase(),
            "Teléfono de Contacto": i.telefono,
            "Cédula": i.cedula || 'No proporcionada'
        }));

        exportarAExcel(datosFormateados, `Inscritos_Taller_${taller.titulo.replace(/\s+/g, '_')}`);
    };

    // ==========================================
    // LÓGICA GLOBAL DE SEGURIDAD (Cierre automático)
    // ==========================================
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/'); 
    };

    const verificarExpiracion = (res) => {
        if (res.status === 401 || res.status === 403) {
            alert("⏳ Por seguridad, tu sesión ha expirado tras 15 minutos de inactividad.\n\nSerás redirigido a la pantalla principal.");
            handleLogout();
            return true; 
        }
        return false; 
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
            const res = await fetch('https://adi-santa-rita.onrender.com/api/actas');
            setListaActas(await res.json());
        } catch (error) { console.error("Error al cargar actas", error); }
    };

    const cargarListaAcuerdos = async () => {
        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/acuerdos');
            setListaAcuerdos(await res.json());
        } catch (error) { console.error("Error al cargar acuerdos", error); }
    };

    const cargarListaMiembros = async () => {
        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/miembros');
            setListaMiembros(await res.json());
        } catch (error) { console.error("Error al cargar miembros", error); }
    };

    const cargarTalleresEInscripciones = async () => {
        try {
            // 1. Traer los talleres públicos
            const resT = await fetch('https://adi-santa-rita.onrender.com/api/talleres');
            setListaTalleres(await resT.json());

            // 2. Traer las inscripciones privadas (Requiere token)
            const resI = await fetch('https://adi-santa-rita.onrender.com/api/talleres/inscripciones/listado', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (resI.ok) {
                setListaInscripciones(await resI.json());
            } else if (verificarExpiracion(resI)) return;

        } catch (error) { console.error("Error al cargar talleres", error); }
    };

    // 🚨 NUEVO: Sincronizar el Padrón Comunal
 const cargarPadronComunal = async () => {
        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/habitantes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                setListaPadron(await res.json());
            } else if (verificarExpiracion(res)) return;
        } catch (error) { console.error("Error al cargar el padrón", error); }
    };

    // 🚨 NUEVO: Cargar Cuentas del Sistema
    const cargarCuentasSistema = async () => {
        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/usuarios/usuarios', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                setListaCuentas(await res.json());
            } else if (verificarExpiracion(res)) return;
        } catch (error) { console.error("Error al cargar cuentas", error); }
    };

    useEffect(() => {
        if (vistaActual === 'actas') { cargarListaActas(); cargarListaAcuerdos(); }
        if (vistaActual === 'usuarios') cargarListaMiembros();
        if (vistaActual === 'talleres') cargarTalleresEInscripciones();
        if (vistaActual === 'padron') cargarPadronComunal(); 
        if (vistaActual === 'cuentas') cargarCuentasSistema(); // 🚨 Carga cuentas al abrir pestaña
    }, [vistaActual]);


    // ==========================================
    // CONTROLADORES DE EVENTOS (HANDLERS)
    // ==========================================
    
    const handleSubirNoticia = async (e) => {
        e.preventDefault();
        setCargandoPub(true);
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('contenido', contenido);
        if (imagen) formData.append('imagen', imagen);

        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/publicaciones', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (verificarExpiracion(res)) return; 
            
            if (res.status === 400) {
                const errorData = await res.json();
                setMensajePub(`⚠️ ${errorData.msg}`);
            } else if (res.ok) {
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
            const res = await fetch('https://adi-santa-rita.onrender.com/api/configuracion/hero', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (verificarExpiracion(res)) return; 
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
            const res = await fetch('https://adi-santa-rita.onrender.com/api/miembros', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (verificarExpiracion(res)) return; 
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
            const res = await fetch(`https://adi-santa-rita.onrender.com/api/miembros/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (verificarExpiracion(res)) return; 
            if (res.ok) {
                cargarListaMiembros(); 
                setMensajeMiembro('🗑️ Miembro eliminado.');
            }
        } catch (error) { setMensajeMiembro('❌ Error al eliminar.'); }
    };

    // --- MÓDULO DE ACTAS Y ACUERDOS ---
    const handleSubirActa = async (e) => {
        e.preventDefault();
        setCargandoActa(true);
        const formData = new FormData();
        formData.append('titulo', tituloActa);
        if (archivoActa) formData.append('archivo', archivoActa);

        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/actas', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (verificarExpiracion(res)) return; 
            if (res.ok) {
                setMensajeActa('✅ Acta publicada legalmente.');
                setTituloActa(''); setArchivoActa(null);
                document.getElementById('input-archivo-acta').value = ''; 
                cargarListaActas();
            } else { setMensajeActa('❌ Error al guardar acta'); }
        } catch (error) { setMensajeActa('❌ Error de conexión.'); } 
        finally { setCargandoActa(false); }
    };

    const handleActualizarArchivo = async (e) => {
        e.preventDefault();
        if (!archivoActa) return setMensajeActa('❌ Debes seleccionar el nuevo archivo PDF.');
        setCargandoActa(true);
        const formData = new FormData();
        formData.append('archivo', archivoActa);

        try {
            const res = await fetch(`https://adi-santa-rita.onrender.com/api/actas/${actaEnEdicion._id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            if (verificarExpiracion(res)) return;
            if (res.ok) {
                setMensajeActa('✅ Archivo actualizado y guardado en el historial.');
                setActaEnEdicion(null); setArchivoActa(null);
                document.getElementById('input-archivo-acta').value = ''; 
                cargarListaActas();
            } else { setMensajeActa('❌ Error al actualizar el acta'); }
        } catch (error) { setMensajeActa('❌ Error de conexión.'); }
        finally { setCargandoActa(false); }
    };

    const handleEliminarActa = async (id) => {
        if (!window.confirm("¿Confirmas que deseas enviar esta acta al registro de eliminados?")) return;
        try {
            const res = await fetch(`https://adi-santa-rita.onrender.com/api/actas/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (verificarExpiracion(res)) return; 
            if (res.ok) { cargarListaActas(); setMensajeActa('🗑️ Acta movida al historial de eliminados.'); }
        } catch (error) { setMensajeActa('❌ Error al eliminar.'); }
    };

    const handleSubirAcuerdo = async (e) => {
        e.preventDefault();
        setCargandoAcuerdo(true);
        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/acuerdos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ titulo: tituloAcuerdo, fechaAcuerdo, puntos: puntosAcuerdo })
            });
            if (verificarExpiracion(res)) return;
            if (res.ok) {
                setMensajeAcuerdo('✅ Acuerdo publicado para los vecinos.');
                setTituloAcuerdo(''); setFechaAcuerdo(''); setPuntosAcuerdo('');
                cargarListaAcuerdos();
            } else { setMensajeAcuerdo('❌ Error al publicar acuerdo'); }
        } catch (error) { setMensajeAcuerdo('❌ Error de conexión.'); }
        finally { setCargandoAcuerdo(false); }
    };

    const handleEliminarAcuerdo = async (id) => {
        if (!window.confirm("¿Seguro de quitar este acuerdo de la vista pública?")) return;
        try {
            const res = await fetch(`https://adi-santa-rita.onrender.com/api/acuerdos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (verificarExpiracion(res)) return;
            if (res.ok) { cargarListaAcuerdos(); setMensajeAcuerdo('🗑️ Acuerdo eliminado.'); }
        } catch (error) { setMensajeAcuerdo('❌ Error al eliminar.'); }
    };

    const handleSubirTaller = async (e) => {
        e.preventDefault();
        setCargandoTaller(true);
        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/talleres', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ titulo: tituloTaller, descripcion: descripcionTaller, icono: iconoTaller })
            });
            if (verificarExpiracion(res)) return;
            
            if (res.status === 400) {
                const errorData = await res.json();
                setMensajeTaller(`⚠️ ${errorData.msg}`);
            } else if (res.ok) {
                setMensajeTaller('✅ Taller habilitado para inscripciones.');
                setTituloTaller(''); setDescripcionTaller(''); setIconoTaller('🎓');
                cargarTalleresEInscripciones();
            } else { setMensajeTaller('❌ Error al publicar el taller'); }
        } catch (error) { setMensajeTaller('❌ Error de conexión.'); }
        finally { setCargandoTaller(false); }
    };

    const handleEliminarTaller = async (id) => {
        if (!window.confirm("¿Seguro? Se eliminará el taller y todas las inscripciones asociadas a él.")) return;
        try {
            const res = await fetch(`https://adi-santa-rita.onrender.com/api/talleres/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (verificarExpiracion(res)) return;
            if (res.ok) { cargarTalleresEInscripciones(); setMensajeTaller('🗑️ Taller e inscripciones eliminadas.'); }
        } catch (error) { setMensajeTaller('❌ Error al eliminar.'); }
    };

    // 🚨 NUEVO: Dar de baja a un ciudadano
    const handleEliminarHabitante = async (id) => {
        if (!window.confirm("¿Confirmas que deseas dar de baja a esta persona del padrón comunal (mudanza/fallecimiento)?")) return;
        try {
            const res = await fetch(`https://adi-santa-rita.onrender.com/api/habitantes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (verificarExpiracion(res)) return;
            if (res.ok) {
                cargarPadronComunal();
                setMensajePadron('🗑️ Ciudadano removido del padrón.');
            } else {
                setMensajePadron('❌ Error al dar de baja.');
            }
        } catch (error) { setMensajePadron('❌ Error de conexión.'); }
    };
    
// 🚨 NUEVOS HANDLERS: CUENTAS DE ACCESO
    const handleInvitarCuenta = async (e) => {
        e.preventDefault();
        setCargandoCuentas(true);
        try {
            const res = await fetch('https://adi-santa-rita.onrender.com/api/usuarios/invitar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ nombre: nombreCuenta, email: emailCuenta, role: rolCuenta })
            });
            const data = await res.json();
            if (verificarExpiracion(res)) return;
            
            if (res.ok) {
                setMensajeCuentas('✅ Invitación enviada al correo.');
                setNombreCuenta(''); setEmailCuenta(''); setRolCuenta('admin');
                cargarCuentasSistema();
            } else {
                setMensajeCuentas(`❌ ${data.msg || 'Error al invitar'}`);
            }
        } catch (error) { setMensajeCuentas('❌ Error de conexión.'); }
        finally { setCargandoCuentas(false); }
    };

    const handleEliminarCuenta = async (id) => {
        if (!window.confirm("¿Seguro de revocar el acceso a este usuario? Ya no podrá entrar al panel.")) return;
        try {
            const res = await fetch(`https://adi-santa-rita.onrender.com/api/usuarios/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (verificarExpiracion(res)) return;
            
            if (res.ok) {
                cargarCuentasSistema();
                setMensajeCuentas('🗑️ Acceso revocado exitosamente.');
            } else {
                setMensajeCuentas(`❌ ${data.msg || 'Error al eliminar'}`);
            }
        } catch (error) { setMensajeCuentas('❌ Error de conexión.'); }
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
                    
                    {/* 🚨 NUEVO BOTÓN PARA EL PADRÓN COMUNAL */}
                    <button className={vistaActual === 'padron' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('padron')}>📊 Padrón Comunal</button>
                    
                    {(usuario.role === 'super_admin' || usuario.role === 'admin') && (
                        <>
                            <button className={vistaActual === 'cuentas' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('cuentas')}>🔐 Cuentas de Acceso</button>
                            <button className={vistaActual === 'talleres' ? 'nav-btn activo' : 'nav-btn'} onClick={() => setVistaActual('talleres')}>🛠️ Talleres e Inscritos</button>
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

                {/* 🚨 NUEVA SECCIÓN: PADRÓN COMUNAL 🚨 */}
                {vistaActual === 'padron' && (
                    <div className="vista-contenido">
                        <h2>Gestión del Padrón Comunal</h2>
                        
                        {/* 🚨 PANEL DE BÚSQUEDA Y EXPORTACIÓN */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', flexWrap: 'wrap', gap: '15px', border: '1px solid #dee2e6' }}>
                            <div style={{ flex: '1', minWidth: '250px' }}>
                                <input 
                                    type="text" 
                                    placeholder="🔍 Buscar por cédula, nombre o nacionalidad..." 
                                    value={busquedaPadron}
                                    onChange={(e) => setBusquedaPadron(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ced4da', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <p style={{ margin: 0, color: '#6c757d' }}>Mostrando: <strong>{padronFiltrado.length}</strong> de {listaPadron.length}</p>
                                <button onClick={handleExportarPadron} className="btn-accion" style={{ backgroundColor: '#198754', color: 'white', padding: '10px 15px', fontWeight: 'bold' }}>
                                    📥 Exportar Padrón a Excel
                                </button>
                            </div>
                        </div>

                        {mensajePadron && <p className="mensaje-respuesta">{mensajePadron}</p>}
                        
                        <div className="tabla-responsiva" style={{ marginTop: '20px' }}>
                            <table className="tabla-panel">
                                <thead>
                                    <tr>
                                        <th>Fecha Registro</th>
                                        <th>Identificación</th>
                                        <th>Nombre Completo</th>
                                        <th>Nacionalidad</th>
                                        <th>Edad</th>
                                        {/* Solo mostramos la columna de acción si el usuario tiene los permisos */}
                                        {(usuario.role === 'secretario' || usuario.role === 'presidente' || usuario.role === 'super_admin') && (
                                            <th>Acción</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {padronFiltrado.length === 0 ? (
                                        <tr>
                                            <td colSpan={(usuario.role === 'secretario' || usuario.role === 'presidente' || usuario.role === 'super_admin') ? "6" : "5"} style={{ textAlign: 'center' }}>
                                                Aún no hay habitantes empadronados.
                                            </td>
                                        </tr>
                                    ) : (
                                        padronFiltrado.map((habitante) => (
                                            <tr key={habitante._id}>
                                                <td>{new Date(habitante.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    {habitante.identificacion} <br/>
                                                    <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                                        {habitante.tipoIdentificacion === '1' ? 'Nacional' : habitante.tipoIdentificacion === '2' ? 'DIMEX' : 'Pasaporte'}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 'bold' }}>{habitante.nombreCompleto}</td>
                                                <td>{habitante.nacionalidad}</td>
                                                <td>{habitante.edad} años</td>
                                                
                                                {/* Botón de dar de baja protegido por rol */}
                                                {(usuario.role === 'secretario' || usuario.role === 'presidente' || usuario.role === 'super_admin') && (
                                                    <td>
                                                        <button onClick={() => handleEliminarHabitante(habitante._id)} className="btn-accion btn-rojo">Dar de baja</button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- DEMÁS PESTAÑAS EXISTENTES --- */}
                {vistaActual === 'talleres' && (
                    <div className="vista-contenido">
                        <h2>Crear Nuevo Taller o Curso</h2>
                        <form onSubmit={handleSubirTaller} className="formulario-panel">
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div className="form-grupo" style={{ flex: '0 0 100px' }}>
                                    <label>Ícono (Emoji):</label>
                                    <input type="text" value={iconoTaller} onChange={(e) => setIconoTaller(e.target.value)} required style={{ textAlign: 'center', fontSize: '1.5rem' }} />
                                </div>
                                <div className="form-grupo" style={{ flex: '1' }}>
                                    <label>Título del Taller:</label>
                                    <input type="text" value={tituloTaller} onChange={(e) => setTituloTaller(e.target.value)} required placeholder="Ej: Capacitación en Computación" />
                                </div>
                            </div>
                            <div className="form-grupo">
                                <label>Descripción breve:</label>
                                <textarea value={descripcionTaller} onChange={(e) => setDescripcionTaller(e.target.value)} required rows="3" placeholder="¿De qué trata este taller?"></textarea>
                            </div>
                            <button type="submit" className="btn-submit-panel" disabled={cargandoTaller}>{cargandoTaller ? 'Guardando...' : 'Publicar Taller'}</button>
                            {mensajeTaller && <p className="mensaje-respuesta">{mensajeTaller}</p>}
                        </form>

                        <hr style={{ margin: '40px 0', borderColor: '#eee' }} />

                        {/* LISTAS AGRUPADAS POR TALLER */}
                        <h2>Gestión de Inscripciones por Taller</h2>
                        <p>Total de talleres activos: {listaTalleres.length} / 6</p>
                        
                        {listaTalleres.map(taller => {
                            // Filtramos las inscripciones que pertenecen solo a este taller
                            const inscritosDelTaller = listaInscripciones.filter(i => i.taller?._id === taller._id);
                            
                            return (
                                <div key={taller._id} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '5px solid #28a745' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                        <h3 style={{ margin: 0, color: '#212529' }}>{taller.icono} {taller.titulo} <span style={{ fontSize: '0.9rem', color: '#6c757d', fontWeight: 'normal' }}>({inscritosDelTaller.length} inscritos)</span></h3>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleExportarTaller(taller, inscritosDelTaller)} className="btn-accion" style={{ backgroundColor: '#198754', color: 'white' }}>
                                                📥 Descargar Lista (Excel)
                                            </button>
                                            <button onClick={() => handleEliminarTaller(taller._id)} className="btn-accion btn-rojo">Cerrar y Eliminar Taller</button>
                                        </div>
                                    </div>
                                    
                                    <div className="tabla-responsiva">
                                        <table className="tabla-panel" style={{ backgroundColor: 'white' }}>
                                            <thead>
                                                <tr>
                                                    <th>Fecha Solicitud</th>
                                                    <th>Nombre Completo</th>
                                                    <th>Teléfono</th>
                                                    <th>Cédula (Opcional)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inscritosDelTaller.length === 0 ? (
                                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#6c757d' }}>Aún no hay personas inscritas.</td></tr>
                                                ) : (
                                                    inscritosDelTaller.map(persona => (
                                                        <tr key={persona._id}>
                                                            <td>{new Date(persona.createdAt).toLocaleDateString()}</td>
                                                            <td style={{ fontWeight: 'bold' }}>{persona.nombreCompleto}</td>
                                                            <td>{persona.telefono}</td>
                                                            <td>{persona.cedula || '---'}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                        {listaTalleres.length === 0 && <p className="mensaje-vacio">No hay talleres publicados actualmente.</p>}
                    </div>
                )}

                {vistaActual === 'publicaciones' && (
                    <div className="vista-contenido">
                        <h2>Redactar Nueva Noticia</h2>
                        <form onSubmit={handleSubirNoticia} className="formulario-panel">
                            <div className="form-grupo"><label>Título del Aviso o Noticia:</label><input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required /></div>
                            <div className="form-grupo"><label>Contenido Completo:</label><textarea value={contenido} onChange={(e) => setContenido(e.target.value)} required rows="5" ></textarea></div>
                            <div className="form-grupo"><label>Imagen (Opcional):</label><input type="file" id="input-imagen" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} /></div>
                            <button type="submit" className="btn-submit-panel" disabled={cargandoPub}>{cargandoPub ? 'Publicando...' : 'Publicar Noticia'}</button>
                            {mensajePub && <p className="mensaje-respuesta">{mensajePub}</p>}
                        </form>
                    </div>
                )}
                
                {vistaActual === 'configuracion' && (
                    <div className="vista-contenido">
                        <h2>Ajustes Visuales de la Web</h2>
                        <form onSubmit={handleActualizarHero} className="formulario-panel">
                            <div className="form-grupo"><label>Foto de Portada (Hero):</label><input type="file" onChange={(e) => setFotoHero(e.target.files[0])} required /></div>
                            <button type="submit" className="btn-submit-panel">Actualizar Portada</button>
                            {mensajeConfig && <p className="mensaje-respuesta">{mensajeConfig}</p>}
                        </form>
                    </div>
                )}

                {vistaActual === 'actas' && (
                    <div className="vista-contenido">
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
                            <button onClick={() => setSubVistaActas('pdfs')} style={{ padding: '10px 20px', backgroundColor: subVistaActas === 'pdfs' ? '#28a745' : '#f8f9fa', color: subVistaActas === 'pdfs' ? 'white' : '#495057', border: '1px solid #dee2e6', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>📁 Repositorio Legal (PDFs)</button>
                            <button onClick={() => setSubVistaActas('acuerdos')} style={{ padding: '10px 20px', backgroundColor: subVistaActas === 'acuerdos' ? '#007bff' : '#f8f9fa', color: subVistaActas === 'acuerdos' ? 'white' : '#495057', border: '1px solid #dee2e6', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>📢 Acuerdos (Público)</button>
                        </div>
                        {subVistaActas === 'pdfs' && (
                            <>
                                <h2>📝 {actaEnEdicion ? 'Actualizar Archivo' : 'Registro Legal'}</h2>
                                <form onSubmit={actaEnEdicion ? handleActualizarArchivo : handleSubirActa} className="formulario-panel">
                                    <div className="form-grupo"><label>Identificador:</label><input type="text" value={actaEnEdicion ? actaEnEdicion.titulo : tituloActa} onChange={(e) => setTituloActa(e.target.value)} required disabled={!!actaEnEdicion} /></div>
                                    <div className="form-grupo"><label>Documento:</label>
                                        <div style={{ display: 'flex', gap: '10px' }}><input type="file" id="input-archivo-acta" accept=".pdf, image/*" onChange={(e) => setArchivoActa(e.target.files[0])} required={!archivoActa} />
                                        {actaEnEdicion ? <button type="button" className="btn-accion btn-amarillo" onClick={() => { setActaEnEdicion(null); setArchivoActa(null); }}>Cancelar</button> : (archivoActa && <button type="button" className="btn-accion btn-amarillo" onClick={() => { setArchivoActa(null); document.getElementById('input-archivo-acta').value = ''; }}>❌ Quitar</button>)}
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-submit-panel" disabled={cargandoActa}>{cargandoActa ? 'Procesando...' : (actaEnEdicion ? 'Actualizar' : 'Publicar')}</button>
                                    {mensajeActa && <p className="mensaje-respuesta">{mensajeActa}</p>}
                                </form>

                                <hr style={{ margin: '40px 0' }} />
                                
                                <h3>Log de Auditoría (Actas Activas)</h3>
                                <div className="tabla-responsiva">
                                    <table className="tabla-panel">
                                        <thead><tr><th>Documento</th><th>Fecha</th><th>Última Modificación</th><th>Acciones</th></tr></thead>
                                        <tbody>
                                            {listaActas.filter(a => a.estado !== 'Eliminado').map(a => (
                                                <tr key={a._id}>
                                                    <td><strong>{a.titulo}</strong></td>
                                                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                                                    <td>{a.modificadoPor ? <span style={{ color: '#0056b3' }}>Modificado</span> : <span style={{ color: '#adb5bd' }}>Sin cambios</span>}</td>
                                                    <td>
                                                        <a href={a.archivoUrl} target="_blank" rel="noopener noreferrer" className="btn-accion btn-verde">Ver PDF</a>
                                                        <button onClick={() => setActaEnEdicion(a)} className="btn-accion btn-amarillo">Modificar</button> 
                                                        <button onClick={() => handleEliminarActa(a._id)} className="btn-accion btn-rojo">Eliminar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {listaActas.filter(a => a.estado !== 'Eliminado').length === 0 && (
                                                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No hay actas activas.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 🚨 AQUÍ ESTÁ LA TABLA QUE TE HABÍA BORRADO POR ERROR 🚨 */}
                                <h3 style={{ marginTop: '40px', color: '#dc3545' }}>Historial de Actas Eliminadas</h3>
                                <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Registro interno de auditoría para documentos removidos.</p>
                                <div className="tabla-responsiva" style={{ opacity: 0.85 }}>
                                    <table className="tabla-panel">
                                        <thead style={{ backgroundColor: '#ffeeba' }}>
                                            <tr>
                                                <th>Documento Original</th>
                                                <th>Fecha de Eliminación</th>
                                                <th>Archivo Respaldo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listaActas.filter(a => a.estado === 'Eliminado').map((a) => (
                                                <tr key={a._id}>
                                                    <td style={{ textDecoration: 'line-through', color: '#6c757d' }}>{a.titulo}</td>
                                                    <td>{a.fechaEliminacion ? new Date(a.fechaEliminacion).toLocaleString() : 'N/A'}</td>
                                                    <td><a href={a.archivoUrl} target="_blank" rel="noopener noreferrer" className="btn-accion" style={{ backgroundColor: '#6c757d', color: 'white' }}>Ver Respaldo</a></td>
                                                </tr>
                                            ))}
                                            {listaActas.filter(a => a.estado === 'Eliminado').length === 0 && (
                                                <tr><td colSpan="3" style={{ textAlign: 'center' }}>El historial de eliminados está limpio.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                        {subVistaActas === 'acuerdos' && (
                            <>
                                <h2>📢 Publicar Acuerdos</h2>
                                <form onSubmit={handleSubirAcuerdo} className="formulario-panel">
                                    <div className="form-grupo"><label>Título:</label><input type="text" value={tituloAcuerdo} onChange={(e) => setTituloAcuerdo(e.target.value)} required /></div>
                                    <div className="form-grupo"><label>Fecha:</label><input type="date" value={fechaAcuerdo} onChange={(e) => setFechaAcuerdo(e.target.value)} required /></div>
                                    <div className="form-grupo"><label>Puntos:</label><textarea value={puntosAcuerdo} onChange={(e) => setPuntosAcuerdo(e.target.value)} required rows="4"></textarea></div>
                                    <button type="submit" className="btn-submit-panel" disabled={cargandoAcuerdo}>Publicar Acuerdos</button>
                                    {mensajeAcuerdo && <p className="mensaje-respuesta">{mensajeAcuerdo}</p>}
                                </form>
                                <hr style={{ margin: '40px 0' }} />
                                <h3>Acuerdos Visibles</h3>
                                <table className="tabla-panel">
                                    <thead><tr><th>Fecha</th><th>Título</th><th>Acción</th></tr></thead>
                                    <tbody>
                                        {listaAcuerdos.map(a => (
                                            <tr key={a._id}><td>{new Date(a.fechaAcuerdo).toLocaleDateString()}</td><td>{a.titulo}</td><td><button onClick={() => handleEliminarAcuerdo(a._id)} className="btn-accion btn-rojo">Quitar</button></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                )}

                {vistaActual === 'usuarios' && (
                    <div className="vista-contenido">
                        <h2>Gestión de Junta Directiva</h2>
                        <form onSubmit={handleSubirMiembro} className="formulario-panel">
                            <div className="form-grupo"><label>Nombre:</label><input type="text" value={nombreMiembro} onChange={(e) => setNombreMiembro(e.target.value)} required /></div>
                            <div className="form-grupo"><label>Puesto:</label><input type="text" value={puestoMiembro} onChange={(e) => setPuestoMiembro(e.target.value)} required /></div>
                            <div className="form-grupo"><label>Orden:</label><input type="number" value={ordenMiembro} onChange={(e) => setOrdenMiembro(e.target.value)} required /></div>
                            <div className="form-grupo"><label>Foto:</label><input type="file" accept="image/*" onChange={(e) => setFotoMiembro(e.target.files[0])} required /></div>
                            <button type="submit" className="btn-submit-panel">Añadir Directivo</button>
                            {mensajeMiembro && <p className="mensaje-respuesta">{mensajeMiembro}</p>}
                        </form>
                        <hr style={{ margin: '40px 0' }} />
                        <h3>Mantenimiento</h3>
                        <table className="tabla-panel">
                            <thead><tr><th>Orden</th><th>Nombre</th><th>Puesto</th><th>Acción</th></tr></thead>
                            <tbody>
                                {listaMiembros.map((m) => (
                                    <tr key={m._id}><td>{m.orden}</td><td>{m.nombre}</td><td>{m.puesto}</td><td><button onClick={() => handleEliminarMiembro(m._id)} className="btn-accion btn-rojo">Eliminar</button></td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            {/* 🚨 NUEVA SECCIÓN: CUENTAS DE ACCESO 🚨 */}
                {vistaActual === 'cuentas' && (
                    <div className="vista-contenido">
                        <h2>Gestión de Accesos al Sistema</h2>
                        <p>Invita a nuevos miembros a usar el panel o revoca sus accesos.</p>
                        
                        <form onSubmit={handleInvitarCuenta} className="formulario-panel">
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <div className="form-grupo" style={{ flex: '1' }}>
                                    <label>Nombre del Directivo:</label>
                                    <input type="text" value={nombreCuenta} onChange={(e) => setNombreCuenta(e.target.value)} required placeholder="Ej: Juan Pérez" />
                                </div>
                                <div className="form-grupo" style={{ flex: '1' }}>
                                    <label>Correo (Donde recibirá la clave):</label>
                                    <input type="email" value={emailCuenta} onChange={(e) => setEmailCuenta(e.target.value)} required placeholder="correo@gmail.com" />
                                </div>
                                <div className="form-grupo" style={{ flex: '1' }}>
                                    <label>Nivel de Permisos (Rol):</label>
                                    <select value={rolCuenta} onChange={(e) => setRolCuenta(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                                        <option value="admin">Administrador Regular (Soporte)</option>
                                        <option value="presidente">Presidente</option>
                                        <option value="vicepresidente">Vicepresidente</option>
                                        <option value="secretario">Secretario/a (Gestión de Actas)</option>
                                        <option value="tesorero">Tesorero/a</option>
                                        <option value="fiscal">Fiscal</option>
                                        <option value="vocal">Vocal / Lector</option>
                                        {/*{usuario.role === 'super_admin' && <option value="super_admin">Super Admin (TI)</option>}*/}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn-submit-panel" disabled={cargandoCuentas} style={{ backgroundColor: '#28a745' }}>
                                {cargandoCuentas ? 'Enviando correo...' : '📧 Enviar Invitación de Acceso'}
                            </button>
                            {mensajeCuentas && <p className="mensaje-respuesta" style={{ fontWeight: 'bold', color: mensajeCuentas.includes('❌') ? '#dc3545' : '#28a745' }}>{mensajeCuentas}</p>}
                        </form>

                        <hr style={{ margin: '40px 0' }} />
                        
                        <h3>Cuentas Activas</h3>
                        <div className="tabla-responsiva">
                            <table className="tabla-panel">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Rol de Sistema</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaCuentas.map((cta) => (
                                        <tr key={cta._id}>
                                            <td style={{ fontWeight: 'bold' }}>{cta.nombre}</td>
                                            <td>{cta.email}</td>
                                            <td><span style={{ backgroundColor: '#e9ecef', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem' }}>{cta.role.toUpperCase()}</span></td>
                                            <td>
                                                {cta.isActivated ? <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Activa</span> : <span style={{ color: '#ffc107', fontWeight: 'bold' }}>⏳ Pendiente</span>}
                                            </td>
                                            <td>
                                                <button onClick={() => handleEliminarCuenta(cta._id)} className="btn-accion btn-rojo" disabled={cta.role === 'super_admin'}>
                                                    Revocar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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