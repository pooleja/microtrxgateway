var express = require('express');
var router = express.Router();
var SimpleService = require('../service/simplePaymentService');
var service = new SimpleService();

/**
 * Handler will register a new public key for payments
 */
router.post('/keys', function(req, res) {

   service.registerPublicKey(req.body.publicKey, req.body.walletType, function(error, registration){

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

/**
 * Handler will create a new payment address using the public key specified
 */
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

/**
 * Handler will check to see if payment has been made.  Will retry until timeout is 0 if specified.
 */
router.get('/payments/:paymentAddress', function(req, res) {

   service.verifyPaymentWithTimeout(req.params.paymentAddress, req.query.timeout, function(error, verification){

      // Check for failure
      if(error){
         res.json ( {success : "false", error: error});
         return;
      }

      // Success
      res.json({success : "true", result: verification});
   });
});

/**
 * Handler will return a list of payment requests and statuses
 */
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
