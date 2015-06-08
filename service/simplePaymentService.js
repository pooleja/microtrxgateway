var Env = require('../config/env.js');

var bitcore = require('bitcore');
var Address = bitcore.Address;
var HDPublicKey = bitcore.HDPublicKey;

var mongoose = require('mongoose');
var PublicKeyRegistration = require('../models/simple/hdPublicKeyRegistration.js');
var Payment = require('../models/simple/payment.js');

var BitcoinUtil = require("../util/bitcoinUtil.js");
var btcUtil = new BitcoinUtil();

function SimpleService(){

}

/**
 * Takes a bip 38 public key string and returns a payment registration object
 */
SimpleService.prototype.registerPublicKey = function(hdPublicKeyString, wType, callback){

   // Make sure the public key was passed in and valid
   if(!btcUtil.isValidBip38PublicKey(hdPublicKeyString)){
      callback("Invalid HD public key parameter.");
      return;
   }

   console.log("Wallet type: " + wType);

   // Set the wallet type if it is valid
   var walletType = 'bip44';
   if(wType){
     if(wType == 'bip32'){
       walletType = 'bip32';
     }
   }

   console.log("Registering public key "+ hdPublicKeyString);

   // Create a registration object
   var createdRequest = {
      publicKey : hdPublicKeyString,
      walletType : walletType
   };

   // See if the public key is already registered
   PublicKeyRegistration.findOne({publicKey: hdPublicKeyString}, function(err, foundRegistration){

     if (err){

        // Error
        console.log("Failed to search for HD key registration " + err);
        callback("Failed to find Address Registration.");
        return;

     }
     else if (foundRegistration){

       // Success - Key has already been registered
       console.log("Found previous registered HD public key: " + hdPublicKeyString);

       if(foundRegistration.walletType != walletType){
         console.log("Wallet is trying to re-register with different type");
         callback("Wallet was already registered with a different type.  Register with different xpub.");
         return;
       }

       // Create the returned object
       var returnedRegistration = {
          publicKey : foundRegistration.publicKey,
          walletType : foundRegistration.walletType
       };

       callback(null, returnedRegistration);
       return;
     }
     else{

       // Key has not been registered, so go ahead and do so
       PublicKeyRegistration(createdRequest).save(function (err, tempRegistration) {

          if (err){
             console.log("Failed to save HD public key registration " + err);
             callback("Failed to save Address Registration.");
             return;
          }else{

             // Success
             console.log("Successfully saved HD public key register request: " + tempRegistration);

             // Create the returned object
             var returnedRegistration = {
                publicKey : tempRegistration.publicKey,
                walletType : tempRegistration.walletType
             };

             callback(null, returnedRegistration);
             return;
          }
       });
     }

   });

};

/**
 * Takes a registered bip 38 public key string and returns a payment object
 */
SimpleService.prototype.requestPaymentAddress = function(hdPublicKeyString, amountRequested, callback){

  // Make sure the public key was passed in and valid
   if(!btcUtil.isValidBip38PublicKey(hdPublicKeyString)){
      callback("Invalid HD public key parameter.");
      return;
   }

  // Validate the amount requested
  if(amountRequested > 21000000 || amountRequested < 0.00000546 ){
    console.log("Invalid payment request amount passed in: " + amountRequested);
    callback("Invalid amount requested for payment.");
    return;
  }

  // Find the existing registration and update the keyIndex counter by one
  PublicKeyRegistration.findOneAndUpdate( {publicKey : hdPublicKeyString}, {publicKey : hdPublicKeyString, $inc: { keyIndex: 1 } }, { new: true, upsert: false}, function(err, registration){

    // If there was an error or the registration was not found then fail
    if(err || !registration ){
       console.log("Failed to find payment registration for " + hdPublicKeyString + " with error " + err);
       callback("Failed to find existing payment address registration " + hdPublicKeyString);
       return;
    }

    console.log("generating payment address for " +hdPublicKeyString);

    // Generate the newpayment address based on the index from the registration
    var currentHdPukblicKey = new HDPublicKey(hdPublicKeyString);

    // Default to bip32 key derivation
    var derivationKey = currentHdPukblicKey;
    if(registration.walletType == 'bip44'){
      derivationKey = derivationKey.derive(0);
    }

    var derivedAddress = new Address(derivationKey.derive(registration.keyIndex).publicKey, Env.NETWORK);

    // Create the payment object to save
    var createdPayment = {
      hdPublicKey : hdPublicKeyString,
      amountRequested : amountRequested,
      paymentAddress : derivedAddress.toString()
   };

   Payment(createdPayment).save(function (err, savedPayment) {

      if (err){
         console.log("Failed to save payment object " + err);
         callback("Failed to generate payment address for " + hdPublicKeyString);
         return;
      }else{

         // Success
         console.log("Successfully saved payment object: " + hdPublicKeyString + " and address " + savedPayment.paymentAddress);

         // Create the returned object
         var returnedPayment = {
            paymentAddress : savedPayment.paymentAddress,
            paymentUrl : btcUtil.generatePaymentUrl(savedPayment.paymentAddress, amountRequested)
         };

         callback(null, returnedPayment);
         return;
      }

   });

  });

};

