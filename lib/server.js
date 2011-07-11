var router = require('router');
var sockets = require('json-sockets');

var key = process.argv[2];

var hub = require('./hub').create(key);

var server = router.create();
var noop = function() {};

server.get('/example', '/example.html', router.onfilerequest('.'));
server.get('/pubsub.io.js', '../bin/pubsub.io.js', router.onfilerequest('.'));

var onsocket = function(socket) {
	var clear = {};
	
	socket.on('message', function(message) {
		var id = message.id;

		if (message.name === 'subscribe') {
			clear[id] = hub.subscribe(message.query, message.selection, function(doc) {
				socket.send({name:'publish', id:id, doc:doc});
			});
			return;
		}
		if (message.name === 'unsubscribe') {
			(clear[id] || noop)();
			delete clear[id];
			return;
		}
		if (message.name === 'publish') {
			hub.publish(message.doc);
			return;
		}
	});
	socket.on('close', function() {
		for (var i in clear) {
			clear[i]();
		}
	});	
};

sockets.listen(server, onsocket);
sockets.createServer(onsocket).listen(10547);

server.listen(9999);