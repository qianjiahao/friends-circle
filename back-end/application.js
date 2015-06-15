var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




require('./router/router.js')(app);

http.listen(port,function(){
	console.log('server on port : %d',port);
});

io.on('connection',function (socket) {
	console.log('Welcome on : ', socket.id);

	var room = [];

	socket.on('send message',function (data) {
		console.log('User ' + socket.id  + ', nickname : ' + data.username + ', send message :' + data.message + ', date : ' + data.date);
		io.emit('receive message',data);
	});

	socket.on('typing', function (username) {
		io.emit('typing', username);
	});

	socket.on('update hints',function(id) {
		io.emit('update hints',id);
	});

	socket.on('update friends',function (id) {
		io.emit('update friends', id);
	});

	socket.on('update news', function (id) {
		io.emit('update news', id);
	});

	socket.on('update rooms', function (members) {
		io.emit('update rooms', members);
	});

	socket.on('disconnect',function() {
		console.log('Goodbye : ', socket.id);
	});
});