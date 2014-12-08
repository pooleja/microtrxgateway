var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


router.get('/examples/simple', function(req, res) {
  res.render('examples/simple', { title: 'Express' });
});

router.get('/code', function(req, res) {
  res.render('code', { title: 'Express' });
});

router.get('/api', function(req, res) {
  res.render('api', { title: 'Express' });
});

router.get('/about', function(req, res) {
  res.render('about', { title: 'Express' });
});

module.exports = router;
