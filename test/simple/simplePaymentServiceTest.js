var SimpleService = require('../../service/SimplePaymentService.js');
var bitcore = require('bitcore');
var HDPrivateKey = bitcore.HDPrivateKey;
var crypto = require('crypto');
var Address = bitcore.Address;
var Env = require('../../config/env.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/microtrxgateway');
var Payment = require('../../models/simple/payment.js');

var svc = new SimpleService();

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

      it('should fail duplicate valid public key registrations', function (done) {
         var hdPrivateKey = new HDPrivateKey();

         // First should pass
         svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
            (!error || error === null).should.be.true;
            registration.publicKey.should.be.ok;
            registration.publicKey.should.equal(hdPrivateKey.hdPublicKey.xpubkey);

            // Second should fail
            svc.registerPublicKey(hdPrivateKey.hdPublicKey.xpubkey, function(error, registration){
               error.should.not.be.empty;
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

});
