var bitcore = require('bitcore');

// Configure the bitcoin network to use - this drives other config
var bitcoinNetwork = bitcore.Networks.testnet;  // change to livenet if in production

// Set default values for livenet
var currentConnectionString = 'mongodb://localhost/microtrxgateway';
var navigationBarColor = '#000000;';

// Override values if in testnet
if(bitcoinNetwork == bitcore.Networks.testnet){
  currentConnectionString = 'mongodb://localhost/testnet_microtrxgateway';
  navigationBarColor = '#32CD32;';
}

exports.NETWORK = bitcoinNetwork;
exports.MONGO_CONNECTION_STRING = currentConnectionString;
exports.NAV_BAR_COLOR = navigationBarColor;
