'use strict';

var express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , http = require('http')
  , methodOverride = require('method-override')
  , server;

exports.start = function() {
  // all environments
  app.set('port', process.env.PORT || 2808);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
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

  app.get('/quit', function(req, res) {
    res.status(204).end();
    console.log('Received request to /quit, shutting down.');
    exports.stop();
  });

  // include routes
  app.use(require('./routes'));

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

