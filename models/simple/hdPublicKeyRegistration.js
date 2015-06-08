var mongoose = require('mongoose');

var registrationSchema = mongoose.Schema({

   // The user's bip38 public key
   publicKey: {type: String, required: true, unique: true},
   keyIndex: {type: Number, default: 0},
   walletType : {type: String, default: 'bip44'}

});

module.exports = mongoose.model('HdPublicKeyRegistration', registrationSchema);
