var SimpleService = require('../../classes/simpleService');
var bitcore = require('bitcore');
var Address = bitcore.Address;

var dbURI    = 'mongodb://localhost/microtrxgateway'
  , mongoose = require('mongoose')
  , clearDB  = require('mocha-mongoose')(dbURI)
;

mongoose.connect(dbURI);

var svc = new SimpleService();


describe('registerAddress', function () {

   it('should validate input address', function (done) {


      svc.registerAddress(null, function(error, registration){
         error.should.not.be.empty;
      });

      svc.registerAddress("", function(error, registration){
         error.should.not.be.empty;
      });

      svc.registerAddress("asdf", function(error, registration){
         error.should.not.be.empty;
      });

      done();
   });

   it('should save a registration', function (done) {
      svc.registerAddress("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", function(error, registration){
         console.log("after register error: " + error);
         console.log("after register registration: " + JSON.stringify(registration));
         (!error || error === null).should.be.true;
         registration.should.be.ok;
         registration.secretToken.should.be.ok;
         registration.address.should.be.ok;
         registration.address.should.equal("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");
      });

      svc.registerAddress("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", function(error, registration){
         console.log("Registration should fail the second time: " + error);
         error.should.not.be.empty;
      });

      done();
   });
});

describe('getPaymentAddress', function () {

   it('should validate input address', function (done) {
      svc.getPaymentAddress(null, function(error, registration){
         error.should.not.be.empty;
      });

      svc.getPaymentAddress("", function(error, registration){
         error.should.not.be.empty;
      });

      svc.getPaymentAddress("asdf", function(error, registration){
         error.should.not.be.empty;
      });

      done();
   });

   it('should fail an unknown address', function (done) {
      svc.getPaymentAddress("13sZJfzSttfAJXn3XBus6nPJ3aHKoVQ8sQ", function(error, registration){
         error.should.not.be.empty;
      });

      done();
   });
});
