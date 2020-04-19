'use strict';

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ReactRouter = ReactRouter;
var Route = _ReactRouter.Route;
var Router = _ReactRouter.Router;
var Link = _ReactRouter.Link;
var hashHistory = _ReactRouter.hashHistory;
var IndexRoute = _ReactRouter.IndexRoute;

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/* @store */

var Store = function () {
  function Store() {
    _classCallCheck(this, Store);

    this.track = {};
    this.audio = new Audio();
  }

  Store.prototype.setTrack = function setTrack(track) {
    this.track = track;
  };

  return Store;
}();

/* @classes */

var Notifier = function () {
  function Notifier() {
    _classCallCheck(this, Notifier);

    this.listeners = {};
  }

  Notifier.prototype.on = function on(event, cb) {
    this.listeners[event] = cb;
  };

  Notifier.prototype.emit = function emit(event, data, ctx) {
    this.listeners[event](data);
  };

  return Notifier;
}();

var API = function () {
  function API(baseUrl) {
    _classCallCheck(this, API);

    this.baseUrl = baseUrl;
  }

  API.prototype.addQueryString = function addQueryString(obj) {
    var query = '?';
    Object.keys(obj).forEach(function (key) {
      query += key + '=' + encodeURIComponent(obj[key]) + '&';
    });
    return query;
  };

  API.prototype.post = function post(_ref) {
    var url = _ref.url;
    var data = _ref.data;
    var _ref$headers = _ref.headers;
    var headers = _ref$headers === undefined ? {} : _ref$headers;
    var fullUrl = _ref.fullUrl;

    return $.ajax({ url: fullUrl || this.baseUrl + '/' + url, data: data, headers: headers, method: 'POST' });
  };

  API.prototype.get = function get(_ref2) {
    var url = _ref2.url;
    var data = _ref2.data;
    var _ref2$headers = _ref2.headers;
    var headers = _ref2$headers === undefined ? {} : _ref2$headers;

    var full_url = this.baseUrl + '/' + url + this.addQueryString(data);
    return $.ajax({ url: full_url, headers: headers });
  };

  return API;
}();

var SpotifyWrapper = function (_API) {
  _inherits(SpotifyWrapper, _API);

  function SpotifyWrapper(url, _ref3) {
    var clientID = _ref3.clientID;
    var clientSecret = _ref3.clientSecret;

    _classCallCheck(this, SpotifyWrapper);

    var _this = _possibleConstructorReturn(this, _API.call(this, url));

    _this.clientID = clientID;
    _this.clientSecret = clientSecret;
    _this.accessToken = null;
    _this.getAccess().then(function (data) {
      if (!data) {
        return;
      }
      _this.accessToken = Object.assign({}, JSON.parse(data), { last_accessed: new Date() });
    });
    return _this;
  }

  SpotifyWrapper.prototype.getAccess = function getAccess() {
    return this.post({
      fullUrl: 'https://spotifyapi-shajevpfxk.now.sh/api/spotify_auth',
      data: {
        client_id: this.clientID,
        client_secret: this.clientSecret
      }
    });
  };

  SpotifyWrapper.prototype.findTrack = function findTrack(_ref4) {
    var artist = _ref4.artist;
    var track = _ref4.track;

    if (this.accessToken === null) {
      return new Promise(function (res, rej) {
        return rej('No access token could be found');
      });
    }
    return this.get({
      url: 'search/',
      data: {
        q: '' + track,
        type: 'track'
      },
      headers: {
        Authorization: 'Bearer ' + this.accessToken.access_token
      }
    }).then(this.renderTrack.bind(this));
  };

  SpotifyWrapper.prototype.renderTrack = function renderTrack(_ref5) {
    var tracks = _ref5.tracks;

    return new Promise(function (res, rej) {
      if (!tracks.items.length) {
        return rej('Nenhuma faixa encontrada.');
      }
      var items = tracks.items;
      var _items$ = items[0];
      var artists = _items$.artists;
      var preview_url = _items$.preview_url;
      var name = _items$.name;
      var uri = _items$.uri;
      var duration_ms = _items$.duration_ms;
      var _items$0$album = items[0].album;
      var album_name = _items$0$album.name;
      var album_images = _items$0$album.images;

      res({
        artists: artists, name: name, preview_url: preview_url, uri: uri,
        duration_ms: duration_ms, album_name: album_name, album_images: album_images
      });
    });
  };

  return SpotifyWrapper;
}(API);

