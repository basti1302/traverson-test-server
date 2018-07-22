'use strict';

var express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , cors = require('cors')
  , http = require('http')
  , methodOverride = require('method-override')
  , server;

exports.start = function() {
  // all environments
  app.set('port', process.env.PORT || 2808);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.text({ type: 'text/plain' }));
  app.use(methodOverride());

  // enable CORS header
  app.use(cors({
    credentials: true,
    origin: 'http://localhost:' + app.get('port'),
    exposedHeaders: ['Location'],
  }));
  // enable pre-flight for put/patch/delete
  app.options('*', cors());

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

