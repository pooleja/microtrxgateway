/*
var SimpleService = require('../../service/simpleService');
var bitcore = require('bitcore');
var crypto = require('crypto');
var Address = bitcore.Address;
var Env = require('../../config/env.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/microtrxgateway');
var Payment = require('../../models/simple/payment.js');

var svc = new SimpleService();

var version = Env.NETWORK.addressVersion;
var randomBytes = crypto.randomBytes(32);
var privateKey = bitcore.util.sha256(randomBytes);
var key1 = new bitcore.Key();
key1.private = privateKey;
key1.regenerateSync();
var hash = bitcore.util.sha256ripe160(key1.public);
var addr1 = new bitcore.Address(version, hash);

var randomBytes = crypto.randomBytes(32);
var privateKey = bitcore.util.sha256(randomBytes);
var key2 = new bitcore.Key();
key2.private = privateKey;
key2.regenerateSync();
var hash = bitcore.util.sha256ripe160(key2.public);
var addr2 = new bitcore.Address(version, hash);

var addr1Token = "";


describe('SimpleServiceTest', function () {
   describe('registerAddress', function () {

      it('should validate input address null', function (done) {
         svc.registerAddress(null, 0.001, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address null', function (done) {
         svc.registerAddress(undefined, 0.001, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address blank', function (done) {

         svc.registerAddress("", 0.001, function(error, registration){
            error.should.not.be.empty;
            done();
         });

      });

      it('should validate input address asdf', function (done) {

         svc.registerAddress("asdf", 0.001, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate threshold null', function (done) {
         svc.registerAddress(addr1.toString(), null, function(error, registration){
            error.should.not.be.empty;
            done();
         });

      });

      it('should validate threshold 0', function (done) {
         svc.registerAddress(addr1.toString(), 0, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate threshold 1', function (done) {
         svc.registerAddress(addr1.toString(), 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate threshold 0.02', function (done) {
         svc.registerAddress(addr1.toString(), 0.02, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate threshold 0.0001', function (done) {
         svc.registerAddress(addr1.toString(), 0.0001, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate threshold -1', function (done) {
         svc.registerAddress(addr1.toString(), -1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });


      it('should save a registration even if threshold is string', function (done) {
         svc.registerAddress(addr1.toString(), '0.001', function(error, registration){
            (!error || error === null).should.be.true;
            registration.should.be.ok;
            registration.token.should.be.ok;
            registration.address.should.be.ok;
            registration.address.should.equal(addr1.toString());
            registration.threshold.should.equal(0.001);
            addr1Token = registration.token;
            done();
         });

      });

      it('should fail a second a registration', function (done) {

         svc.registerAddress(addr1.toString(), 0.001, function(error, registration){
            error.should.not.be.empty;
            done();
         });

      });
   });


   describe('getPaymentAddress', function () {

      it('should validate input address null', function (done) {
         svc.getPaymentAddress(null, null, 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address blank', function (done) {

         svc.getPaymentAddress("", null, 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address null and empty token', function (done) {
         svc.getPaymentAddress(null, "", 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address blankand empty token', function (done) {

         svc.getPaymentAddress("", "", 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address asdf', function (done) {

         svc.getPaymentAddress("asdf", addr1Token, 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should fail an unknown address', function (done) {
         svc.getPaymentAddress(addr2.toString(), addr1Token, 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should fail a valid address with invalid token', function (done) {
         svc.getPaymentAddress(addr1.toString(), "asdfasdfasdfasdf", 1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should fail a valid address with invalid amount 0', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, 0, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should fail a valid address with invalid amount -1', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, -1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should fail a valid address with invalid amount null', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should fail a valid address with invalid amount 23 million', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, 23000000, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should fail a valid address with invalid amount .0001', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, 0.0001, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should work a known address', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
            (!error || error === null).should.be.true;
            var firstAddress = registration.paymentAddress;
            svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
               var secondAddress = registration.paymentAddress;
               secondAddress.should.not.equal(firstAddress);
               done();
            });

         });
      });

   });



   describe('verifyPayment', function () {

      it('should validate input address null', function (done) {
         svc.verifyPayment(null, null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address blank', function (done) {

         svc.verifyPayment("", null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address asdf', function (done) {

         svc.verifyPayment("asdf", null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });


      it('should validate input timeout -1', function (done) {

         svc.verifyPayment(addr1.toString(), -1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input timeout 61', function (done) {

         svc.verifyPayment(addr1.toString(), 61, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should not accept an unknown address', function (done) {
         var randomBytes = crypto.randomBytes(32);
         var privateKey = bitcore.util.sha256(randomBytes);
         var key2 = new bitcore.Key();
         key2.private = privateKey;
         key2.regenerateSync();
         var hash = bitcore.util.sha256ripe160(key2.public);
         var addr3 = new bitcore.Address(version, hash);

         svc.verifyPayment(addr3.toString(), null, function(error, paymentInfo){
            error.should.not.be.empty;
            done();
         });
      });

      it('should accept a known address but return 0 if no payment was made', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
            (!error || error === null).should.be.true;
            var firstAddress = registration.paymentAddress;
            svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
               var secondAddress = registration.paymentAddress;

               svc.verifyPayment(secondAddress, 0, function(error, paymentInfo){
                   (!error || error === null).should.be.true;

                   paymentInfo.paymentAddress.should.equal(secondAddress);
                   paymentInfo.amountReceived.should.equal(0);
                   paymentInfo.timeout.should.equal(true);

                  done();
               });
            });

         });
      });

      it('should accept a known address but return 0 if no payment was made after a timeout of 1 second', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
            (!error || error === null).should.be.true;
            var firstAddress = registration.paymentAddress;
            svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
               var secondAddress = registration.paymentAddress;

               svc.verifyPayment(secondAddress, 1, function(error, paymentInfo){
                   (!error || error === null).should.be.true;

                   paymentInfo.paymentAddress.should.equal(secondAddress);
                   paymentInfo.amountReceived.should.equal(0);
                   paymentInfo.timeout.should.equal(true);

                  done();
               });
            });

         });
      });

      it('should accept a known address and return manually set value during wait time', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
            (!error || error === null).should.be.true;
            var firstAddress = registration.paymentAddress;
            svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
               var secondAddress = registration.paymentAddress;

               svc.verifyPayment(secondAddress, 1, function(error, paymentInfo){
                   (!error || error === null).should.be.true;

                   paymentInfo.paymentAddress.should.equal(secondAddress);
                   paymentInfo.amountReceived.should.equal(1);
                   paymentInfo.timeout.should.equal(false);

                  done();
               });

               Payment.findOne({paymentAddress: secondAddress}, function(err, currentPayment){
                  currentPayment.amountReceived = 1;
                  currentPayment.save();
               });
            });

         });
      });

      it('should accept a known address and return manually set value if it is over requested amount', function (done) {
         svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
            (!error || error === null).should.be.true;
            var firstAddress = registration.paymentAddress;
            svc.getPaymentAddress(addr1.toString(), addr1Token, 1, function(error, registration){
               var secondAddress = registration.paymentAddress;

               Payment.findOne({paymentAddress: secondAddress}, function(err, currentPayment){
                  currentPayment.amountReceived = 100;
                  currentPayment.save(function (err, tempChannel) {
                     svc.verifyPayment(secondAddress, 0, function(error, paymentInfo){
                         (!error || error === null).should.be.true;

                         paymentInfo.paymentAddress.should.equal(secondAddress);
                         paymentInfo.amountReceived.should.equal(100);
                         paymentInfo.timeout.should.equal(false);

                        done();
                     });
                  });
               });
            });

         });
      });

   });

   describe('getHistory', function () {

      it('should validate input address null', function (done) {
         svc.getHistory(null, null, null, null, function(error, payments){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address blank', function (done) {

         svc.getHistory("", null, null, null, function(error, payments){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address asdf', function (done) {

         svc.getHistory("asdf", null, null, null, function(error, payments){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate token null', function (done) {
         svc.getHistory(addr1.toString(), null, null, null, function(error, payments){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate token blank', function (done) {

         svc.getHistory(addr1.toString(), "", null, null, function(error, payments){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate it cant find an invalid token', function (done) {

         svc.getHistory(addr1.toString(), "asdfasdf", null, null, function(error, payments){
            error.should.not.be.empty;
            done();
         });
      });

      it('should get results for known address and token', function (done) {

         svc.getHistory(addr1.toString(), addr1Token, null, null, function(error, payments){
            payments.should.not.be.empty;
            done();
         });
      });
   });
});
*/
