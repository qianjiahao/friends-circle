var mongoose = require('../config.js').mongoose;
var Schema = mongoose.Schema;

var NewsSchema = new Schema({
	publishId: String,
	publishContent: String,
	date: Date,
	isMarkdown: Boolean,
	support: Array
})

var News = mongoose.model('News',NewsSchema);

module.exports = News;