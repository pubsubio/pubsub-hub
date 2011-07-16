#!/usr/bin/env node

// TODO: make optimist print out help

var argv = require('optimist')
	.alias('p', 'port')
	.default('p', 9999)
	.alias('k', 'key')
	.argv;

var router = require('router');
var sockets = require('json-sockets');
var common = require('common');
var curl = require('curl');

var hub = require('./hub').create(argv.key);

var server = router.create();
var noop = function() {};

var toJSON = function(request, callback) {
	var buffer = '';
	var onclose = function() {
		callback(new Error('unexpected close'));
	};
	
	request.setEncoding('utf-8');
	
	request.on('data', function(data) {
		buffer += data;
	});
	request.on('end', function() {
		request.removeListener('close', onclose);
		try {
			buffer = JSON.parse(buffer);			
		} catch (err) {
			callback(err);
			return;
		}
		callback(null, buffer);
	});
	request.on('close', onclose);
};

server.post('/publish', function(request,response) {
	common.step([
		function(next) {
			toJSON(request, next);
		}, 
		function(doc) {
			hub.publish(doc);

			response.writeHead(200);
			response.end('ok\n');
		}
	], function(err){
		response.writeHead(500);
		response.end();
	});
});

server.post('/subscribe', function(request, response) {
	common.step([
		function(next) {
			toJSON(request, next);
		},
		function(message) {
			hub.subscribe(message.query, message.selection, function(doc) {
				curl.post(message.endpoint, doc);
			});
			response.writeHead(200);
			response.end('ok\n'); // TODO: return unsubscription id
		}
	], function(err) {
		response.writeHead(500);
		response.end();
	});
});

// TODO: add unsubscribe

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

server.listen(argv.p);

console.log('running hub server on port', argv.p);
