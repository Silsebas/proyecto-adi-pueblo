import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerNoticias = async () => {
            try {
                const respuesta = await fetch('http://localhost:4000/api/publicaciones');
                const data = await respuesta.json();
                setPublicaciones(data);
                setCargando(false);
            } catch (error) {
                console.error("Error al cargar las noticias:", error);
                setCargando(false);
            }
        };

        obtenerNoticias();
    }, []);

    const formatearFecha = (fechaMongo) => {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaMongo).toLocaleDateString('es-CR', opciones);
    };

    // 🚨 Datos de prueba para la nueva sección de Talleres 🚨
    // Más adelante, esto vendrá de la base de datos
    const talleres = [
        { id: 1, icono: '🎓', titulo: 'Capacitación Comunitaria', descripcion: 'Cursos de tecnología, emprendimiento y desarrollo personal.' },
        { id: 2, icono: '💡', titulo: 'Innovación Social', descripcion: 'Iniciativas colaborativas para el bienestar económico de la comunidad.' },
        { id: 3, icono: '📈', titulo: 'Desarrollo Local', descripcion: 'Apoyo a emprendimientos locales y creación de empleos.' },
        { id: 4, icono: '⚽', titulo: 'Cultura y Deporte', descripcion: 'Actividades para el bienestar físico y mental del pueblo.' },
        { id: 5, icono: '🏢', titulo: 'Infraestructura', descripcion: 'Mejora y mantenimiento de espacios públicos comunales.' },
        { id: 6, icono: '💻', titulo: 'Acceso Tecnológico', descripcion: 'Programas educativos para niños y adultos con herramientas emergentes.' }
    ];

    return (
        <div className="home-container">
            {/* 🚨 1. NAVBAR PROFESIONAL (Basado en referencias) 🚨 */}
            <nav className="navbar">
                <div className="navbar-brand">
                    {/* 👇 Aquí iría tu logo real `/assets/logo-adi.png` */}
                    <div className="logo-placeholder">ADI</div> 
                    <span className="brand-text">Desarrollo Integral</span>
                </div>
                <Link to="/login" className="btn-junta">
                    Acceso Junta Directiva
                </Link>
            </nav>

            {/* 🚨 2. SECCIÓN HÉROE CON FOTO (Basado en references) 🚨 */}
            <header className="hero-section">
                {/* 👇 Aquí iría tu foto del pueblo real `/assets/hero-pueblo.jpg` */}
                <div className="hero-image-placeholder">
                    <span>Espacio para foto del pueblo / salón comunal</span>
                </div>
                <div className="hero-content">
                    <span className="sub-title">IMPULSANDO NUESTRA COMUNIDAD</span>
                    <h1>Transformando Comunidades a través del Desarrollo Integral</h1>
                    <p>Promoviendo la colaboración comunitaria, el crecimiento social y económico para mejorar la calidad de vida de nuestros ciudadanos.</p>
                    <div className="hero-buttons">
                        <button className="btn-primary">Nuestra Visión</button>
                        <button className="btn-outline">Conocer más</button>
                    </div>
                </div>
            </header>

            {/* 🚨 3. NUEVA SECCIÓN: TALLERES Y SERVICIOS (Basado en image_5.png) 🚨 */}
            <section className="servicios-section">
                <h2>Talleres y Servicios</h2>
                <div className="grid-servicios">
                    {talleres.map(taller => (
                        <div key={taller.id} className="tarjeta-servicio">
                            <div className="icono-servicio">{taller.icono}</div>
                            <h3>{taller.titulo}</h3>
                            <p>{taller.descripcion}</p>
                            {/* Este botón luego llevará al formulario de inscripción */}
                            <button className="btn-taller-mas">Ver detalles / Inscribirse</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. SECCIÓN NOTICIAS (Existente, pero estilizada) */}
            <main className="noticias-section alternate-bg">
                <h2>Últimas Noticias y Publicaciones</h2>
                {cargando ? (
                    <p className="mensaje-carga">Cargando publicaciones...</p>
                ) : publicaciones.length === 0 ? (
                    <p className="mensaje-vacio">Aún no hay noticias publicadas. ¡Vuelve pronto!</p>
                ) : (
                    <div className="grid-noticias">
                        {publicaciones.map(publi => (
                            <article key={publi._id} className="tarjeta-noticia">
                                
                                {/* 🚨 NUEVO: Si la publicación tiene imagen, la mostramos 🚨 */}
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

            {/* 5. SECCIÓN JUNTA (Existente, estilizada) */}
            <section className="junta-section">
                <h2>Conozca a su Junta Directiva</h2>
                <div className="grid-junta">
                    <div className="tarjeta-miembro">
                        <img src="https://ui-avatars.com/api/?name=J+P&background=28a745&color=fff&size=150" alt="Presidente" className="foto-miembro" />
                        <h4>Juan Pérez</h4>
                        <p>Presidente</p>
                    </div>
                    <div className="tarjeta-miembro">
                        <img src="https://ui-avatars.com/api/?name=M+G&background=28a745&color=fff&size=150" alt="Secretaria" className="foto-miembro" />
                        <h4>María González</h4>
                        <p>Secretaria</p>
                    </div>
                    <div className="tarjeta-miembro">
                        <img src="https://ui-avatars.com/api/?name=C+R&background=28a745&color=fff&size=150" alt="Tesorero" className="foto-miembro" />
                        <h4>Carlos Rojas</h4>
                        <p>Tesorero</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;