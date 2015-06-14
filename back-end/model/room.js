var mongoose = require('../config.js').mongoose;
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
	roomInfo: String,
	createrId: String,
	createdDate: Date,
	members: Array,
	currentMembers: Array
});

var Room = mongoose.model('Room',RoomSchema);

module.exports = Room;