/**
 * Verifies whether a payment has been made to the payment address.
 * If valid payment has not been yet recieved it will wait until timeout has expired, checking every second.
 */
SimpleService.prototype.verifyPaymentWithTimeout = function(paymentAddress, timeout, callback){

  console.log("Checking payment");
  console.log(paymentAddress);
  console.log(timeout);

  var svcObj = this;

  // Check for payment
  svcObj.verifyPayment(paymentAddress, function(err, returnedPayment){

    console.log("back from Checking payment");

    // If timeout is still valid and haven't been paid
    if(!err && timeout && timeout > 0 && !returnedPayment.paid){

      console.log("calling set timeout");

      // Wait a second before trying again
      setTimeout(function(){
          svcObj.verifyPaymentWithTimeout(paymentAddress, timeout - 1, callback);
        }, 1000);

    }else{
      console.log("calling callback");
      callback(err, returnedPayment);
    }

  });

};


/**
 * Verifies whether a payment has been made to the payment address
 */
SimpleService.prototype.verifyPayment = function(paymentAddress, callback){

  // Make sure the payment address is valid
  if(!btcUtil.isValidPublicAddress(paymentAddress)){
      callback("Invalid HD public key parameter.");
      return;
  }

  // Find the payment address from a previous request
  Payment.findOne({paymentAddress: paymentAddress}, function(err, foundPayment){

      // Validate if it was found
      if(err || !foundPayment ){
         console.log("Failed to find payment request for " + paymentAddress + " with error " + err);
         callback("Failed to find existing payment address request for " + paymentAddress);
         return;
      }

      var returnedPayment = {
        paymentAddress : foundPayment.paymentAddress,
        amountRequested : foundPayment.amountRequested,
        amountReceived : foundPayment.amountReceived,
        paid : foundPayment.amountReceived >= foundPayment.amountRequested
      };

      callback(null, returnedPayment);
      return;
  });

};

/**
 * Gets payment history records for the public key
 */
SimpleService.prototype.paymentHistory = function(hdPublicKey, page, count, callback){

  // Make sure the public key was passed in and valid
  if(!btcUtil.isValidBip38PublicKey(hdPublicKey)){
     callback("Invalid HD public key parameter.");
     return;
  }

  // Find the key registration
  PublicKeyRegistration.findOne({publicKey: hdPublicKey}, function(err, foundRegistration){

      // Validate if it was found
      if(err || !foundRegistration ){
         console.log("Failed to find registered key " + hdPublicKey + " with error " + err);
         callback("Failed to find existing registered key " + hdPublicKey);
         return;
      }

      var startPage = 1;
      if(page && page > 0)
        startPage = page;

      var countRet = 10;
      if(count && count > 0 && count <= 100)
        countRet = count;

      Payment.paginate({hdPublicKey: hdPublicKey}, startPage, countRet, function(error, pageCount, paginatedResults, itemCount) {
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
  });
};

module.exports = SimpleService;