var GeniusWrapper = function (_API2) {
  _inherits(GeniusWrapper, _API2);

  function GeniusWrapper(url, accessToken) {
    _classCallCheck(this, GeniusWrapper);

    var _this2 = _possibleConstructorReturn(this, _API2.call(this, url));

    _this2.accessToken = accessToken;
    return _this2;
  }

  GeniusWrapper.prototype.search = function search(_ref6) {
    var lyrics = _ref6.lyrics;

    return this.get({
      url: 'search',
      data: {
        q: lyrics,
        access_token: this.accessToken
      }
    }).then(this.renderResult.bind(this));
  };

  GeniusWrapper.prototype.renderResult = function renderResult(_ref7) {
    var response = _ref7.response;
    var hits = response.hits;

    return new Promise(function (res, rej) {
      if (!hits.length) {
        return rej('Nenhum resultado encontrado');
      }
      var result = hits[0].result;
      var title = result.title;
      var full_title = result.full_title;
      var primary_artist = result.primary_artist;
      var image_url = primary_artist.image_url;
      var name = primary_artist.name;

      res({ title: title, full_title: full_title, image_url: image_url, name: name });
    });
  };

  return GeniusWrapper;
}(API);

var store = new Store();
var notifier = new Notifier();
var genius = new GeniusWrapper('https://api.genius.com', 'FP1iS4rK0KY5KjIWgiTm8_isdKljuuO9XTl0Plv6QN51Opm2nuTRwAcMlFspxLvS');
var spotify = new SpotifyWrapper('https://api.spotify.com/v1', {
  clientID: '6b43eb7913014cbb893e85efaf4de1c7',
  clientSecret: 'c760e41e65e74a89b2731d6d143196d7'
});

/* @bridge function */
function getTrack(lyrics, success, progress, fail) {
  progress('Buscando "' + lyrics + '"');
  genius.search({
    lyrics: lyrics
  }).then(function (_ref8) {
    var title = _ref8.title;
    var image_url = _ref8.image_url;
    var name = _ref8.name;

    progress('Encontrar músicas com letras semelhantes!');
    spotify.findTrack({
      artist: name,
      track: title
    }).then(function (track) {
      progress('Encontrei uma música adequada!');
      success(track, image_url);
    }).fail(function (msg) {
      return fail({ text: msg, status: 'error' });
    });
  }).fail(function (msg) {
    return fail({ text: msg, status: 'error' });
  });
}

/* @components */

var DeferImage = function (_React$Component) {
  _inherits(DeferImage, _React$Component);

  function DeferImage(props) {
    _classCallCheck(this, DeferImage);

    var _this3 = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this3.state = { src: '', prevSrc: '' };
    return _this3;
  }

  DeferImage.prototype.render = function render() {
    var _this4 = this;

    if (this.props.src !== undefined && this.props.src !== this.state.prevSrc) {
      this.setState({ prevSrc: this.props.src });
      var image = new Image();
      image.src = this.props.src;
      image.onload = function () {
        _this4.setState({ src: _this4.props.src });
      };
    }
    return React.createElement('img', {
      src: this.state.src,
      ref: function ref(el) {
        return $(el).delay(10).fadeIn(parseInt(_this4.props.fade));
      }
    });
  };

  return DeferImage;
}(React.Component);

var NotificationDisplay = function (_React$Component2) {
  _inherits(NotificationDisplay, _React$Component2);

  function NotificationDisplay(props) {
    _classCallCheck(this, NotificationDisplay);

    return _possibleConstructorReturn(this, _React$Component2.call(this, props));
  }

  NotificationDisplay.prototype.render = function render() {
    var notificationClass = '';
    if (this.props.message && this.props.message.hasOwnProperty('status')) {
      notificationClass = 'notification notification-' + this.props.message.status;
    }
    return React.createElement(
      'div',
      { className: notificationClass },
      this.props.message && this.props.message.text
    );
  };

  return NotificationDisplay;
}(React.Component);

