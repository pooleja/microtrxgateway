var express = require('express');
var router = express.Router();

var bitcore = require('bitcore');
var Env = require('../config/env.js');

var isTestNet = Env.NETWORK == bitcore.Networks.testnet;

var pageData = { navColor : Env.NAV_BAR_COLOR , showTestNetWarning : isTestNet};

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', pageData);
});


router.get('/examples/simple', function(req, res) {
  res.render('examples/simple', pageData);
});

router.get('/examples/video', function(req, res) {
  res.render('examples/video', pageData);
});

router.get('/examples/paywall', function(req, res) {
  res.render('examples/paywall', pageData);
});

router.get('/code', function(req, res) {
  res.render('code', pageData);
});

router.get('/api', function(req, res) {
  res.render('api', pageData);
});

router.get('/about', function(req, res) {
  res.render('about', pageData);
});

module.exports = router;
