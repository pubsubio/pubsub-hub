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
	pubsub.auth = function(type,val) {
		if (typeof type === 'object') {
			var result = {};
			
			for (var i in type) {
				result[i] = pubsub.auth(type[i],i);
			}
			
			return result;
		}
		if (!val) {
			val = type;
			type = 1;
		}
		
		return {$authenticated:type, value:val};
	};
	
	return pubsub;
};

if (!module.browser) {
	var signer = require("signer");

	exports.signer = function(secret) {	
		return function(doc) {
			var signed = {};
		
			for (var i in doc) {
				signed[i] = {$signed:signer.sign(i.replace(/\//g, '-')+'/'+doc[i]), value:doc[i]};
			}
			return signed;
		};
	};
}