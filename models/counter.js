var mongoose = require('mongoose');

var counterSchema = mongoose.Schema({

   name: String,
   next: {type: Number, default: 1}

});

module.exports = mongoose.model('Counter', counterSchema);
