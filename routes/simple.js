var express = require('express');
var router = express.Router();
var service = require('../classes/simpleService');

/**
 * Request handler for POST to /addresses.
 *
 * Handler will create a new payment address using the public address specified in the POST data.
 */
router.post('/addresses', function(req, res) {

   service.registerAddress(req.body.publicAddress, function(error, registration){

      // Check for failure
      if(error){
         res.json ( {success : "false", error: error});
         return;
      }

      // Success
      res.json({success : "true", result: registration});
   });
});

router.get('/payments', function(req, res) {

   service.getPaymentAddress(req.query.publicAddress, function(error, paymentAddress){

      // Check for failure
      if(error){
         res.json ( {success : "false", error: error});
         return;
      }

      // Success
      res.json({success : "true", result: paymentAddress});
   });
});


module.exports = router;
