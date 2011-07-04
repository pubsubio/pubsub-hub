var sockets = require('json-sockets');
var common = require('common');

var noop = function() {};

exports.connect = function() {
	var socket = sockets.connect.apply(sockets, arguments);

	var pubsub = {};
	var subscriptions = {};	
	
	socket.on('message', function(message) {
		if (message.name === 'publish') {
			(subscriptions[message.id] || noop)(message.doc);
		}
	});

	pubsub.subscribe = function(query, selection, callback) {
		if (!callback) {
			callback = selection;
			selection = undefined;
		}

		var id = common.gensym();

		subscriptions[id] = callback;

		socket.send({name:'subscribe', id:id, query:query, selection:selection});
		
		return function() {
			socket.send({name:'unsubscribe', id:id});
		};
	};
	pubsub.publish = function(doc) {
		socket.send({name:'publish', doc:doc});
	};

	return pubsub;
};