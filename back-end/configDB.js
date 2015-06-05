var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:friends-circle');

module.exports = mongoose;