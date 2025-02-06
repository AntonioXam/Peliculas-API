// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {

    // Configuración de la API de TMDB

    const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; // Clave de acceso a la API
    const API_URL = 'https://api.themoviedb.org/3';      // URL base de la API
    const IMG_PATH = 'https://image.tmdb.org/t/p/w500';  // URL base para las imágenes 

    // Obtener referencias a los elementos del DOM que usaremos frecuentemente

    const campoBusqueda = document.getElementById('campoBusqueda');   
    const botonBuscar = document.getElementById('botonBuscar');       
    const divResultados = document.getElementById('resultados');       
    const botonesGenero = document.querySelectorAll('.boton-genero'); 

    // Configuración de música
    const canciones = [
        'media/canciones/1.mp3',
        'media/canciones/2.mp3',
        'media/canciones/3.mp3',
        'media/canciones/4.mp3',
        'media/canciones/5.mp3',
        'media/canciones/6.mp3',
    ];
    
    let cancionActual = 0;
    let reproductor = new Audio();
    let reproduciendo = false;
    
    // Elementos del DOM para música
    const botonPlayPause = document.getElementById('botonPlayPause');
    const iconoPlayPause = document.getElementById('iconoPlayPause');
    const botonSiguiente = document.getElementById('botonSiguiente');
    const botonVolumenSubir = document.getElementById('botonVolumenSubir');
    const botonVolumenBajar = document.getElementById('botonVolumenBajar');
    const volumenActual = document.querySelector('.volumen-actual');
    const modal = document.getElementById('modal');
    
    // Configuración inicial del reproductor
    reproductor.volume = 0.5;
    reproductor.autoplay = true;
    reproductor.preload = 'auto';
    volumenActual.textContent = '50%';

    // Cargar y reproducir la primera canción
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
                    // Intentar reproducir con interacción del usuario
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

    // Iniciar la reproducción
    cargarYReproducir();

    // Manejar cuando termina una canción
    reproductor.addEventListener('ended', () => {
        siguienteCancion();
    });
    
    // Funciones de control de música
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
    
    function siguienteCancion() {
        cancionActual = (cancionActual + 1) % canciones.length;
        reproductor.src = canciones[cancionActual];
        if (reproduciendo) {
            reproductor.play();
        }
    }

    // Funciones de control de volumen
    function ajustarVolumen(cambio) {
        let nuevoVolumen = reproductor.volume + cambio;
        // Asegurar que el volumen esté entre 0 y 1
        nuevoVolumen = Math.max(0, Math.min(1, nuevoVolumen));
        reproductor.volume = nuevoVolumen;
        // Actualizar el indicador de volumen
        volumenActual.textContent = Math.round(nuevoVolumen * 100) + '%';
        
        // Actualizar el icono según el nivel de volumen
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
    
    // Event listeners para música
    botonPlayPause.addEventListener('click', togglePlayPause);
    botonSiguiente.addEventListener('click', siguienteCancion);
    botonVolumenSubir.addEventListener('click', () => ajustarVolumen(0.1));
    botonVolumenBajar.addEventListener('click', () => ajustarVolumen(-0.1));

    // Muestra el mensaje inicial de bienvenida cuando se carga la página.
    divResultados.innerHTML = `
        <div class="mensaje-inicial">
            <h2>Descubre el Cine</h2>
            <p>Explora el fascinante mundo del séptimo arte</p>
        </div>
    `;

    /**
     * Obtiene películas aleatorias de un género específico.
     * Tutorial sobre async/await y fetch:
     * https://es.javascript.info/async-await
     */
    async function obtenerPeliculasPorGenero(generoId) {
        try {
            // Primera petición: obtener total de páginas
            const respuestaTotalPaginas = await fetch(
                `${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoId}&language=es-ES`
            );
            const datosTotalPaginas = await respuestaTotalPaginas.json();
            
            // Calcular página aleatoria (máximo 500 por limitación de la API)
            const paginaAleatoria = Math.floor(Math.random() * Math.min(datosTotalPaginas.total_pages, 500)) + 1;

            // Segunda petición: obtener películas de la página aleatoria
            const respuesta = await fetch(
                `${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${generoId}&page=${paginaAleatoria}&language=es-ES`
            );
            const datos = await respuesta.json();
            
            // Procesar y aleatorizar resultados
            const peliculasAleatorias = datos.results
                .sort(() => Math.random() - 0.5) // Mezcla aleatoria usando el algoritmo Fisher-Yates
                .slice(0, 10);                   // Tomar solo 10 películas
            
            mostrarPeliculas(peliculasAleatorias);
        } catch (error) {
            console.error('Error al obtener películas por género:', error);
            divResultados.innerHTML = '<p>Hubo un error al cargar las películas.</p>';
        }
    }

    /**
     * Busca películas por nombre o términos de búsqueda.
     * Tutorial sobre APIs y fetch en español:
     * https://www.youtube.com/watch?v=eLqMkQf4Qks&ab_channel=Garajedeideas%7CTech
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

    // Función modificada para mostrar películas con animación
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

            // Event listener para la tarjeta
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

                // Event listener para el botón de cerrar
                const botonCerrar = modal.querySelector('.modal-cerrar');
                botonCerrar.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evita que el clic se propague al modal
                    modal.classList.remove('activo');
                });
            });

            divResultados.appendChild(divPelicula);
        });
    }

    // Cerrar modal al hacer clic fuera de él
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('activo');
        }
    });

    // Formatea una fecha al estilo español.
    function formatearFecha(fecha) {
        if (!fecha) return 'Fecha no disponible';
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    }

    /**
     * Event Listeners para la interacción del usuario
     * enlace a tutorial: https://developer.mozilla.org/es/docs/Learn_web_development/Core/Scripting/Events
     * 
     */
    
    // Manejador para el botón de búsqueda
    botonBuscar.addEventListener('click', () => {
        const terminoBusqueda = campoBusqueda.value.trim();
        if (terminoBusqueda) {
            buscarPeliculas(terminoBusqueda);
        }
    });

    // Manejador para la tecla Enter en el campo de búsqueda
    campoBusqueda.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const terminoBusqueda = campoBusqueda.value.trim();
            if (terminoBusqueda) {
                buscarPeliculas(terminoBusqueda);
            }
        }
    });

    // Manejadores para los botones de género
    botonesGenero.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Actualizar estado visual de los botones
            botonesGenero.forEach(b => b.classList.remove('activo'));
            e.target.classList.add('activo');
            
            // Obtener y buscar películas del género seleccionado
            const generoId = e.target.dataset.genero;
            obtenerPeliculasPorGenero(generoId);
        });
    });
}); 