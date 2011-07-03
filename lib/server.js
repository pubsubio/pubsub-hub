var router = require('router');
var sockets = require('json-sockets');
var hub = require('./hub').create();

var server = router.create();

server.get('/example', '/example.html', router.onfilerequest('.'));

server.get('/', function(request, response) {
	response.writeHead(200);
	response.end('yay');
});

sockets.listen(server, function(socket) {
	
	var subscriptions = {};
	
	socket.on('message', function(message) {
		if (message.name === 'subscription') {
			subscriptions[message.id] = hub.subscribe(message.query,message.selection, function(doc) {
				socket.send({id:message.id,doc:doc});
			});
			return;
		}
		if (message.name === 'publish') {
			hub.publish(message.doc);
			return;
		}
	});
	
	socket.on('close', function() {
		for (var i in subscriptions) {
			subscriptions[i]();
		}
	});
});

server.listen(9999);