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
SimpleService.prototype.registerPublicKey = function(hdPublicKeyString, callback){

   // Make sure the public key was passed in and valid
   if(!btcUtil.isValidBip38PublicKey(hdPublicKeyString)){
      callback("Invalid HD public key parameter.");
      return;
   }

   console.log("Registering public key "+ hdPublicKeyString);

   // Create a registration object
   var createdRequest = {
      publicKey : hdPublicKeyString
   };

   PublicKeyRegistration(createdRequest).save(function (err, tempRegistration) {

      if (err){
         console.log("Failed to save HD public key registration " + err);
         callback("Failed to save Address Registration.  Ensure this key has not already been registered.");
         return;
      }else{

         // Success
         console.log("Successfully saved HD public key register request: " + tempRegistration);

         // Create the returned object
         var returnedRegistration = {
            publicKey : tempRegistration.publicKey,
         };

         callback(null, returnedRegistration);
         return;
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
  if(amountRequested > 21000000 || amountRequested < 0.0000546 ){
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
    var derivedAddress = new Address(currentHdPukblicKey.derive(registration.keyIndex).publicKey, Env.NETWORK);

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

module.exports = SimpleService;
