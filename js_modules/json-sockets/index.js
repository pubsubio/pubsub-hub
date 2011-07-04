var common = require('common');

var Socket = common.emitter(function(host) {
	var ws = new WebSocket('ws://' + host + '/json-socket');
	
	this._ws = ws;
	this._buffer = [];
	
	var self = this;
	
	ws.onopen = function() {
		while (self._buffer.length) {
			self._send(self._buffer.shift());
		}
		self.send = self._send;
		self.emit('open');
	};
	ws.onmessage = function(e) {
		self.emit('message',JSON.parse(e.data));
	};
	ws.onclose = function() {
		self.emit('close');
	};
});

Socket.prototype.send = function(message) {
	this._buffer.push(message);
};

Socket.prototype._send = function(message) {
	this._ws.send(JSON.stringify(message));
};

exports.connect = function(host) {
	host = host || window.location.host;
	return new Socket(host);
};