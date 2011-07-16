#!/usr/bin/env node

var router = require('router');
var sockets = require('json-sockets');
var common = require('common');
var curl = require('curl');

var argv = require('optimist').options('p', {
	alias: 'port',
	default: 9999,
	describe: 'port number'
}).options('k', {
	alias: 'key',
	describe: 'authentication private key'
}).argv;

if (argv.help) {
	console.log('usage: ./server.js [option]\n');
	console.log('where the options are:');
	console.log('  key      string         - hub private authentication key');	
	console.log('  port     number         - start the server on given port number');	
	return;
}

var hub = require('./hub').create(argv.key);

var server = router.create();
var noop = function() {};

server.post('/publish', function(request,response) {
	common.step([
		function(next) {
			curl.toJSON(request,next);
		}, function(doc) {
			hub.publish(doc);
			response.end('published document \n');
		}],function(err){
			response.end(err.stack);
	});
});

server.post('/hook', function(request, response) {
	common.step([
		function(next) {
			toJSON(request,next);
		}, function(message) {
			hub.subscribe(message.query, message.selection, function(doc) {
				curl.post(message.endpoint,doc);
			});
			response.end('hoooked \n'); // TODO:return unsubscription id
		}], function(err) {
			response.end(err.stack)
		});
});

//TODO: add unhook

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

console.log('running hub server on port',argv.p);