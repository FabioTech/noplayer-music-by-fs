    
    let videos = [], lastIds = [], position = 0, player;

    const PLAYLIST_ID = "PLeRB90AMH9_UheMdsk-DaUPzDMlqougvk";
    const API_KEY = "AIzaSyDaHEmQpkWJs_GkFjJuQoucV8TSJr4GT_k";

    function loadPlaylist(pageToken = "") {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&pageToken=${pageToken}&maxResults=50&playlistId=${PLAYLIST_ID}&fields=items/contentDetails/videoId,nextPageToken&key=${API_KEY}`;

        return fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Erro ao buscar dados da API");
                return response.json();
            })
            .then(data => {
                const ids = data.items.map(item => item.contentDetails.videoId);
                videos.push(...ids);
                if (data.nextPageToken) {
                    return loadPlaylist(data.nextPageToken);
                }
            });
    }

    function makeVideo(videoId, autoplay = false) {
        if (player) {
            player.loadVideoById(videoId);
        } else {
            player = new YT.Player('output', {
                height: window.innerHeight,
                width: window.innerWidth,
                videoId,
                playerVars: {
                    autoplay: autoplay ? 1 : 0,
                    rel: 0,
                    vq: 'large'
                },
                events: {
                    'onStateChange': (event) => {
                        if (event.data === YT.PlayerState.ENDED) nextVideo();
                    }
                }
            });
        }
    }

function nextVideo() {
    if (position > 0) {
        position--;
        makeVideo(lastIds[position], false);
    } else {
        videoMove('out');
        player.pauseVideo();
    }
}


    function videoMove(direction) {
        document.getElementById('output').style.left = (direction === 'in') ? '0%' : '100%';
    }

    function onYouTubeIframeAPIReady() {
        const index = Math.floor(Math.random() * videos.length);
        const firstId = videos[index];
        lastIds.push(firstId);
        makeVideo(firstId);
    }

    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    $(document).ready(() => {
        $('#nextBtn').on('click', nextVideo);
        $('#lastBtn').on('click', lastVideo);
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        loadPlaylist().then(() => {
            console.log(`Vídeos carregados: ${videos.length}`);
        }).catch(err => console.error(err));
    });
    
