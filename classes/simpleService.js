var bitcore = require('bitcore');
var Address = bitcore.Address;
var crypto = require('crypto');

var mongoose = require('mongoose');
var AddressRegistration = require('../models/simple/addressRegistration.js');

function SimpleService(){

}

/**
 * Takes a public address string and returns a payment registration object
 */
SimpleService.prototype.registerAddress = function(publicAddressString, callback){

   // Make sure the public address was passed in
   if(publicAddressString === null || publicAddressString === ''){
      callback("publicAddress parameter must not be empty.");
      return;
   }

   // Make sure the address is valid
   var publicAddress = new Address(publicAddressString);
   if(!publicAddress.isValid()){
      callback("publicAddress is invalid Bitcoin address.");
      return;
   }

   // Create a registration object with a random token
   var createdRequest = {
      address : publicAddressString,
      secretToken : crypto.randomBytes(32).toString('hex'),
   };

   AddressRegistration(createdRequest).save(function (err, tempChannel) {

      if (err){
         console.log("Failed to save Address registration " + err);
         // Failure
         callback("Failed to save Address Registration.");
      }else{

         // Success
         callback(null, createdRequest);
      }
   });

};

/**
 * Takes a public address string, verifies it exists, then creates and saves a payment request for that address in the db.
 */
SimpleService.prototype.getPaymentAddress = function(publicAddressString, callback){

   // Make sure the public address was passed in
   if(publicAddressString === null || publicAddressString === ''){
      callback("publicAddress parameter must not be empty.");
      return;
   }

   // Make sure the address is valid
   var publicAddress = new Address(publicAddressString);
   if(!publicAddress.isValid()){
      callback("publicAddress is invalid Bitcoin address.");
      return;
   }

   console.log("searching for " + publicAddressString);

   // Find the corresponding payment address registration
   AddressRegistration.findOne({address: publicAddressString}, function(err, currentReg){
      if(err || !currentReg ){
         console.log("Failed to find payment registration for " + publicAddressString + " with error " + err);
         callback("Failed to find existing payment address registration " + publicAddressString);
      } else {

         // Generate a new payment address from the HD wallet
         // Save the payment address combo
         // Return the new payment address combo
         callback();
      }
   });

};

module.exports = SimpleService;
