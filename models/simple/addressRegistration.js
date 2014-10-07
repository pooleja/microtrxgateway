var mongoose = require('mongoose');

var registrationSchema = mongoose.Schema({

   address: {type: String, required: true, unique: true},
   secretToken: {type: String, required: true}

});

module.exports = mongoose.model('AddressRegistration', registrationSchema);
