(function() {
    function getHashParams() {
        let hashParams = {};
        let e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    let params = getHashParams();
    let access_token = params.access_token
    //console.log(access_token)
    let topCanciones = JSON.parse(params.top_tracks);
    let contenedor = document.getElementById('contenedorCanciones');
    //console.log(topCanciones)
    let MusicaTiempo = document.getElementById('totalTiempo');
    let compararMusica=0;
    let artistaCuenta = {};
    let nombresDiv = document.getElementById('nombres');
    let contador=1

    for (let i = 0; i < topCanciones.length; i++) {
        let cancion = topCanciones[i];
        let nombreCancion = cancion.name;
        let album = cancion.album;
        let artistas = cancion.artists;
        let duracionMs = cancion.duration_ms;
        let convertirMin = Math.floor(duracionMs / 60000);
        let duracionSec = Math.floor((duracionMs % 60000) / 1000);
        compararMusica+=convertirMin*60+duracionSec

        for (let j = 0; j < artistas.length; j++) {
            let artist = artistas[j].name;
            if (artistaCuenta[artist]) {
                artistaCuenta[artist]++;
            } else {
                artistaCuenta[artist] = 1;
            }
        }
        let nombreCancionP = document.createElement('p');
        nombreCancionP.innerText = nombreCancion;
        nombreCancionP.classList.add('text-sm', 'text-white', 'mb-2', 'hover:text-blue-700');
        nombresDiv.appendChild(nombreCancionP);

        let cancionImp = document.createElement('div');
        cancionImp.innerHTML = `
        <div class="inline-block flex items-center justify-center space-x-8 max-w-sm rounded overflow-hidden shadow-lg">
          <div class="inline-block flex items-center justify-center space-x-8 max-w-sm rounded overflow-hidden shadow-lg border rounded-l-lg rounded-lg bg-gradient-to-r from-green-700 from-10% via-green-600 via-40% to-green-400 to-90%">
            <div class="flex-shrink-0 w-48 h-48 bg-gray-400 rounded overflow-hidden mr-4">
              <div class="flex items-center justify-center h-full mr-4">
                <p class="mr-4"></p>
                <p class="mr-4 text-white">${contador}</p>
                <img src="${album.images[0].url}" alt="Album Art" class="object-contain max-h-full rounded-l-lg rounded-r-md" width="130px">
              </div>
            </div>
            <div class="space-y-4 text-center mr-4">
            <br>
              <h2 class="">${cancion.name}</h2>
              <p>Artistas: ${artistas.map(artist => artist.name).join(', ')}</p>
              <p>Duración: ${convertirMin} minutos con ${duracionSec.toString().padStart(2, '0')} segundos</p>
              <div class="flex items-center justify-center">
                <audio src="${cancion.preview_url}" controls class="text-center justify-center items-center"></audio>
              </div>
              <br>
            </div>
            <img src="spotify-icons-logos/spotify-icons-logos/icons/02_CMYK/02_PNG/Spotify_Icon_CMYK_Black.png" alt="logo" width="40px" class="mr-4">
          </div>
        </div>
        <br>

        `;
        contenedor.appendChild(cancionImp);
        contador++
    }

    let total= document.createElement('p')
    let totalTiempo=Math.floor(compararMusica/60)
    let totalSec= compararMusica%60
    total.innerText=`${totalTiempo} minutos con ${totalSec} segundos`
    MusicaTiempo.appendChild(total)

    let ArtistaEscuchado = '';
    let cuenta = 0;
    for (let artist in artistaCuenta) {
        if (artistaCuenta[artist] > cuenta) {
            cuenta = artistaCuenta[artist];
            ArtistaEscuchado = artist;
        }
    }

    let topArtista = document.createElement('p');
    topArtista.innerText = `\nArtista más escuchado por ti:
    ${ArtistaEscuchado} con ${cuenta} canciones escuchadas\n`;

    MusicaTiempo.appendChild(topArtista);

    let imgEscuchado=document.createElement('div');
    imgEscuchado.innerHTML= `
    <div class="flex items-center justify-center h-full flex-col">
      <br>
      <p class="mb-2">Portada de la canción más escuchada</p>
      
      <img src="${topCanciones[0].album.images[0].url}" alt="Artista Album" class="flex items-center justify-center h-full rounded-l-lg rounded-r-md" width="160px">
    </div>`
    MusicaTiempo.appendChild(imgEscuchado)

    const token = access_token;

    async function fetchWebApi(endpoint, method, body) {
        const res = await fetch(`https://api.spotify.com/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            method,
            body: JSON.stringify(body)
        });
        return await res.json();
    }

    const cancionUri = [];

    for (let i = 0; i < topCanciones.length; i++) {
        const cancionAgregar = topCanciones[i];
        const uri = cancionAgregar.uri;
        cancionUri.push(uri);
    }

    async function createPlaylist(tracksUri) {
        const {id: user_id} = await fetchWebApi('v1/me', 'GET')

        const playlist = await fetchWebApi(
            `v1/users/${user_id}/playlists`, 'POST', {
                "name": "Sonidos de identidad - explorando mis melodías",
                "description": "50 canciones cuidadosamente seleccionadas por ti, un increíble recorrido musical con la forma en que cada uno resuena en el mundo, tus melodías vibrantes hasta ritmos magicos, las canciones capturan la esencia de quiénes somos y expresamos a través del sonido ¡Déjate llevar por tu increíble selección musical y déjate envolver por tu propia melodía!",
                "public": false
            })
        await fetchWebApi(
            `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`,
            'POST'
        );
        return playlist;
    }
    document.getElementById('crear').addEventListener('click', async () => {
        const createdPlaylist = await createPlaylist(cancionUri);
    });
})()