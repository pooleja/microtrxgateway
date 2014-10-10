var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var paymentSchema = mongoose.Schema({

   clientAddress: {type: String, required: true},
   paymentAddress: {type: String, required: true},
   amountReceived: Number,
   keyId: Number,

});

paymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payment', paymentSchema);
