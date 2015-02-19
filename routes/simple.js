var express = require('express');
var router = express.Router();
var SimpleService = require('../service/simplePaymentService');
var service = new SimpleService();
/**
 * Request handler for POST to /addresses.
 *
 * Handler will create a new payment address using the public address specified in the POST data.
 */
router.post('/keys', function(req, res) {

   service.registerPublicKey(req.body.publicKey, function(error, registration){

     console.log(req.body.publicKey);

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

   service.requestPaymentAddress(req.query.publicKey, req.query.amountRequested, function(error, paymentAddress){

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

   service.verifyPayment(req.params.paymentAddress, function(error, verification){

      // Check for failure
      if(error){
         res.json ( {success : "false", error: error});
         return;
      }

      // Success
      res.json({success : "true", result: verification});
   });
});

router.get('/keys/:key/history', function(req, res) {

   service.paymentHistory(req.params.key, req.query.page, req.query.total, function(error, verification){

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
