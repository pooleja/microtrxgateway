var mongoose = require('mongoose');

var registrationSchema = mongoose.Schema({

   address: {type: String, required: true, unique: true},
   token: {type: String, required: true},
   threshold: {type: Number, default: 0.001}

});

module.exports = mongoose.model('AddressRegistration', registrationSchema);
