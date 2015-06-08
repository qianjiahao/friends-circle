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

	socket.on('send message',function (nickname, message) {
		console.log('User ' + socket.id  + ', nickname : ' + nickname + ', send message :' + message);
		io.emit('receive message',nickname, message);
	});

	socket.on('disconnect',function() {
		console.log('Goodbye : ', socket.id);
	});
});