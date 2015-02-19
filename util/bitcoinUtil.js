var bitcore = require('bitcore');
var Address = bitcore.Address;
var HDPublicKey = bitcore.HDPublicKey;

var Env = require('../config/env.js');

function BitcoinUtil(){

}

/**
 * Determines whether a public key stringis a balid Bip38 Public Key.
 * Returns true/false
 */
BitcoinUtil.prototype.isValidBip38PublicKey = function(hdPublicKeyString){

  try {
    new HDPublicKey(hdPublicKeyString);
  } catch(e) {
    console.log("Invalid HD Public Key string " + hdPublicKeyString);
    return false;
  }

  // Make sure it starts with 'xpub' or 'tpub' so that we don't accept some of the other inputs that bitcore does
  if(hdPublicKeyString.substring(0,4) != "xpub" && hdPublicKeyString.substring(0,4) != "tpub"){
    console.log("Unsupported HD Public Key string " + hdPublicKeyString);
    return false;
  }

  // no exception means success
  return true;
};

/**
 * Generates a bitcoin URL for the address string and payment ammount... also includes the gateway info.
 * @return {String}               Returns the url as a string
 */
BitcoinUtil.prototype.generatePaymentUrl = function(addressString, amount){

   return "bitcoin:" + addressString + "?amount=" + amount + "&gateway=microtrx.com";
};

/**
 * Determines whether public address string is a valid bitcoinaddress
 */
BitcoinUtil.prototype.isValidPublicAddress = function(paymentAddress){

  return Address.isValid(paymentAddress, Env.NETWORK);
};


module.exports = BitcoinUtil;
