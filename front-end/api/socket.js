(function() {

	app
		.factory('socket', ['socketFactory', function(socketFactory){

			var socket = io.connect('http://localhost:3000');

			mySocket = socketFactory({
				ioSocket: socket
			});
			return mySocket;
		}])

})();