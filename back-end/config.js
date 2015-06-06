var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/friends-circle');

module.exports.mongoose = mongoose;

