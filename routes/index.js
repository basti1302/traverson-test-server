'use strict';

var express = require('express')
  , router = express.Router();

router.use('/', require('./tests'));
router.use('/maze', require('./maze'));

module.exports = router;
