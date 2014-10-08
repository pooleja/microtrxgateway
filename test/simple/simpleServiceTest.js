var SimpleService = require('../../service/simpleService');
var bitcore = require('bitcore');
var crypto = require('crypto');
var Address = bitcore.Address;
var Env = require('../../config/env.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/microtrxgateway');


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


describe('SimpleServiceTest', function () {
   describe('registerAddress', function () {

      it('should validate input address null', function () {
         svc.registerAddress(null, function(error, registration){
            error.should.not.be.empty;
         });
      });

      it('should validate input address blank', function () {

         svc.registerAddress("", function(error, registration){
            error.should.not.be.empty;
         });

      });

      it('should validate input address asdf', function () {

         svc.registerAddress("asdf", function(error, registration){
            error.should.not.be.empty;
         });
      });

      it('should save a registration', function () {
         svc.registerAddress(addr1.toString(), function(error, registration){
            (!error || error === null).should.be.true;
            registration.should.be.ok;
            registration.secretToken.should.be.ok;
            registration.address.should.be.ok;
            registration.address.should.equal(addr1.toString());
         });

      });

      it('should fail a second a registration', function () {

         svc.registerAddress(addr1.toString(), function(error, registration){
            error.should.not.be.empty;
         });

      });
   });

   describe('getPaymentAddress', function () {

      it('should validate input address null', function () {
         svc.getPaymentAddress(null, function(error, registration){
            error.should.not.be.empty;
         });
      });

      it('should validate input address blank', function () {

         svc.getPaymentAddress("", function(error, registration){
            error.should.not.be.empty;
         });
      });

      it('should validate input address asdf', function () {

         svc.getPaymentAddress("asdf", function(error, registration){
            error.should.not.be.empty;
         });
      });

      it('should fail an unknown address', function (done) {
         svc.getPaymentAddress(addr2.toString(), function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should work a known address', function (done) {
         svc.getPaymentAddress(addr1.toString(), function(error, registration){
            (!error || error === null).should.be.true;
            var firstAddress = registration.paymentAddress;
            svc.getPaymentAddress(addr1.toString(), function(error, registration){
               var secondAddress = registration.paymentAddress;
               secondAddress.should.not.equal(firstAddress);
               done();
            });

         });
      });

   });



   describe('verifyPayment', function () {

      it('should validate input address null', function (done) {
         svc.verifyPayment(null, null, null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address blank', function (done) {

         svc.verifyPayment("", null, null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input address asdf', function (done) {

         svc.verifyPayment("asdf", null, null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input amount -1', function (done) {

         svc.verifyPayment(addr1.toString(), -1, null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input amount 23000000', function (done) {

         svc.verifyPayment(addr1.toString(), 23000000, null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input timeout -1', function (done) {

         svc.verifyPayment(addr1.toString(), 1, -1, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });

      it('should validate input timeout 61', function (done) {

         svc.verifyPayment(addr1.toString(), 1, 61, function(error, registration){
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

         svc.verifyPayment(addr3.toString(), null, null, function(error, registration){
            error.should.not.be.empty;
            done();
         });
      });



   });
});
