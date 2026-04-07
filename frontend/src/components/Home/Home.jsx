import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    // Estados principales
    const [publicaciones, setPublicaciones] = useState([]);
    const [config, setConfig] = useState({ fotoHero: '' });
    const [cargando, setCargando] = useState(true);

    // Carga de datos iniciales (Noticias y Configuración Visual)
    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                // Obtener publicaciones
                const resNoticias = await fetch('http://localhost:4000/api/publicaciones');
                const dataNoticias = await resNoticias.json();
                setPublicaciones(dataNoticias);

                // Obtener configuración (Imagen de portada)
                const resConfig = await fetch('http://localhost:4000/api/configuracion');
                if (resConfig.ok) {
                    const dataConfig = await resConfig.json();
                    if (dataConfig && dataConfig.fotoHero) {
                        setConfig(dataConfig);
                    }
                }

                setCargando(false);
            } catch (error) {
                console.error("Error en la carga de datos iniciales:", error);
                setCargando(false);
            }
        };

        obtenerDatos();
    }, []);

    const formatearFecha = (fechaMongo) => {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaMongo).toLocaleDateString('es-CR', opciones);
    };

    // Datos estáticos temporales para la sección de Talleres
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
            {/* Navegación Principal */}
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="logo-placeholder">ADI</div> 
                    <span className="brand-text">Desarrollo Integral</span>
                </div>
                <Link to="/login" className="btn-junta">
                    Acceso Junta Directiva
                </Link>
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
                        <button className="btn-primary">Nuestra Visión</button>
                        <button className="btn-outline">Conocer más</button>
                    </div>
                </div>
            </header>

            {/* Sección de Talleres y Servicios */}
            <section className="servicios-section">
                <h2>Talleres y Servicios</h2>
                <div className="grid-servicios">
                    {talleres.map(taller => (
                        <div key={taller.id} className="tarjeta-servicio">
                            <div className="icono-servicio">{taller.icono}</div>
                            <h3>{taller.titulo}</h3>
                            <p>{taller.descripcion}</p>
                            <button className="btn-taller-mas">Ver detalles / Inscribirse</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sección de Noticias y Publicaciones */}
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
                                {/* Renderizado condicional de la imagen de la noticia */}
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

            {/* Sección de Junta Directiva */}
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