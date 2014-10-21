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


function validateAddress(addressString){

  if(!addressString || addressString === null || addressString === ''){
      return false;
   }

   var address = new Address(addressString);
   if(!address.isValid()){
      return false;
   }

   return true;
}

/**
 * Takes a public address string and returns a payment registration object
 */
SimpleService.prototype.registerAddress = function(publicAddressString, callback){

   // Make sure the public address was passed in and valid
   if(!validateAddress(publicAddressString)){
      callback("Invalid public address parameter.");
      return;
   }

   // Create a registration object with a random token
   var createdRequest = {
      address : publicAddressString,
      token : crypto.randomBytes(32).toString('hex'),
   };

   AddressRegistration(createdRequest).save(function (err, tempRegistration) {

      if (err){
         console.log("Failed to save Address registration " + err);
         callback("Failed to save Address Registration.");
         return;
      }else{

         // Success
         console.log("Successfully created Request: " + tempRegistration);

         // Create the returned object
         var returnedRegistration = {
            address : tempRegistration.address,
            token : tempRegistration.token
         };

         callback(null, returnedRegistration);
      }
   });

};

/**
 * Takes a public address string, verifies it exists, then creates and saves a payment request for that address in the db.
 */
SimpleService.prototype.getPaymentAddress = function(publicAddressString, token, amountRequested, callback){

   // Make sure the public address was passed in and valid
   if(!validateAddress(publicAddressString)){
      callback("Invalid public address parameter.");
      return;
   }

   // Make sure the token was passed in
   if(!token || token === null || token === ''){
      callback("token parameter must not be empty.");
      return;
   }

     // Make sure the amountRequested requested is in a valid range
  if(!amountRequested || (amountRequested && (amountRequested < Env.MIN_SIMPLE_PAYMENT_AMOUNT || amountRequested > 21000000))){
    callback("Amount is invalid value.");
    return;
  }

   console.log("searching for " + publicAddressString);

   // Find the corresponding payment address registration
   AddressRegistration.findOne({address: publicAddressString, token: token}, function(err, currentReg){
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
               amountRequested : amountRequested,
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

function getBalance(payment, timeout, callback){

  Payment.findOne({paymentAddress: payment.paymentAddress}, function(err, currentPayment){
    if(err || !currentPayment ){
         console.log("Failed to find payment request for " + paymentAddressString + " with error " + err);
         callback("Failed to find existing payment request for " + paymentAddressString);
         return;
      } else {

        var returnVal = {
             paymentAddress : currentPayment.paymentAddress,
             amountReceived : currentPayment.amountReceived,
             amountRequested : currentPayment.amountRequested,
          };

        if(currentPayment.amountReceived >= payment.amountRequested){

          // Payment has been made
          returnVal.paid = true;
          returnVal.timeout = false;
          callback(null, returnVal);

        }
        else if (timeout > 0){

          // Wait and check again in a second
          timeout = timeout - 1;
          setTimeout(function(){
            getBalance(payment, timeout, callback);
          }, 1000);
        }
        else{

          // Timed out after waiting
          returnVal.timeout = true;
          returnVal.paid = false;
          callback(null, returnVal);
        }
      }
  });
}


SimpleService.prototype.verifyPayment = function(paymentAddressString, timeout, callback){


  // Make sure the payment address was passed in and valid
   if(!validateAddress(paymentAddressString)){
      callback("Invalid payment address parameter.");
      return;
   }

  // Make sure the timeout requested is in a valid range
  if(timeout && (timeout < 0 || timeout > 60)){
    callback("Timeout is invalid value.");
    return;
  }

  Payment.findOne({paymentAddress: paymentAddressString}, function(err, currentPayment){
    if(err || !currentPayment ){
         console.log("Failed to find payment request for " + paymentAddressString + " with error " + err);
         callback("Failed to find existing payment request for " + paymentAddressString);
         return;
      } else {

        getBalance(currentPayment, timeout, callback);
      }
  });

};


SimpleService.prototype.getHistory = function(publicAddressString, token, page, total, callback){

  // Make sure the public address was passed in and valid
   if(!validateAddress(publicAddressString)){
      callback("Invalid public address parameter.");
      return;
   }

  // Make sure the token was passed in
  if(token === null || token === ''){
    callback("token parameter must not be empty.");
    return;
  }

  console.log("Finding registration with address: " + publicAddressString +  " and token:" + token);

  // Search for the address registration with matching token
  AddressRegistration.findOne({address: publicAddressString, token : token}, function(err, currentRegistration){

    if(err || !currentRegistration ){
       console.log("Failed to find payment registration for " + publicAddressString + " with error " + err);
       callback("Failed to find address or invalid token for " + publicAddressString);
       return;
    } else {

      var startPage = 1;
      if(page && page > 0)
        startPage = page;

      var countRet = 10;
      if(total && total > 0 && total <= 100)
        countRet = total;

      Payment.paginate({clientAddress: publicAddressString}, startPage, countRet, function(error, pageCount, paginatedResults, itemCount) {
        if (error) {
          console.log("Failed to find payment history for " + publicAddressString + " with error " + err);
           callback("Failed to find history for " + publicAddressString);
           return;
        } else {

          var retList = [];
          paginatedResults.map( function(item) {
            var temp = {
              paymentAddress: item.paymentAddress,
              amountRequested : item.amountRequested,
              amountReceived: item.amountReceived
            };

            retList.push(temp);
          });

          callback(null, retList);
        }
      }, { sortBy : { '_id' : -1 } });

    }

  });

};

module.exports = SimpleService;
