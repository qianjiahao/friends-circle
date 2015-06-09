var mongoose = require('../config.js').mongoose;
var Schema = mongoose.Schema;

var UesrSchema = new Schema({
	username: String,
	encryptedPassword: String,
	email: String,
	signature: String,
	hints: Array,
	friends: Array
});

var User = mongoose.model('User',UesrSchema);

module.exports = User;