var App = function (_React$Component3) {
  _inherits(App, _React$Component3);

  function App(props) {
    _classCallCheck(this, App);

    var _this6 = _possibleConstructorReturn(this, _React$Component3.call(this, props));

    _this6.state = { message: {} };
    notifier.on('update', _this6.updateStatus.bind(_this6));
    return _this6;
  }

  App.prototype.updateStatus = function updateStatus(message) {
    this.setState({ message: message });
    this.resetStatus();
  };

  App.prototype.resetStatus = function resetStatus() {
    var _this7 = this;

    setTimeout(function () {
      _this7.setState({ message: {} });
    }, 2500);
  };

  App.prototype.render = function render() {
    return React.createElement(
      'div',
      null,
      React.createElement(NotificationDisplay, { message: this.state.message }),
      React.createElement(
        ReactCSSTransitionGroup,
        {
          component: 'div',
          transitionEnter: true,
          transitionAppear: true,
          transitionEnterTimeout: 1000,
          transitionLeaveTimeout: 500,
          transitionName: 'example' },
        this.props.children ? React.cloneElement(this.props.children, {
          key: this.props.location.pathname
        }) : null
      )
    );
  };

  return App;
}(React.Component);

var DisplayLyrics = function (_React$Component4) {
  _inherits(DisplayLyrics, _React$Component4);

  function DisplayLyrics(props) {
    _classCallCheck(this, DisplayLyrics);

    return _possibleConstructorReturn(this, _React$Component4.call(this, props));
  }

  DisplayLyrics.prototype.render = function render() {
    var lyrics = 'Olá, clique no microfone, fale a letra, álbum ou artista.';
    if (this.props.lyrics !== '') {
      lyrics = this.props.lyrics;
    }
    return React.createElement(
      'div',
      { className: 'display-lyrics' },
      lyrics && lyrics.split(' ').map(function (lyric) {
        return React.createElement(
          'span',
          { className: 'display-lyric' },
          lyric
        );
      })
    );
  };

  return DisplayLyrics;
}(React.Component);

var Home = function (_React$Component5) {
  _inherits(Home, _React$Component5);

  function Home(props) {
    _classCallCheck(this, Home);

    var _this9 = _possibleConstructorReturn(this, _React$Component5.call(this, props));

    _this9.state = {
      listening: false,
      loading: false,
      loadingStatus: '',
      lyrics: ''
    };
    try {
      _this9.setupRecognition();
    } catch (e) {
      hashHistory.push('/support');
    }
    return _this9;
  }

  Home.prototype.setupRecognition = function setupRecognition() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.onresult = this.renderLyrics.bind(this);
    this.recognition.onnomatch = this.sendNotification.bind(this);
    this.recognition.onerror = this.sendNotification.bind(this);
  };

  Home.prototype.renderLyrics = function renderLyrics(e) {
    var _this10 = this;

    var interimScript = '';
    var results = [].slice.apply(e.results);
    results.forEach(function (result) {
      var transcript = result[0].transcript;

      if (result.isFinal) {
        _this10.recognition.stop();
        interimScript += transcript;
        _this10.toggleLoading(true);
        getTrack(interimScript, _this10.toResultsView.bind(_this10), _this10.setLoadingMessage.bind(_this10), _this10.sendNotification.bind(_this10));
        interimScript = '';
      } else {
        interimScript += transcript;
      }
    });
    this.updateLyrics(interimScript);
  };

  Home.prototype.updateLyrics = function updateLyrics(userLyrics) {
    this.setState({ lyrics: userLyrics });
  };

  Home.prototype.resetLyrics = function resetLyrics() {
    this.recognition.abort();
    this.toggleLoading(false);
    this.setState({ listening: false, lyrics: '' });
  };

  Home.prototype.listenForLyrics = function listenForLyrics() {
    if (this.state.listening) {
      this.setState({ listening: false });
      this.recognition.stop();
    } else {
      this.setState({ listening: true });
      this.recognition.start();
    }
  };

  Home.prototype.sendNotification = function sendNotification(message) {
    notifier.emit('update', message);
    if (message.status === 'error') {
      this.toggleLoading(false);
      this.setState({ listening: false });
    }
  };

  Home.prototype.toggleLoading = function toggleLoading(status) {
    this.setState({ loading: status });
  };

  Home.prototype.setLoadingMessage = function setLoadingMessage(msg) {
    this.setState({ loadingStatus: msg });
  };

  Home.prototype.toResultsView = function toResultsView(track, image_url) {
    track.image_url = image_url;
    this.toggleLoading(false);
    store.setTrack(track);
    hashHistory.push('/result');
  };

  Home.prototype.render = function render() {
    var _this11 = this;

    function slashMic(state, isListening) {
      return function () {
        var icon = $('#record').find('i');
        if (isListening && state) {
          icon.addClass('fa-microphone-slash');
        } else if (!state) {
          icon.removeClass('fa-microphone-slash');
        }
      };
    }
    return React.createElement(
      'div',
      { className: 'home' },
      React.createElement(
        'div',
        {
          className: 'record-partial',
          style: { 'display': this.state.loading ? 'none' : 'block' } },
        React.createElement(DisplayLyrics, { lyrics: this.state.lyrics }),
        React.createElement(
          'button',
          {
            id: 'record',
            onClick: function onClick() {
              return _this11.listenForLyrics();
            },
            onMouseOver: slashMic(true, this.state.listening),
            onMouseOut: slashMic(false, this.state.listening),
            className: this.state.listening ? 'btn-mic pulse' : 'btn-mic' },
          React.createElement('i', { className: 'fa fa-microphone' })
        ),
        React.createElement(
          'div',
          { className: 'btn-container' },
          React.createElement(
            'button',
            { onClick: function onClick() {
                return _this11.resetLyrics();
              }, className: 'btn' },
            React.createElement('i', { className: 'fa fa-repeat' }),
            React.createElement(
              'span',
              null,
              'Limpar busca'
            )
          )
        )
      ),
      React.createElement(
        'div',
        {
          className: 'loading-partial',
          style: { 'display': this.state.loading ? 'block' : 'none' } },
        React.createElement(
          'div',
          { className: 'loader-container' },
          React.createElement('div', { className: 'loader' })
        ),
        React.createElement(
          'p',
          { className: 'loader-status' },
          this.state.loadingStatus
        )
      )
    );
  };

  return Home;
}(React.Component);

