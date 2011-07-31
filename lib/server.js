#!/usr/bin/env node

// TODO: make optimist print out help

var argv = require('optimist')
	.alias('p', 'port')
	.default('p', 9999)
	.alias('k', 'key')
	.alias('c','config')
	.argv;

var router = require('router');
var sockets = require('json-sockets');
var common = require('common');
var curl = require('curl');
var parse = require('url').parse;
var signer = require('signer');
var hubs = require('./hubs');

var hooks = {};

var server = router.create();

var noop = function() {};

var error = function(message) {
   var err = new Error('internal error');

   err.publicMessage = message;
   return err;
};

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

var onhookpublish = function(sub, request, response) {
	common.step([
		function(next) {
			toJSON(request, next);
		}, 
		function(message) {
			hubs.use(sub).publish(message.doc, message.challenge);

			response.writeHead(200);
			response.end('ok\n');
		}
	], function(err){
		response.writeHead(500);
		response.end();
	});	
};
var onhooksubscribe = function(sub, request, response) {
	common.step([
		function(next) {
			toJSON(request, next);
		},
		function(message, next) {
			var id = message.id || Math.random().toString(36).substring(2);

			if (!message.endpoint) {
				next(error('endpoint missing'));
			}
			
		 	hooks[id] = hubs.use(sub).subscribe(message.query, message.selection, function(doc) {
				curl.postJSON(message.endpoint, doc);
			});
			
			var body = common.format("http://{host}/{sub}unsubscribe?id={id}", {
				host : request.headers.host,
				sub : sub || '',
				id: id
			});
			
			response.writeHead(200, {
				'content-type':'application/json',
				'content-length':Buffer.byteLength(body)
			});			
			response.end(body+'\n');
		}
	], function(err) {
		response.writeHead(500);
		response.end(JSON.stringify({error:err.publicMessage || 'internal error'}));
	});	
};
var onhookunsubscribe = function(sub, request, response) {
	var id = parse(request.url,true).query.id;
	
	if (!hooks[id]) {
		response.writeHead(404);
		response.end();
		return;
	}
	
	hooks[id]();
	delete hooks[id];
		
	response.writeHead(200);
	response.end('unsubscribed\n');	
};


server.post('/publish', function(request, response) {
	onhookpublish('/', request, response);
});
server.post('/{sub}/publish', function(request, response) {
	onhookpublish('/'+request.matches.sub, request, response);
});

server.post('/subscribe', function(request, response) {
	onhooksubscribe('/', request, response);
});
server.post('/{sub}/subscribe', function(request, response) {
	onhooksubscribe('/'+request.matches.sub, request, response);
});

server.get('/{sub}/unsubscribe', function(request, response) {
	onhookunsubscribe('/'+request.matches.sub, request, response);
});
server.get('/unsubscribe', function(request, response) {
	onhookunsubscribe('/', request, response);
});

server.get('/{sub}/add', function(request, response) {
	var query = parse(request.url, true).query;
	var sub = request.matches.sub;

	common.step([
		function(next) {
			if (hubs.use(sub).secret && hubs.use(sub).secret.toString('base64') !== query.old) {
				response.writeHead(403);
				response.end();
				return;
			}
			if (query.secret) {
				next(null, new Buffer(query.secret, 'base64'));
				return;
			}
			signer.generateKey(next);
		},
		function(key) {			
			hubs.add(sub, key);

			response.writeHead(200);
			response.end(key.toString('base64'));
		}
	], function(err) {
		response.writeHead(500);
		response.end();
	});
});

var onsocket = function(socket) {
	var clear = {};

	socket.once('message', function(handshake) {
		var sub = handshake.sub || '/';
		var hub = hubs.use(sub);
		
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
				hub.publish(message.doc, message.challenge);
				return;
			}
		});
	});
	socket.on('close', function() {
		for (var i in clear) {
			clear[i]();
		}
	});	
};

if (argv.config) {
	var config = JSON.parse(require('fs').readFileSync(argv.config, 'utf-8'));

	for (var i in config.hubs) {
		hubs.add(i, new Buffer(config.hubs[i], 'base64'));
		common.log('adding hub={0}, secret={1}',i,config.hubs[i]);
	}
}

sockets.listen(server, onsocket);
sockets.createServer(onsocket).listen(10547);

server.listen(argv.p);

console.log('running hub server on port', argv.p);

process.on('uncaughtException', function(err) { console.error(err.stack) });