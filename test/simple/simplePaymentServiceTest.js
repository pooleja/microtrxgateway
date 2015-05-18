var SimpleService = require('../../service/SimplePaymentService.js');
var bitcore = require('bitcore');
var HDPrivateKey = bitcore.HDPrivateKey;
var crypto = require('crypto');
var Address = bitcore.Address;
var PrivateKey = bitcore.PrivateKey;
var PublicKey = bitcore.PublicKey;
var Env = require('../../config/env.js');

var mongoose = require('mongoose');
mongoose.connect(Env.MONGO_CONNECTION_STRING);
var Payment = require('../../models/simple/payment.js');

var async = require("async");

var svc = new SimpleService();

function updatePaymentAmountReceived(paymentAddress, amount, callback){
   // Find the payment address from a previous request
  Payment.findOne({paymentAddress: paymentAddress}, function(err, foundPayment){

      foundPayment.amountReceived = amount;
      foundPayment.save(function (err, savedPayment) {
         console.log("Updated amountReceived for " + savedPayment.paymentAddress + " to " + savedPayment.amountReceived);
         callback();
      });
  });
}

describe('SimpleServiceTest', function () {

   // Test registering an HD Public key
   describe('registerPublicKey', function () {

      it('should validate input key null', function (done) {
         svc.registerPublicKey(null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key empty', function (done) {
         svc.registerPublicKey("", function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key garbage', function (done) {
         svc.registerPublicKey("gasdfasdf", function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key private key', function (done) {
         svc.registerPublicKey("xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi", function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should register valid public key', function (done) {
         var hdPrivateKey = new HDPrivateKey();

         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);
            done();
         });
      });

      it('should allow duplicate valid public key registrations', function (done) {
         var hdPrivateKey = new HDPrivateKey();

         // First should pass
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Second should succeed as well
            svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
              (!error || error === null).should.be.true;
              registration.publicKey.should.be.ok;
              registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);
               done();
            });
         });
      });
   });


   // Test requesting a Payment Address
   describe('requestPaymentAddress', function () {

      it('should validate input key null', function (done) {
         svc.requestPaymentAddress(null, 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key empty', function (done) {
         svc.requestPaymentAddress("", 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key garbage', function (done) {
         svc.requestPaymentAddress("gasdfasdf", 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key private key', function (done) {
         svc.requestPaymentAddress("xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi", 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate unknown unput public key', function (done) {
         svc.requestPaymentAddress("xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8", 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate bounds on payment amount', function (done) {
         var hdPrivateKey = new HDPrivateKey();

         // Register an address
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Try to request 0
            svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 0, function(error, registration){
               error.should.not.be.empty;

               // Try to request below
               svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 0.000000001 , function(error, registration){
                  error.should.not.be.empty;

                  // Try to request above
                  svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 22000000, function(error, registration){
                     error.should.not.be.empty;
                     done();
                  });
               });
            });

         });
      });

      it('should not find unregistered hd pub key', function (done) {
         var hdPrivateKey = new HDPrivateKey();

         console.log("looking for payment for " + hdPrivateKey.hdPublicKey.xpubkey);

         // Try to request 1 btc payment address
         svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 1, function(error, paymentRequest){
            error.should.not.be.empty;

            done();
         });

      });

      it('valid registered pub key should get payment request and second one should not be equal to first', function (done) {
         var hdPrivateKey = new HDPrivateKey();

         // Register an address
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Try to request 1 btc payment address
            svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 1, function(error, paymentRequest){
               (!error || error === null).should.be.true;
               paymentRequest.paymentAddress.should.not.be.empty;
               paymentRequest.paymentUrl.should.not.be.empty;

               // Try second request for 2 btc
               svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 2, function(error, paymentRequest2){
                  (!error || error === null).should.be.true;
                  paymentRequest2.paymentAddress.should.not.be.empty;
                  paymentRequest2.paymentUrl.should.not.be.empty;

                  paymentRequest2.paymentAddress.should.not.equal(paymentRequest.paymentAddress);

                  done();
               });

            });

         });
      });
   });


   // Test verifying a Payment Address
   describe('verifyPayment', function () {

      it('should validate input key null', function (done) {
         svc.verifyPayment(null, function(error, paymentVerification){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key empty', function (done) {
         svc.verifyPayment("", function(error, paymentVerification){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key garbage', function (done) {
         svc.verifyPayment("gasdfasdf", function(error, paymentVerification){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate payment address was generated from a payment request', function (done) {

         // Generate an address
         var privateKey = new PrivateKey();
         var publicKey = new PublicKey(privateKey);
         var address = new Address(publicKey, Env.NETWORK);

         // Address is randoma and not from a payment request so it should not find it
         svc.verifyPayment(address.toString(), function(error, paymentVerification){
            error.should.not.be.empty;
            done();
         });
      });

      // No payment made yet
      it('should check if a payment was not made yet', function (done) {

         var hdPrivateKey = new HDPrivateKey();

         // Register an address
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Try to request 1 btc payment address
            svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 1, function(error, paymentRequest){
               (!error || error === null).should.be.true;
               paymentRequest.paymentAddress.should.not.be.empty;
               paymentRequest.paymentUrl.should.not.be.empty;

               // No Payment has been set yet, so request should not return an error but should show false as "paid"
               svc.verifyPayment(paymentRequest.paymentAddress, function(error, paymentVerification){
                  (!error || error === null).should.be.true;

                  paymentVerification.paymentAddress.should.equal(paymentRequest.paymentAddress);
                  paymentVerification.amountRequested.should.equal(1);
                  paymentVerification.amountReceived.should.equal(0);
                  paymentVerification.paid.should.equal(false);


                  done();
               });

            });

         });
      });


      // partial payment made
      it('should validate partial payment', function (done) {

         var hdPrivateKey = new HDPrivateKey();

         // Register an address
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Try to request 1 btc payment address
            svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 1, function(error, paymentRequest){
               (!error || error === null).should.be.true;
               paymentRequest.paymentAddress.should.not.be.empty;
               paymentRequest.paymentUrl.should.not.be.empty;

               updatePaymentAmountReceived(paymentRequest.paymentAddress, 0.5, function(){

                  // Only partial payment has been made
                  svc.verifyPayment(paymentRequest.paymentAddress, function(error, paymentVerification){
                     (!error || error === null).should.be.true;

                     paymentVerification.paymentAddress.should.equal(paymentRequest.paymentAddress);
                     paymentVerification.amountRequested.should.equal(1);
                     paymentVerification.amountReceived.should.equal(0.5);
                     paymentVerification.paid.should.equal(false);


                     done();
                  });
               });

            });

         });
      });

      // exact payment made
      it('should validate exact payment', function (done) {

         var hdPrivateKey = new HDPrivateKey();

         // Register an address
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Try to request 1 btc payment address
            svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 1, function(error, paymentRequest){
               (!error || error === null).should.be.true;
               paymentRequest.paymentAddress.should.not.be.empty;
               paymentRequest.paymentUrl.should.not.be.empty;

               updatePaymentAmountReceived(paymentRequest.paymentAddress, 1, function(){

                  // Only partial payment has been made
                  svc.verifyPayment(paymentRequest.paymentAddress, function(error, paymentVerification){
                     (!error || error === null).should.be.true;

                     paymentVerification.paymentAddress.should.equal(paymentRequest.paymentAddress);
                     paymentVerification.amountRequested.should.equal(1);
                     paymentVerification.amountReceived.should.equal(1);
                     paymentVerification.paid.should.equal(true);


                     done();
                  });
               });

            });

         });
      });

      // over payment made
      it('should validate over payment', function (done) {

         var hdPrivateKey = new HDPrivateKey();

         // Register an address
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Try to request 1 btc payment address
            svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 1, function(error, paymentRequest){
               (!error || error === null).should.be.true;
               paymentRequest.paymentAddress.should.not.be.empty;
               paymentRequest.paymentUrl.should.not.be.empty;

               updatePaymentAmountReceived(paymentRequest.paymentAddress, 1.1, function(){

                  // Only partial payment has been made
                  svc.verifyPayment(paymentRequest.paymentAddress, function(error, paymentVerification){
                     (!error || error === null).should.be.true;

                     paymentVerification.paymentAddress.should.equal(paymentRequest.paymentAddress);
                     paymentVerification.amountRequested.should.equal(1);
                     paymentVerification.amountReceived.should.equal(1.1);
                     paymentVerification.paid.should.equal(true);


                     done();
                  });
               });

            });

         });
      });

   });

   // Test requesting a Payment Address
   describe('requestPaymentAddress', function () {

      it('should validate input key null', function (done) {
         svc.paymentHistory(null, 1, 10, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key empty', function (done) {
         svc.paymentHistory("", 1, 10, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key garbage', function (done) {
         svc.paymentHistory("gasdfasdf", 1, 10, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input key private key', function (done) {
         svc.paymentHistory("xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi", 1, 10,
          function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate unknown unput public key', function (done) {
         svc.paymentHistory("xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8", 1, 10,
          function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate a single payment request that was filed', function (done) {

         var hdPrivateKey = new HDPrivateKey();

         // Register an address
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Try to request 1 btc payment address
            svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 1, function(error, paymentRequest){
               (!error || error === null).should.be.true;
               paymentRequest.paymentAddress.should.not.be.empty;
               paymentRequest.paymentUrl.should.not.be.empty;

               updatePaymentAmountReceived(paymentRequest.paymentAddress, 1, function(){

                 // Now request payment history
                 svc.paymentHistory(hdPrivateKey.hdPublicKey.xpubkey, 1, 10, function(error, history){
                   (!error || error === null).should.be.true;
                   history.length.should.equal(1);

                   history[0].paymentAddress.should.equal(paymentRequest.paymentAddress);
                   history[0].amountRequested.should.equal(1);
                   history[0].amountReceived.should.equal(1);

                   done();
                 });

               });

            });

         });
      });

      it('should validate multiple payment requests that were filed', function (done) {

         var hdPrivateKey = new HDPrivateKey();

         // Register an address
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // In parallel request some payment addresses and update the paid values
            async.parallel([
              function(callback){
                // Try to request 1 btc payment address
                svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 1, function(error, paymentRequest){
                   (!error || error === null).should.be.true;
                   paymentRequest.paymentAddress.should.not.be.empty;
                   paymentRequest.paymentUrl.should.not.be.empty;

                   updatePaymentAmountReceived(paymentRequest.paymentAddress, 1, function(){
                      callback(null, {req : paymentRequest, paid : 1});
                   });
                });
              },
              function(callback){
                // Try to request 1 btc payment address
                svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 2, function(error, paymentRequest){
                   (!error || error === null).should.be.true;
                   paymentRequest.paymentAddress.should.not.be.empty;
                   paymentRequest.paymentUrl.should.not.be.empty;

                   updatePaymentAmountReceived(paymentRequest.paymentAddress, 10, function(){
                      callback(null, {req : paymentRequest, paid : 10});
                   });
                });
              },
              function(callback){
                // Try to request 1 btc payment address
                svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 3, function(error, paymentRequest){
                   (!error || error === null).should.be.true;
                   paymentRequest.paymentAddress.should.not.be.empty;
                   paymentRequest.paymentUrl.should.not.be.empty;

                   updatePaymentAmountReceived(paymentRequest.paymentAddress, 3, function(){
                      callback(null, {req : paymentRequest, paid : 3});
                   });
                });
              },
              function(callback){
                // Try to request 1 btc payment address
                svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 4, function(error, paymentRequest){
                   (!error || error === null).should.be.true;
                   paymentRequest.paymentAddress.should.not.be.empty;
                   paymentRequest.paymentUrl.should.not.be.empty;

                   updatePaymentAmountReceived(paymentRequest.paymentAddress, 4, function(){
                      callback(null, {req : paymentRequest, paid : 4});
                   });
                });
              },
              function(callback){
                // Try to request 1 btc payment address
                svc.requestPaymentAddress(hdPrivateKey.hdPublicKey.xpubkey, 5, function(error, paymentRequest){
                   (!error || error === null).should.be.true;
                   paymentRequest.paymentAddress.should.not.be.empty;
                   paymentRequest.paymentUrl.should.not.be.empty;

                   updatePaymentAmountReceived(paymentRequest.paymentAddress, 0, function(){
                      callback(null, {req : paymentRequest, paid : 0});
                   });
                });
              },
            ], function(err, results){

              // Now request payment history
              svc.paymentHistory(hdPrivateKey.hdPublicKey.xpubkey, 1, 10, function(error, history){
                (!error || error === null).should.be.true;
                history.length.should.equal(results.length);

                // Results are in reverse order
                for (var i = 0; i < results.length; i++) {
                  history[i].paymentAddress.should.equal(results[4 - i].req.paymentAddress);
                  history[i].amountRequested.should.equal(5 - i);
                  history[i].amountReceived.should.equal(results[ 4 - i].paid);
                }

                done();
              });


            });

         });
      });


  });

});
