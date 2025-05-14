
$(document).ready(function () {
    const videos = [];
    let player;
    const lastIds = [];
    let position = 0;

    const playlistId = "PLbpi6ZahtOH7DrxWUmkwvsXnFeCfB5LUp";
    const apiKey = "AIzaSyDaHEmQpkWJs_GkFjJuQoucV8TSJr4GT_k";

    $('#nextBtn').on('click', nextVideo);
    $('#lastBtn').on('click', lastVideo);

    function videoMove(direction) {
        const left = direction === 'in' ? "0%" : "100%";
        $("#output").animate({ left }, 500);
    }

    if (position === 0) {
        videoMove('out');
    }

    async function fetchVideos(pageToken = '') {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${pageToken ? '&pageToken=' + pageToken : ''}`;
        try {
            const response = await fetch(url);
            const contentType = response.headers.get("content-type");
            if (!contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error("Resposta inválida: " + text);
            }
            const data = await response.json();
            data.items.forEach(item => videos.push(item.contentDetails.videoId));
            if (data.nextPageToken) {
                await fetchVideos(data.nextPageToken);
            }
        } catch (err) {
            console.error("Erro ao buscar vídeos:", err.message);
        }
    }

    async function init() {
        await fetchVideos();
        console.log(`Vídeos carregados: ${videos.length}`);
        const randomIndex = Math.floor(Math.random() * videos.length);
        const videoId = videos[randomIndex];
        lastIds.push(videoId);
        loadYouTubeAPI(() => makeVideo(videoId));
    }

    function loadYouTubeAPI(callback) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        window.onYouTubePlayerAPIReady = callback;
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    function makeVideo(videoId) {
        if (player && player.loadVideoById) {
            player.loadVideoById(videoId);
        } else {
            player = new YT.Player('output', {
                width: $(window).width(),
                height: $(window).height(),
                videoId: videoId,
                playerVars: {
                    autoplay: position !== 0 ? 1 : 0,
                    rel: 0,
                    vq: 'large'
                },
                events: {
                    onStateChange: onPlayerStateChange
                }
            });
        }
    }

    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
            nextVideo();
        }
    }

    function nextVideo() {
        if (position === 0) {
            videoMove('in');
            position++;
            player.playVideo();
        } else if (position < lastIds.length - 1) {
            position++;
            makeVideo(lastIds[position]);
        } else {
            const randomIndex = Math.floor(Math.random() * videos.length);
            const newId = videos[randomIndex];
            lastIds.push(newId);
            position++;
            makeVideo(newId);
        }
    }

    function lastVideo() {
        if (position > 1) {
            position--;
            makeVideo(lastIds[position - 1]);
        } else if (position === 1) {
            position--;
            videoMove('out');
            player.pauseVideo();
        }
    }

    init();
});
