/**
 * Configuración inicial y manejo del reproductor de música
 * =====================================================
 * Este script maneja toda la funcionalidad del reproductor de música y el buscador de películas.
 * Se ejecuta cuando el DOM está completamente cargado para asegurar que todos los elementos
 * están disponibles para su manipulación.
 */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Configuración de la API de TMDB (The Movie Database)
     * -------------------------------------------------
     * API_KEY: Clave de autenticación necesaria para hacer peticiones a la API
     * API_URL: URL base para todas las peticiones a la API
     * IMG_PATH: URL base para construir las rutas a las imágenes de los posters
     */
    const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
    const API_URL = 'https://api.themoviedb.org/3';
    const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

    // Referencias a elementos del DOM que se usarán frecuentemente
    const campoBusqueda = document.getElementById('campoBusqueda');
    const botonBuscar = document.getElementById('botonBuscar');
    const divResultados = document.getElementById('resultados');
    const botonesGenero = document.querySelectorAll('.boton-genero');

    /**
     * Sistema de Reproducción de Música
     * ===============================
     * Implementa un reproductor de música con las siguientes características:
     * - Reproducción automática al cargar la página
     * - Control de volumen
     * - Cambio automático a la siguiente canción
     * - Interfaz visual con botones de control
     */
    
    // Lista de canciones disponibles para reproducir
    const canciones = [
        'media/canciones/1.mp3',
        'media/canciones/2.mp3',
        'media/canciones/3.mp3',
        'media/canciones/4.mp3',
        'media/canciones/5.mp3',
        'media/canciones/6.mp3',
    ];
    
    // Variables de control del reproductor
    let cancionActual = 0;
    let reproductor = new Audio();
    let reproduciendo = false;
    
    // Referencias a elementos del DOM para el control de música
    const botonPlayPause = document.getElementById('botonPlayPause');
    const iconoPlayPause = document.getElementById('iconoPlayPause');
    const botonSiguiente = document.getElementById('botonSiguiente');
    const botonVolumenSubir = document.getElementById('botonVolumenSubir');
    const botonVolumenBajar = document.getElementById('botonVolumenBajar');
    const volumenActual = document.querySelector('.volumen-actual');
    const modal = document.getElementById('modal');
    
    /**
     * Configuración inicial del reproductor de audio
     * -------------------------------------------
     * - Establece el volumen inicial al 50%
     * - Habilita la reproducción automática
     * - Configura la precarga de audio para mejor rendimiento
     */
    reproductor.volume = 0.5;
    reproductor.autoplay = true;
    reproductor.preload = 'auto';
    volumenActual.textContent = '50%';

    /**
     * cargarYReproducir()
     * ------------------
     * Función principal para iniciar la reproducción de música.
     * Implementa un sistema de manejo de errores y fallback para
     * navegadores que bloquean la reproducción automática.
     * 
     * Proceso:
     * 1. Carga la canción actual
     * 2. Espera a que esté lista para reproducir
     * 3. Intenta reproducir automáticamente
     * 4. Si falla, espera la interacción del usuario
     * 
     * Referencias y tutoriales:
     * - W3Schools Audio: https://www.w3schools.com/jsref/dom_obj_audio.asp
     * - MDN Audio Web API: https://developer.mozilla.org/es/docs/Web/API/HTMLAudioElement
     * - Tutorial Audio HTML5: https://www.w3schools.com/html/html5_audio.asp
     */
    function cargarYReproducir() {
        reproductor.src = canciones[cancionActual];
        reproductor.load();
        
        reproductor.addEventListener('canplaythrough', function iniciarReproduccion() {
            reproductor.play()
                .then(() => {
                    reproduciendo = true;
                    iconoPlayPause.className = 'fas fa-pause';
                })
                .catch(error => {
                    console.log("Error al reproducir:", error);
                    // Fallback: esperar interacción del usuario
                    document.body.addEventListener('click', function reproducirConClick() {
                        reproductor.play();
                        reproduciendo = true;
                        iconoPlayPause.className = 'fas fa-pause';
                        document.body.removeEventListener('click', reproducirConClick);
                    }, { once: true });
                });
            reproductor.removeEventListener('canplaythrough', iniciarReproduccion);
        });
    }

    // Iniciar reproducción y configurar evento para cambio automático de canción
    cargarYReproducir();
    reproductor.addEventListener('ended', () => {
        siguienteCancion();
    });
    
    /**
     * togglePlayPause()
     * ---------------
     * Alterna entre reproducir y pausar la música.
     * Actualiza la interfaz visual para reflejar el estado actual.
     */
    function togglePlayPause() {
        if (reproduciendo) {
            reproductor.pause();
            iconoPlayPause.className = 'fas fa-play';
        } else {
            reproductor.play();
            iconoPlayPause.className = 'fas fa-pause';
        }
        reproduciendo = !reproduciendo;
    }
    
    /**
     * siguienteCancion()
     * ----------------
     * Cambia a la siguiente canción en la lista.
     * Utiliza el operador módulo para volver al principio cuando
     * se llega al final de la lista.
     */
    function siguienteCancion() {
        cancionActual = (cancionActual + 1) % canciones.length;
        reproductor.src = canciones[cancionActual];
        if (reproduciendo) {
            reproductor.play();
        }
    }

    /**
     * ajustarVolumen(cambio)
     * --------------------
     * @param {number} cambio - Cantidad a modificar el volumen (-0.1 o 0.1)
     * 
     * Ajusta el volumen del reproductor y actualiza la interfaz visual.
     * Implementa límites para mantener el volumen entre 0 y 1.
     * Actualiza los iconos según el nivel de volumen.
     * 
     * Referencias y tutoriales:
     * - W3Schools HTML Audio/Video DOM: https://www.w3schools.com/tags/ref_av_dom.asp
     * - MDN Audio Controls: https://developer.mozilla.org/es/docs/Web/HTML/Element/audio
     * - W3Schools HTML Audio: https://www.w3schools.com/html/html5_audio.asp
     */
    function ajustarVolumen(cambio) {
        let nuevoVolumen = reproductor.volume + cambio;
        nuevoVolumen = Math.max(0, Math.min(1, nuevoVolumen));
        reproductor.volume = nuevoVolumen;
        volumenActual.textContent = Math.round(nuevoVolumen * 100) + '%';
        
        // Actualización dinámica de iconos según el nivel de volumen
        const iconoVolumenBajar = botonVolumenBajar.querySelector('i');
        const iconoVolumenSubir = botonVolumenSubir.querySelector('i');
        
        if (nuevoVolumen === 0) {
            iconoVolumenBajar.className = 'fas fa-volume-mute';
            iconoVolumenSubir.className = 'fas fa-volume-up';
        } else if (nuevoVolumen < 0.5) {
            iconoVolumenBajar.className = 'fas fa-volume-down';
            iconoVolumenSubir.className = 'fas fa-volume-up';
        } else {
            iconoVolumenBajar.className = 'fas fa-volume-down';
            iconoVolumenSubir.className = 'fas fa-volume-up';
        }
    }
    
    // Event listeners para controles de música
    botonPlayPause.addEventListener('click', togglePlayPause);
    botonSiguiente.addEventListener('click', siguienteCancion);
    botonVolumenSubir.addEventListener('click', () => ajustarVolumen(0.1));
    botonVolumenBajar.addEventListener('click', () => ajustarVolumen(-0.1));

    /**
     * Mensaje de Bienvenida
     * ===================
     * Muestra un mensaje inicial atractivo cuando se carga la página
     * con animaciones y estilos definidos en CSS.
     */
    divResultados.innerHTML = `
        <div class="mensaje-inicial">
            <h2>Descubre el Cine</h2>
            <p>Explora el fascinante mundo del séptimo arte</p>
        </div>
    `;

    /**
     * obtenerPeliculasPorGenero(generoId)
     * ---------------------------------
     * @param {string} generoId - ID del género de películas a buscar
     * 
     * Función asíncrona que obtiene películas aleatorias de un género específico.
     * 
     * Proceso:
     * 1. Obtiene el total de páginas disponibles para el género
     * 2. Selecciona una página aleatoria (máximo 500 por limitación de la API)
     * 3. Obtiene las películas de esa página
     * 4. Aleatoriza y limita los resultados
     * 5. Muestra las películas en la interfaz
     * 
     * Referencias y tutoriales:
     * - W3Schools Fetch API: https://www.w3schools.com/js/js_api_fetch.asp
     * - W3Schools Async/Await: https://www.w3schools.com/js/js_async.asp
     * - W3Schools Promesas: https://www.w3schools.com/js/js_promise.asp
     *  enlace de youtube: https://www.youtube.com/watch?v=rKK1q7nFt7M&ab_channel=CarlosAzaustre-AprendeJavaScript
     * 
     * Manejo de errores incluido para mejor experiencia de usuario.
     */
    async function obtenerPeliculasPorGenero(generoId) {
        try {
            // Primera petición para obtener el total de páginas
            const respuestaTotalPaginas = await fetch(
                `${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoId}&language=es-ES`
            );
            const datosTotalPaginas = await respuestaTotalPaginas.json();
            
            // Selección de página aleatoria
            const paginaAleatoria = Math.floor(Math.random() * Math.min(datosTotalPaginas.total_pages, 500)) + 1;

            // Segunda petición para obtener películas de la página seleccionada
            const respuesta = await fetch(
                `${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoId}&page=${paginaAleatoria}&language=es-ES`
            );
            const datos = await respuesta.json();
            
            // Aleatorización y limitación de resultados
            const peliculasAleatorias = datos.results
                .sort(() => Math.random() - 0.5)
                .slice(0, 10);
            
            mostrarPeliculas(peliculasAleatorias);
        } catch (error) {
            console.error('Error al obtener películas por género:', error);
            divResultados.innerHTML = '<p>Hubo un error al cargar las películas.</p>';
        }
    }

    /**
     * buscarPeliculas(query)
     * --------------------
     * @param {string} query - Término de búsqueda
     * 
     * Función asíncrona que busca películas por nombre o términos de búsqueda.
     * Utiliza la API de TMDB para realizar la búsqueda y muestra los resultados.
     */
    async function buscarPeliculas(query) {
        try {
            const respuesta = await fetch(
                `${API_URL}/search/movie?api_key=${API_KEY}&query=${query}&language=es-ES`
            );
            const datos = await respuesta.json();
            mostrarPeliculas(datos.results.slice(0, 10));
        } catch (error) {
            console.error('Error en la búsqueda de películas:', error);
            divResultados.innerHTML = '<p>Hubo un error en la búsqueda.</p>';
        }
    }

    /**
     * mostrarPeliculas(peliculas)
     * -------------------------
     * @param {Array} peliculas - Array de objetos con información de películas
     * 
     * Función principal para mostrar las películas en la interfaz.
     * Crea tarjetas interactivas para cada película con:
     * - Imagen del póster
     * - Título
     * - Valoración
     * - Fecha de lanzamiento
     * - Modal para vista detallada
     * 
     * Referencias y tutoriales:
     * - W3Schools DOM: https://www.w3schools.com/js/js_htmldom.asp
     * - W3Schools Eventos: https://www.w3schools.com/js/js_events.asp
     * - MDN Manipulación DOM (español): https://developer.mozilla.org/es/docs/Web/API/Document_Object_Model/Introduction
     * - W3Schools CSS Animaciones: https://www.w3schools.com/css/css3_animations.asp
     * 
     * Características:
     * - Animaciones de entrada
     * - Efectos hover
     * - Manejo de imágenes faltantes
     * - Modal interactivo con información detallada
     */
    function mostrarPeliculas(peliculas) {
        divResultados.innerHTML = '';
        
        if (peliculas.length === 0) {
            divResultados.innerHTML = '<p>No se encontraron películas.</p>';
            return;
        }

        peliculas.forEach((pelicula, index) => {
            const { title, poster_path, vote_average, overview, release_date } = pelicula;
            const divPelicula = document.createElement('div');
            divPelicula.className = 'carta';
            divPelicula.style.animationDelay = `${index * 0.1}s`;

            const imagenUrl = poster_path 
                ? IMG_PATH + poster_path 
                : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

            divPelicula.innerHTML = `
                <div class="contenedor-imagen">
                    <img src="${imagenUrl}" alt="${title}">
                    <div class="icono-expandir">
                        <i class="fas fa-search-plus"></i>
                    </div>
                </div>
                <div class="info">
                    <h3>${title}</h3>
                    <div class="meta-info">
                        <div class="valoracion">★ ${vote_average.toFixed(1)}</div>
                        <div class="fecha">${formatearFecha(release_date)}</div>
                    </div>
                </div>
            `;

            // Configuración del modal para vista detallada
            divPelicula.addEventListener('click', () => {
                modal.querySelector('.modal-contenido').innerHTML = `
                    <button class="modal-cerrar" title="Cerrar">
                        <i class="fas fa-times"></i>
                    </button>
                    <img src="${imagenUrl}" alt="${title}">
                    <div class="info">
                        <h2>${title}</h2>
                        <div class="meta-info">
                            <div class="valoracion">★ ${vote_average.toFixed(1)}</div>
                            <div class="fecha">${formatearFecha(release_date)}</div>
                        </div>
                        <p class="descripcion">${overview || 'Sin descripción disponible.'}</p>
                    </div>
                `;
                modal.classList.add('activo');

                // Manejo del cierre del modal
                const botonCerrar = modal.querySelector('.modal-cerrar');
                botonCerrar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    modal.classList.remove('activo');
                });
            });

            divResultados.appendChild(divPelicula);
        });
    }

    // Event listener para cerrar el modal al hacer clic fuera de él
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('activo');
        }
    });

    /**
     * formatearFecha(fecha)
     * ------------------
     * @param {string} fecha - Fecha en formato ISO
     * @returns {string} Fecha formateada en español
     * 
     * Formatea una fecha al estilo español (ejemplo: "15 de enero de 2024")
     */
    function formatearFecha(fecha) {
        if (!fecha) return 'Fecha no disponible';
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    }

    /**
     * Event Listeners
     * =============
     * Configuración de los manejadores de eventos para la interacción del usuario
     */
    
    // Búsqueda al hacer clic en el botón
    botonBuscar.addEventListener('click', () => {
        const terminoBusqueda = campoBusqueda.value.trim();
        if (terminoBusqueda) {
            buscarPeliculas(terminoBusqueda);
        }
    });

    // Búsqueda al presionar Enter
    campoBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const terminoBusqueda = campoBusqueda.value.trim();
            if (terminoBusqueda) {
                buscarPeliculas(terminoBusqueda);
            }
        }
    });

    // Manejo de botones de género
    botonesGenero.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Actualización visual de botones
            botonesGenero.forEach(b => b.classList.remove('activo'));
            e.target.classList.add('activo');
            
            // Búsqueda de películas por género
            const generoId = e.target.dataset.genero;
            obtenerPeliculasPorGenero(generoId);
        });
    });
}); 