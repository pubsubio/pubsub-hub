/**
*    Copyright (C) 2011 Ian Jørgensen <i@pubsub.io>, Mathias Buus Madsen <m@pubsub.io>.
*
*    This program is free software: you can redistribute it and/or  modify
*    it under the terms of the GNU Affero General Public License, version 3,
*    as published by the Free Software Foundation.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Affero General Public License for more details.
*
*    You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var router = require('router');
var sockets = require('json-sockets');
var hub = require('./hub').create();

var server = router.create();
var noop = function() {};

server.get('/example', '/example.html', router.onfilerequest('.'));

server.get('/', function(request, response) {
	response.writeHead(200);
	response.end('yay');
});

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