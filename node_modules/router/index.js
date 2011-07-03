var common = require('common');
var http = require('http');
var https = require('https');

var matcher = require('./matcher');

var createRouter = function(options) { // TODO: params instead of matches
	var that = {};
	
	options = options || {};
	
	// this check may seem a bit confusing. basicly if options is a server or a router
	// then just return the attached router
	if (options.router) {
		return options.router;
	}
	// if options if already a server we just sugar it and create a router
	// that doesnt autoclose (otherwise we could have really weird rcs)
	// TODO: maybe listen for # of request handlers on the server to decide whether to autoclose
	if (typeof options.listen === 'function') {
		return createRouter({server:options, autoclose:false});
	}
	
	var methods = {request:[], upgrade:[], get:[], put:[], post:[], head:[], 'delete':[]};	
	var server = options.server || (options.key ? https.createServer({key:options.key,cert:options.cert}) : http.createServer());
	
	that.autoclose = options.autoclose !== false;
	that.server = server;
	that.router = server.router = that;
	
	var find = function(handlers, request, a, b) {
		for (var i = 0; i < handlers.length; i++) {
			if (handlers[i](request, a, b)) {
				return true;
			}
		}
		return false;
	};
	
	that.route = function(request, response) {
		if (find(methods.request, request, response) || 
			find(methods[request.method.toLowerCase()], request, response) || !that.autoclose) {
			return;
		}
		if (request.method === 'POST' || request.method === 'PUT') { // TODO: check if node doesn't already do this
			request.connection.destroy(); // don't waste bandwidth on data we don't want
			return;
		}
		response.writeHead(404);
		response.end();
	};
	
	server.on('request', function(request, response) {
		if (request.method === 'OPTIONS') {
			response.writeHead(200, {
				'access-control-allow-origin': '*',
				'access-control-allow-methods': 'PUT, POST, GET, OPTIONS',
				'access-control-allow-headers': 'Content-Type'					
			});
			response.end();
			return;
		}
		that.route(request, response);
	});
	server.on('upgrade', function(request, connection, head) {
		if (find(methods.upgrade, request, connection, head)) {
			return;
		}
		
		connection.destroy();
	});	
	
	var router = function(methods) {
		return function(pattern, rewrite, fn) {
			if (!fn) {
				fn = rewrite;
				rewrite = undefined;
			}

			var match = matcher(pattern);

			rewrite = rewrite && rewrite.replace(/\$(\d+)/g, '{$1}');
			methods.push(function(request, a, b) {
				var matches = match(request.url.split('?')[0]);

				if (matches) {
					if (rewrite) {
						request.url = common.format(rewrite, matches);
					}

					request.matches = matches;
					fn(request, a, b);

					return true;
				}
				return false;
			});
		};
	};
	
	that.request = router(methods.request);
	that.upgrade = router(methods.upgrade);
	
	that.get = router(methods.get);
	that.put = router(methods.put);
	that.del = router(methods['delete']); // :(

	that.post = router(methods.post);
	that.head = router(methods.head);
	
	that.close = function() {
		server.close.apply(server, arguments);
	};
	that.listen = function() {
		server.listen.apply(server, arguments);
	};
	
	return that;
};

exports.create = createRouter;

var fs = require('fs');
var path = require('path');
var mimes = require('mimes');

exports.onfilerequest = function(dir, options) {

	options = options || {};
	// TODO: add cache option

	return function(request, response) {
		var url = request.url.split('?')[0];
		
		url = path.normalize(url);
		
		// security check
		if (/\/\.\.\//.test(url)) {
			response.writeHead(404);
			response.end();
			return;
		}
		
		url = path.join(dir, url);

		fs.readFile(url, function(err, buffer) {
			if (err) {
				response.writeHead(404);
				response.end();
				return;
			}
			response.writeHead(options.status || 200, {
				'content-type':mimes.resolve(url)
			});
			response.end(buffer);				
		});			
	};
};