var MusicPlayer = function (_React$Component6) {
  _inherits(MusicPlayer, _React$Component6);

  function MusicPlayer(props) {
    _classCallCheck(this, MusicPlayer);

    var _this12 = _possibleConstructorReturn(this, _React$Component6.call(this, props));

    _this12.state = { current: 0, prevSrc: '', interval: {}, playing: false };
    return _this12;
  }

  MusicPlayer.prototype.componentDidUpdate = function componentDidUpdate(_ref9) {
    var src = _ref9.src;

    if (src !== this.state.prevSrc) {
      this.state.prevSrc = this.props.src;
      store.audio.src = this.props.src;
      store.audio.play();
      this.setState({ playing: !store.audio.paused });
    }
  };

  MusicPlayer.prototype.componentWillUnmount = function componentWillUnmount() {
    clearInterval(this.state.interval);
  };

  MusicPlayer.prototype.componentWillMount = function componentWillMount() {
    this.updateProgress();
  };

  MusicPlayer.prototype.controlAudio = function controlAudio() {
    store.audio.paused ? this.play() : this.pause();
  };

  MusicPlayer.prototype.play = function play() {
    store.audio.play();
    this.setState({ playing: true });
  };

  MusicPlayer.prototype.pause = function pause() {
    store.audio.pause();
    this.setState({ playing: false });
  };

  MusicPlayer.prototype.updateProgress = function updateProgress() {
    this.state.interval = setInterval(function () {
      var state = {
        current: store.audio.currentTime / store.audio.duration * 100
      };
      if (state.current === 100) {
        state.playing = false;
      }
      this.setState(state);
    }.bind(this), 1000);
  };

  MusicPlayer.prototype.render = function render() {
    var _this13 = this;

    return React.createElement(
      'div',
      { className: 'audio-player' },
      React.createElement(
        'div',
        { className: 'audio-bar' },
        React.createElement('div', {
          className: 'audio-progress',
          style: { width: this.state.current + '%' } })
      ),
      React.createElement(
        'div',
        { className: 'audio-controls' },
        React.createElement('button', {
          id: 'audio-play-pause',
          className: this.state.playing ? 'btn-control pause' : 'btn-control play',
          onClick: function onClick() {
            return _this13.controlAudio();
          } })
      )
    );
  };

  return MusicPlayer;
}(React.Component);

