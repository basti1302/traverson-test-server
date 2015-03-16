'use strict';

var express = require('express')
  , app = express()
  , basicAuth = require('basic-auth-connect')
  , bodyParser = require('body-parser')
  , http = require('http')
  , json = require('./routes')
  , methodOverride = require('method-override')
  , server;

exports.start = function() {
  // all environments
  app.set('port', process.env.PORT || 2808);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded());
  app.use(methodOverride());

  app.all('*', function(req, res, next) {
    res.header({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, ' +
        'Authorization, Accept, X-Traverson-Test-Header',
      'Access-Control-Allow-Methods':
        'HEAD, GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Max-Age': '86400' // 24 hours
    });
    next();
  });

  // TODO Create a proper sub router and have only one app.use statement here.
  app.get('/', json.root.get);
  app.get('/first', json.first.get);
  app.get('/second', json.second.get);
  app.get('/second/document', json.second.document.get);
  app.get('/third', json.third.get);
  app.get('/basic/auth', basicAuth('traverson', 'verysecretpassword'),
      json.auth.get);
  app.get(/^\/(\w+)\/fixed\/(\w+)?$/, json.uriTemplate.get);
  app.post('/postings', json.postings.post);
  app.put('/puttings/42', json.puttings.put);
  app.patch('/patch/me', json.patchMe.patch);
  app.delete('/delete/me', json.deleteMe.del);
  app.get('/junk', json.junk.get);
  app.get('/echo/headers', json.echoHeaders.get);
  app.get('/echo/query', json.echoQuery.get);
  app.get('/echo/all', json.echoAll.get);
  app.post('/echo/all', json.echoAll.post);
  app.get('/does/not/exist', json['404']);

  app.use('/maze', require('./routes/maze'));

  app.get('/quit', function(req, res) {
    res.status(204).end();
    console.log('Received request to /quit, shutting down.');
    exports.stop();
  });

  global.port = app.get('port');

  server = http.createServer(app);
  server.listen(app.get('port'), function() {
    console.log('Traverson test server listening on port ' + app.get('port'));
  });
};

exports.stop = function() {
  console.log('Stopping Traverson test server.');
  server.close();
};

exports.serveStatic = function(dir) {
  app.use('/static', express.static(dir));
}

