let request = require('request'); // "Request" library

let client_id = '810561a485b14a6fa3d728c0c7b1c444'; // Your client id
let client_secret = '8e6d6ee6a9264a058d59892d55d42705'; // Your secret


let authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};


request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    let token = body.access_token;
    let options = {
      url: 'https://api.spotify.com/v1/users/me',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: true
    };
    request.get(options, function(error, response, body) {
      console.log(body);
    });
  }
});
