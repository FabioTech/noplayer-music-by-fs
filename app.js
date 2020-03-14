$(document).ready(function () {
    var videos = [];
    var dingsda;
    var lastIds = [];
    var position = 0;
    $('#nextBtn').click(function () {
        nextVideo();
    });
    $('#lastBtn').click(function () {
        lastVideo();
    });

    if (position == 0) {
        videoMove('out');
    } else {
        videoMove('in');
    }

    var result = null;
    $.ajax({
        type: "GET",
        url: "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=PLeRB90AMH9_UheMdsk-DaUPzDMlqougvk&fields=items/contentDetails/videoId,nextPageToken&key=AIzaSyDaHEmQpkWJs_GkFjJuQoucV8TSJr4GT_k",
        async: false,
        success: function (data) {
            result = data;
        }
    });

    for (var i = 0; i < 50; i++) {
        videos.push(result.items[i].contentDetails.videoId);
    }
    nextOne(result.nextPageToken);

    console.log("Amount: " + videos.length);

    var nbr = Math.floor((Math.random() * videos.length) + 1);
    lastIds.push(videos[nbr]);
    makeVideo(videos[nbr]);

    function nextOne(token) {
        if (token) {
            var json;
            $.ajax({
                type: "GET",
                url: "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&pageToken=" + token + "&maxResults=50&playlistId=PLeRB90AMH9_UheMdsk-DaUPzDMlqougvk&fields=items/contentDetails/videoId,nextPageToken&key=AIzaSyDaHEmQpkWJs_GkFjJuQoucV8TSJr4GT_k",
                async: false,
                success: function (data) {
                    json = data;
                }
            });
            try {
                for (var i = 0; i < 50; i++) {
                    videos.push(json.items[i].contentDetails.videoId);
                }
                nextOne(json.nextPageToken);
            } catch (err) {
                console.log('No more Videos');
            }
        } else {
            console.log('No more Videos');
        }
    }

    function makeVideo(id) {
        if ($('#output').is('iframe')) {
            dingsda.loadVideoById(id);
        } else {
            if (position == 0) {
                var player;
                window.onYouTubePlayerAPIReady = function () {
                    player = new YT.Player('output', {
                        width: $(window).width(),
                        height: $(window).height(),
                        videoId: id,
                        playerVars: {
                            rel: 0,
                            vq: 'large'
                        },
                        events: {
                            onStateChange: onPlayerStateChange
                        }
                    });
                    dingsda = player;
                }
            } else {
                var player;
                window.onYouTubePlayerAPIReady = function () {
                    player = new YT.Player('output', {
                        width: $(window).width(),
                        height: $(window).height(),
                        videoId: id,
                        playerVars: {
                            autoplay: 1,
                            rel: 0,
                            vq: 'large'
                        },
                        events: {
                            onStateChange: onPlayerStateChange
                        }
                    });
                    dingsda = player;
                }
            }
        }

        function onPlayerStateChange(event) {
            if (event.data === 0) {
                nextVideo();
            }
        }
        return;
    }

    function onPlayerStateChange(event) {
        if (event.data === 0) {
            nextVideo();
        }
    }

    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    function nextVideo() {
        if (position == 0) {
            videoMove('in');
            position += 1;
            dingsda.playVideo();
            return false;
        }
        if (position < lastIds.length - 1) {
            videoMove('in');
            position += 1;
            nextId = lastIds[position];
            makeVideo(nextId);
        } else {
            videoMove('in');
            var nbr = Math.floor((Math.random() * videos.length) + 1);
            lastIds.push(videos[nbr]);
            position += 1;
            makeVideo(videos[nbr]);
        }
    }

    function lastVideo() {
        if (position > 1) {
            position -= 1;
            videoBefore = lastIds[position-1];
            makeVideo(videoBefore);
        } else {
            if (position == 1) {
                position -= 1;
            }
            videoMove('out');
            dingsda.pauseVideo();
        }
    }

    function videoMove(way) {
        if (way == 'in') {
            console.log('Moved In');
            $("#output").animate({
                left: "0%",
            }, 500);
        } else if (way == 'out') {
            console.log('Moved Out');
            $("#output").animate({
                left: "100%",
            }, 500);
        }
    }
});