var Results = function (_React$Component7) {
  _inherits(Results, _React$Component7);

  function Results(props) {
    _classCallCheck(this, Results);

    var _this14 = _possibleConstructorReturn(this, _React$Component7.call(this, props));

    _this14.state = {
      track: {
        artists: [],
        album_images: []
      }
    };
    return _this14;
  }

  Results.prototype.componentDidMount = function componentDidMount() {
    this.setState({
      track: store.track
    });
  };

  Results.prototype.toHomeView = function toHomeView() {
    store.audio.pause();
    hashHistory.push('/');
  };

  Results.prototype.render = function render() {
    var _this15 = this;

    var _state$track = this.state.track;
    var name = _state$track.name;
    var artists = _state$track.artists;
    var album_images = _state$track.album_images;
    var image_url = _state$track.image_url;
    var album_name = _state$track.album_name;

    var img = 'https://placehold.it/200x200';
    if (album_images.length) {
      img = album_images[0].url;
    }
    return React.createElement(
      'div',
      { className: 'results-view' },
      React.createElement(
        'div',
        { className: 'track-blur-container' },
        React.createElement(
          'div',
          { className: 'clipped-image-blur' },
          React.createElement(DeferImage, { src: img, placehold: 'https://placehold.it/200x200', fade: '2000' })
        )
      ),
      React.createElement(
        'div',
        { className: 'track-container' },
        React.createElement(
          'div',
          {
            className: 'track-album-cover',
            style: { backgroundImage: 'url(' + img + ')' } },
          React.createElement('div', { className: 'track-album-overlay' }),
          React.createElement(
            'div',
            { className: 'track-singer-img-container' },
            React.createElement(DeferImage, { src: image_url, placehold: 'https://placehold.it/200x200', fade: '1750' })
          )
        ),
        React.createElement(MusicPlayer, { src: this.state.track.preview_url }),
        React.createElement(
          'div',
          { className: 'track-info' },
          React.createElement(
            'h5',
            { className: 'track-album' },
            album_name
          ),
          React.createElement(
            'h3',
            { className: 'track-title' },
            name
          ),
          React.createElement(
            'div',
            { className: 'track-singer' },
            artists.map(function (artist, i) {
              return React.createElement(
                'div',
                { key: i },
                React.createElement(
                  'p',
                  null,
                  artist.name
                )
              );
            })
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'btn-container' },
        React.createElement(
          'button',
          { onClick: this.toHomeView, className: 'btn' },
          React.createElement('i', { className: 'fa fa-repeat' }),
          React.createElement(
            'span',
            null,
            'Tente novamente'
          )
        ),
        React.createElement(
          'button',
          {
            onClick: function onClick() {
              return window.open('https://noplayer.com.br/',artist.name);
            },
            className: 'btn btn-spotify' },
          React.createElement('i', { className: 'fa fa-search' }),
          React.createElement(
            'span',
            null,
            'Abrir em #Noplayer'
          )
        )
      )
    );
  };

  return Results;
}(React.Component);

var Support = function Support() {
  return React.createElement(
    'div',
    { className: 'support-view' },
    React.createElement(
      'h1',
      null,
      'Oh, this is a bit awkward.'
    ),
    React.createElement(
      'p',
      null,
      'You\'ll need Chrome or Opera to use this app.'
    ),
    React.createElement(
      'p',
      null,
      'Unfortunately, not supported *yet* on iPhone or iPad.'
    ),
    React.createElement(
      'button',
      {
        onClick: function onClick() {
          return window.open('https://www.google.com/chrome/');
        },
        className: 'btn' },
      React.createElement('i', { className: 'fa fa-chrome' }),
      React.createElement(
        'span',
        null,
        'Download Chrome'
      )
    )
  );
};

/**
 * @router
 */
ReactDOM.render(React.createElement(
  Router,
  { history: hashHistory },
  React.createElement(
    Route,
    { path: '/', component: App },
    React.createElement(IndexRoute, { component: Home }),
    React.createElement(Route, { path: '/result', component: Results })
  ),
  React.createElement(Route, { path: '/support', component: Support })
), document.getElementById('app'));
