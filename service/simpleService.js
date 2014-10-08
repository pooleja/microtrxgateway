var bitcore = require('bitcore');
var Address = bitcore.Address;
var crypto = require('crypto');
var HierarchicalKey = bitcore.HierarchicalKey;

var mongoose = require('mongoose');
var AddressRegistration = require('../models/simple/addressRegistration.js');
var Payment = require('../models/simple/payment.js');
var Counter = require('../models/counter.js');
var Keys = require('../config/keys.js');
var Env = require('../config/env.js');

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
         callback("Failed to save Address Registration.");
         return;
      }else{

         // Success
         console.log("Successfully created Request: " + createdRequest);
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
         return;
      } else {

         // Generate a new payment address from the HD wallet
         var query = Counter.findOneAndUpdate( {name : 'address_index'}, {name : 'address_index', $inc: { next: 1 } }, { new: true, upsert: true}, function(err, result){

             if (err) {
                 console.error('Counter save error: ' + err);
                 callback("Internal Server Error: Failed to generate address.");
                 return;
             }

             // Generate the key from the counter index using HD keys
             var addressIndex = result.next;
             var hkey = new HierarchicalKey(Keys.extendedPublicKeyString);
             var generatedAddress = Address.fromPubKey(hkey.derive('m/' + addressIndex).eckey.public, Env.NETWORK.name).toString();

             var createdPayment = {
               clientAddress : publicAddressString,
               paymentAddress : generatedAddress,
               amountReceived : 0,
               keyId : addressIndex
            };

            // Save the payment address combo
            Payment(createdPayment).save(function (err, tempPayment) {
               if (err){
                  console.log("Failed to save payment" + err);
                  callback("Failed to save Payment.");
                  return;
               }else{

                  // Create the returned new payment address object
                  var returnVal = {
                     paymentAddress : tempPayment.paymentAddress
                  };

                  console.log("Successfully created paymentAddress: " + returnVal);

                  // Success
                  callback(null, returnVal);
               }
            });

         });

      }
   });

};

function getBalance(payment, amount, timeout, callback){

  Payment.findOne({paymentAddress: payment.paymentAddress}, function(err, currentPayment){
    if(err || !currentPayment ){
         console.log("Failed to find payment request for " + paymentAddressString + " with error " + err);
         callback("Failed to find existing payment request for " + paymentAddressString);
         return;
      } else {

        var returnVal = {
             paymentAddress : currentPayment.paymentAddress,
             amountReceived : currentPayment.amountReceived
          };

        if(currentPayment.amountReceived >= amount){

          // Payment has been made
          returnVal.timeout = false;
          callback(null, returnVal);

        }
        else if (timeout > 0){

          // Wait and check again in a second
          timeout = timeout - 1;
          setTimeout(function(){
            getBalance(payment, amount, timeout, callback);
          }, 1000);
        }
        else{

          // Timed out after waiting
          returnVal.timeout = true;
          callback(null, returnVal);
        }
      }
  });
}


SimpleService.prototype.verifyPayment = function(paymentAddressString, amount, timeout, callback){

  // Make sure the public address was passed in
  if(paymentAddressString === null || paymentAddressString === ''){
    callback("publicAddress parameter must not be empty.");
    return;
  }

  // Make sure the address is valid
  var paymentAddress = new Address(paymentAddressString);
  if(!paymentAddress.isValid()){
    callback("paymentAddress is invalid Bitcoin address.");
    return;
  }

  // Make sure the amount requested is in a valid range
  if(amount && (amount < 0 || amount > 21000000)){
    callback("Amount is invalid value.");
    return;
  }

  // Make sure the timeout requested is in a valid range
  if(timeout && (timeout < 0 || timeout > 60)){
    callback("Timeout is invalid value.");
    return;
  }

  Payment.findOne({paymentAddress: paymentAddress}, function(err, currentPayment){
    if(err || !currentPayment ){
         console.log("Failed to find payment request for " + paymentAddressString + " with error " + err);
         callback("Failed to find existing payment request for " + paymentAddressString);
         return;
      } else {

        getBalance(currentPayment, amount, timeout, callback);
      }
  });

};


SimpleService.prototype.getHistory = function(publicAddressString, token, callback){

  // Make sure the public address was passed in
  if(publicAddressString === null || publicAddressString === ''){
    callback("publicAddress parameter must not be empty.");
    return;
  }

  // Make sure the address is valid
  var publicAddress = new Address(publicAddressString);
  if(!publicAddress.isValid()){
    callback("paymentAddress is invalid Bitcoin address.");
    return;
  }

  // Make sure the token was passed in
  if(token === null || token === ''){
    callback("token parameter must not be empty.");
    return;
  }

  // Search for the address registration with matching token
  AddressRegistration.findOne({address: publicAddressString, token : token}, function(err, currentPayment){

    if(err || !currentPayment ){
       console.log("Failed to find payment registration for " + publicAddressString + " with error " + err);
       callback("Failed to find address or invalid token for " + publicAddressString);
       return;
    } else {



    }
  });

};

module.exports = SimpleService;
