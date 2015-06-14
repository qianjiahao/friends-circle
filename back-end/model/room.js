var mongoose = require('../config.js').mongoose;
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
	roomName: String,
	roomInfo: String,
	creatorId: String,
	createDate: Date,
	members: Array,
	current: Array
});

var Room = mongoose.model('Room',RoomSchema);

module.exports = Room;