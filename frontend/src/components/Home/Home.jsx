import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    // Estados para guardar las noticias y saber si está cargando
    const [publicaciones, setPublicaciones] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Este useEffect va al backend a traer las noticias apenas carga la página
    useEffect(() => {
        const obtenerNoticias = async () => {
            try {
                // Hacemos el GET a la ruta pública (no ocupamos token aquí)
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

    // Función para poner la fecha bonita (ej. 5 de Abril de 2026)
    const formatearFecha = (fechaMongo) => {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaMongo).toLocaleDateString('es-CR', opciones);
    };

    return (
        <div className="home-container">
            {/* Encabezado Principal */}
            <header className="home-header">
                <div className="header-content">
                    <h1>Asociación de Desarrollo Integral</h1>
                    <p>Trabajando juntos por el progreso de nuestro pueblo</p>
                </div>
                <Link to="/login" className="btn-junta">
                    Acceso Junta Directiva
                </Link>
            </header>

            {/* Sección de Noticias */}
            <main className="noticias-section">
                <h2>Últimas Noticias y Avisos</h2>
                
                {cargando ? (
                    <p className="mensaje-carga">Cargando publicaciones...</p>
                ) : publicaciones.length === 0 ? (
                    <p className="mensaje-vacio">Aún no hay noticias publicadas. ¡Vuelve pronto!</p>
                ) : (
                    <div className="grid-noticias">
                        {publicaciones.map(publi => (
                            <article key={publi._id} className="tarjeta-noticia">
                                <div className="tarjeta-contenido">
                                    <span className="fecha-noticia">{formatearFecha(publi.createdAt)}</span>
                                    <h3 className="titulo-noticia">{publi.titulo}</h3>
                                    <p className="texto-noticia">{publi.contenido}</p>
                                </div>
                                <div className="tarjeta-footer">
                                    <span className="autor-noticia">Publicado por: {publi.autor?.nombre || 'Junta Directiva'}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* 🚨 NUEVA: Sección de la Junta Directiva 🚨 */}
            <section className="junta-section">
                <h2>Conozca a su Junta Directiva</h2>
                <div className="grid-junta">
                    {/* Tarjeta de Miembro 1 (Las fotos son de relleno temporal) */}
                    <div className="tarjeta-miembro">
                        <img src="https://ui-avatars.com/api/?name=J+P&background=0D8ABC&color=fff&size=150" alt="Presidente" className="foto-miembro" />
                        <h4>Juan Pérez</h4>
                        <p>Presidente</p>
                    </div>

                    {/* Tarjeta de Miembro 2 */}
                    <div className="tarjeta-miembro">
                        <img src="https://ui-avatars.com/api/?name=M+G&background=28a745&color=fff&size=150" alt="Secretaria" className="foto-miembro" />
                        <h4>María González</h4>
                        <p>Secretaria</p>
                    </div>

                    {/* Tarjeta de Miembro 3 */}
                    <div className="tarjeta-miembro">
                        <img src="https://ui-avatars.com/api/?name=C+R&background=ffc107&color=fff&size=150" alt="Tesorero" className="foto-miembro" />
                        <h4>Carlos Rojas</h4>
                        <p>Tesorero</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;