var mongoose = require('../config.js').mongoose;
var Schema = mongoose.Schema;

var UesrSchema = new Schema({
	username: String,
	encryptedPassword: String,
	email: String,
	signature: String
});

var User = mongoose.model('User',UesrSchema);

module.exports = User;