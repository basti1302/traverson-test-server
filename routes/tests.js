'use strict';

var express = require('express')
  , router = express.Router()
  , basicAuth = require('basic-auth-connect');

// TODO Break up this huge object into individual routes
var json = {

  root: {
    get: function(req, res) {
      var root = baseUrl(req);
      res.format({

        'application/json': function() {
          res.json({
            'first': root + '/first',
            'second': root + '/second',
            'jsonpath': {
              'nested': { 'key': root + '/third' }
            },
            'auth': root + '/basic/auth',
            'uri_template': root + '/{param}/fixed{/id}',
            'post_link': root + '/postings',
            'put_link': root + '/puttings/42',
            'patch_link': root + '/patch/me',
            'delete_link': root + '/delete/me',
            'blind_alley': root + '/does/not/exist',
            'echo-headers': root + '/echo/headers',
            'echo-query': root + '/echo/query',
            'echo-all': root + '/echo/all',
            'garbage': root + '/junk'
          });
        },

        'application/hal+json': function() {
          res.json({
            '_links': {
              'self': { 'href': '/' },
              'first': { 'href': '/first' }
            },
            'data': 'much'
          });
        }
      });
    }
  },

  first: {
    get: function(req, res) {
      res.format({

        'application/json': function() {
          res.json({ 'first': 'document' });
        },

        'application/hal+json': function() {
          res.json({
            '_links': {
              'self': { 'href': '/first' },
              'second': { 'href': '/second' }
            },
            '_embedded': {
              'contained_resource': {
                '_links' : {
                  'self': { 'href': '/first/contained' },
                  'embedded_link_to_second': { 'href': '/second' }
                },
                'things': 'a lot of'
              }
            },
            'first': 'document'
          });
        }
      });
    }
  },

  second: {
    get: function(req, res) {
      res.format({
        'application/json': function() {
          var root = baseUrl(req);
          res.json({ 'doc': root + '/second/document' });
        },

        'application/hal+json': function() {
          res.json({
            '_embedded': {
              'inside_second': { 'more': 'data' }
            },
            'second': 'document'
          });
        }
      });
    },

    document: {
      get: function(req, res) {
        res.json({ 'second': 'document' });
      }
    }
  },

  third: {
    get: function(req, res) {
      var root = baseUrl(req);
      res.json({ 'third': 'document' });
    }
  },

  auth: {
    get:  function(req, res) {
      res.json({
        'user': 'authenticated'
      });
    }
  },

  uriTemplate: {
    get: function(req, res) {
      res.json({
        'some': 'document',
        'param': req.params[0],
        'id': req.params[1]
      });
    }
  },

  postings: {
    post: function(req, res) {
      if (req.body == null) {
        return res.status(400).json({ message: 'bad request - no body?' });
      }
      res.status(201).json({
        'document': 'created',
        'received': req.body
      });
    }
  },

  puttings: {
    put: function(req, res) {
      if (req.body == null) {
        return res.status(400).json({ message: 'bad request - no body?' });
      }
      res.json({
        'document': 'overwritten',
        'received': req.body
      });
    }
  },

  patchMe: {
    patch: function(req, res) {
      if (req.body == null) {
        return res.status(400).json({ message: 'bad request - no body?' });
      }
      res.json({
        'document': 'patched',
        'received': req.body
      });
    }
  },

  deleteMe: {
    del: function(req, res) {
      res.status(204).end();
    }
  },

  echoHeaders: {
    get: function(req, res) {
      var echo = {};
      Object.keys(req.headers).forEach(function(key) {
        echo[key] = req.headers[key];
      });
      res.json(echo);
    }
  },

  echoQuery: {
    get: function(req, res) {
      var echo = {};
      Object.keys(req.query).forEach(function(key) {
        echo[key] = req.query[key];
      });
      res.json(echo);
    }
  },

  echoAll: {
    get: function(req, res) {
      var echo = {
        headers: {},
        query: {},
      };
      Object.keys(req.headers).forEach(function(key) {
        echo.headers[key] = req.headers[key];
      });
      Object.keys(req.query).forEach(function(key) {
        echo.query[key] = req.query[key];
      });
      res.json(echo);
    },
    post: function(req, res) {
      if (req.body == null) {
        return res.status(400).json({ message: 'bad request - no body?' });
      }
      var echo = {
        headers: {},
        query: {},
      };
      Object.keys(req.headers).forEach(function(key) {
        echo.headers[key] = req.headers[key];
      });
      Object.keys(req.query).forEach(function(key) {
        echo.query[key] = req.query[key];
      });
      echo.received = req.body;
      res.status(201).json(echo);
    }

  },

  junk: {
    get: function(req, res) {
      // serve syntacically incorrect JSON
      res.send('{ this will :: not parse');
    }
  },

  '404': function(req, res) {
    res.status(404).send({ 'message': 'resource not found' });
  }
};

router.get('/', json.root.get);
router.get('/first', json.first.get);
router.get('/second', json.second.get);
router.get('/second/document', json.second.document.get);
router.get('/third', json.third.get);
router.get('/basic/auth', basicAuth('traverson', 'verysecretpassword'),
    json.auth.get);
router.get(/^\/(\w+)\/fixed\/(\w+)?$/, json.uriTemplate.get);
router.post('/postings', json.postings.post);
router.put('/puttings/42', json.puttings.put);
router.patch('/patch/me', json.patchMe.patch);
router.delete('/delete/me', json.deleteMe.del);
router.get('/junk', json.junk.get);
router.get('/echo/headers', json.echoHeaders.get);
router.get('/echo/query', json.echoQuery.get);
router.get('/echo/all', json.echoAll.get);
router.post('/echo/all', json.echoAll.post);
router.get('/does/not/exist', json['404']);

function baseUrl(req) {
  return req.protocol + '://' + req.hostname + ':' + global.port;
}

module.exports = router;
