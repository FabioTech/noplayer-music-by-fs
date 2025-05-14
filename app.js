<script>
$(document).ready(function () {
    const videos = [];
    let dingsda;
    const lastIds = [];
    let position = 0;

    const playlistId = "PLeRB90AMH9_UheMdsk-DaUPzDMlqougvk";
    const apiKey = "AIzaSyDaHEmQpkWJs_GkFjJuQoucV8TSJr4GT_k";

    $('#nextBtn').on('click', nextVideo);
    $('#lastBtn').on('click', lastVideo);

    if (position === 0) {
        videoMove('out');
    } else {
        videoMove('in');
    }

    async function fetchVideos(pageToken = "") {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            data.items.forEach(item => videos.push(item.contentDetails.videoId));
            if (data.nextPageToken) {
                await fetchVideos(data.nextPageToken);
            }
        } catch (error) {
            console.error("Erro ao buscar vídeos:", error);
        }
    }

    async function init() {
        await fetchVideos();
        console.log("Total de vídeos carregados:", videos.length);

        const randomIndex = Math.floor(Math.random() * videos.length);
        lastIds.push(videos[randomIndex]);
        loadYouTubeAPI(() => makeVideo(videos[randomIndex]));
    }

    function loadYouTubeAPI(callback) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        window.onYouTubePlayerAPIReady = callback;
        document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, null);
    }

    function makeVideo(videoId) {
        if (typeof dingsda !== 'undefined' && dingsda.loadVideoById) {
            dingsda.loadVideoById(videoId);
        } else {
            dingsda = new YT.Player('output', {
                width: $(window).width(),
                height: $(window).height(),
                videoId,
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
            dingsda.playVideo();
        } else if (position < lastIds.length - 1) {
            position++;
            makeVideo(lastIds[position]);
        } else {
            const randomIndex = Math.floor(Math.random() * videos.length);
            lastIds.push(videos[randomIndex]);
            position++;
            makeVideo(videos[randomIndex]);
        }
    }

    function lastVideo() {
        if (position > 1) {
            position--;
            makeVideo(lastIds[position - 1]);
        } else if (position === 1) {
            position--;
            videoMove('out');
            dingsda.pauseVideo();
        }
    }

    function videoMove(direction) {
        const leftValue = direction === 'in' ? "0%" : "100%";
        console.log(`Moved ${direction}`);
        $("#output").animate({ left: leftValue }, 500);
    }

    init(); // Start
});
</script>
