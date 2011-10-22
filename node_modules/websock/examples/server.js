var websock = require('../index');

websock.listen(54321, function(socket) {
	console.log('connected socket ('+socket.version+')');
	socket.on('message', function(message) {
		console.log('rvcd', message);
		socket.send('echo: ' + message);
	});
	socket.on('close', function() {
		console.log('closed server socket');
	});
}, function() {
	var socket = websock.connect('ws://localhost:54321', {protocol:8});

	socket.on('open', function() {
		socket.send('from node');
	});
	socket.on('message', function(message) {
		console.log('rvcd', message);
		socket.end();
	});
	socket.on('close', function() {
		console.log('closed client socket');
	});
});
