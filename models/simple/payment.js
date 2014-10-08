var mongoose = require('mongoose');

var paymentSchema = mongoose.Schema({

   clientAddress: {type: String, required: true},
   paymentAddress: {type: String, required: true},
   amountReceived: Number,
   keyId: Number,

});

module.exports = mongoose.model('Payment', paymentSchema);
