var Env = require('../config/env.js');

var bitcore = require('bitcore');
var Address = bitcore.Address;
var HDPublicKey = bitcore.HDPublicKey;

var mongoose = require('mongoose');
var PublicKeyRegistration = require('../models/simple/hdPublicKeyRegistration.js');
var Payment = require('../models/simple/payment.js');

var UrlService = require("./urlService.js");

function SimpleService(){

}


function validateBip38PublicKey(hdPublicKeyString){

  try {
    new HDPublicKey(hdPublicKeyString);
  } catch(e) {
    console.log("Invalid HD Public Key string " + hdPublicKeyString);
    return false;
  }

  // Make sure it starts with 'xpub' so that we don't accept som of the other inputs that bitcore does
  if(hdPublicKeyString.substring(0,4) != "xpub"){
    console.log("Unsupported HD Public Key string " + hdPublicKeyString);
    return false;
  }

  // no exception means success
  return true;
}

/**
 * Takes a bip 38 public key string and returns a payment registration object
 */
SimpleService.prototype.registerPublicKey = function(hdPublicKeyString, callback){

   // Make sure the public key was passed in and valid
   if(!validateBip38PublicKey(hdPublicKeyString)){
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
   if(!validateBip38PublicKey(hdPublicKeyString)){
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
            paymentUrl : (new UrlService()).generatePaymentUrl(savedPayment.paymentAddress, amountRequested)
         };

         callback(null, returnedPayment);
         return;
      }

   });

  });

};

module.exports = SimpleService;
