var bitcore = require('bitcore');

var run = function() {
  var HierarchicalKey = bitcore.HierarchicalKey;
  var Address = bitcore.Address;
  var networks = bitcore.networks;
  var coinUtil = bitcore.util;
  var crypto = require('crypto');

  console.log('Generate Keys: Hierarchical Deterministic Wallets (BIP32)');

  var randomBytes = crypto.randomBytes(32);
  var hkey = HierarchicalKey.seed(randomBytes);
  console.log('master extended private key: ' + hkey.extendedPrivateKeyString());
  console.log('master extended public key: ' + hkey.extendedPublicKeyString());
  console.log();

  var hkey2 = new HierarchicalKey(hkey.extendedPrivateKeyString());
  var hkey3 = new HierarchicalKey(hkey.extendedPublicKeyString());
  console.log('m/0 address: ' + Address.fromPubKey(hkey.derive('m/0').eckey.public).toString());
  console.log('m/0 address: ' + Address.fromPubKey(hkey2.derive('m/0').eckey.public).toString());
  console.log('m/0 address: ' + Address.fromPubKey(hkey3.derive('m/0').eckey.public).toString());
  console.log();

};


// This is just for browser & mocha compatibility
if (typeof module !== 'undefined') {
  module.exports.run = run;
  if (require.main === module) {
    run();
  }
} else {
  run();
}
