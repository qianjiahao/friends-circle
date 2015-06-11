var mongoose = require('../config.js').mongoose;
var Schema = mongoose.Schema;

var HintSchema = new Schema({
	targetId: String,
	hintType: String,
	hintContent: String,
	senderId: String,
	senderName: String,
	date: String,
	mark: Boolean,
	accept:Boolean
});

var Hint = mongoose.model('Hint',HintSchema);

module.exports = Hint;