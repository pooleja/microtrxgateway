var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/examples/simple', function(req, res) {
  res.render('examples/simple', { title: 'Express' });
});

module.exports = router;
