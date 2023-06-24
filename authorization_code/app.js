let express = require('express');
let request = require('request');
let cors = require('cors');
let querystring = require('querystring');
let cookieParser = require('cookie-parser');

let client_id = '810561a485b14a6fa3d728c0c7b1c444';
let client_secret = '8e6d6ee6a9264a058d59892d55d42705';
let redirect_uri = 'http://localhost:8888/callback';

let randomString = function(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let stateKey = 'spotify_auth_state';

let app = express();

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

app.get('/login', function(req, res) {
  let state = randomString(16);
  res.cookie(stateKey, state);
  let scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
        show_dialog: 'true'
      }));
});

app.get('/callback', function(req, res) {
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
  } else {
    res.clearCookie(stateKey);
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        let access_token = body.access_token,
            refresh_token = body.refresh_token;
        let options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        request.get(options, function(error, response, body) {
          let userData = JSON.stringify(body);
          let musics = {
            url: 'https://api.spotify.com/v1/me/top/tracks',
            headers: { 'Authorization': 'Bearer ' + access_token },
            qs: { 'time_range': 'medium_term', 'limit': 50},
            json: true
          };
          request.get(musics, function(error, response, body) {
            if (!error && response.statusCode === 200) {

              let topTracks = JSON.stringify(body.items);
              console.log(topTracks)
              res.redirect('/profile.html#' + querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token,
                top_tracks: topTracks,
              }));
            } else {
              res.redirect('/' +
                  querystring.stringify({
                    error: 'token_invalido'
                  }));
            }
          });
        });
      } else {
        res.redirect('/' +
            querystring.stringify({
              error: 'usuario_no-Autorizado'
            }));
      }
    });

  }
});

app.get('/logout', function(req, res) {
  res.clearCookie(stateKey);
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('state')
  res.redirect('/');
});

app.get('/refresh_token', function(req, res) {
  let refresh_token = req.query.refresh_token;
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});



console.log('Listening on 8888');
app.listen(8888);