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

router.get('/payments/:paymentAddress', function(req, res) {

   service.verifyPayment(req.params.paymentAddress, req.query.amount, req.query.timeout, function(error, verification){

      // Check for failure
      if(error){
         res.json ( {success : "false", error: error});
         return;
      }

      // Success
      res.json({success : "true", result: verification});
   });
});

router.get('/payments/:paymentAddress/history', function(req, res) {

   service.getHistory(req.params.paymentAddress, req.query.token, req.query.page, req.query.total, function(error, verification){

      // Check for failure
      if(error){
         res.json ( {success : "false", error: error});
         return;
      }

      // Success
      res.json({success : "true", result: verification});
   });
});


module.exports = router;
