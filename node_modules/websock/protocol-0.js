var common = require('common');

var noop = function() {};

var START = '\u0000';
var END   = '\ufffd';

var CLOSE = [END, END, START];

var Parser = common.emitter(function() {
	this.buffer = '';
	this.start = 0;
	this.framing = false;
	this.top = [];

	this.once = common.once();
	this.pointer = 0;
});

Parser.prototype.parse = function(data) {
	var index = -1;
	var last = 0;
	
	if (this.once() && data === END+START) {
		this.emit('close');
	}
	if (!this.once()) {
		for (var i = 0; i < data.length; i++) {
			if (CLOSE[this.pointer++] === data[i]) {
				if (this.pointer === CLOSE.length) {
					this.emit('close');
				}
			} else {
				this.pointer = 0;
			}
		}
	}

	while ((index = data.indexOf(this.framing ? END : START, last)) > -1) { // messages are framed by START/END
		if (this.framing) {
			this.emit('message', this.buffer.substring(this.start)+data.substring(last, index));
			this.buffer = '';
		}
		
		this.start = last = index+1;
		this.framing = !this.framing;
	}
	if (this.framing && last <= data.length) { // we only buffer is we absolutely have to
		this.buffer += data;
	}
};

var WebSocket = common.emitter(function(options) {
	this.type = options.type;
	this.readable = this.writable = false;
});

WebSocket.prototype.pingable = false;
WebSocket.prototype.version = 0;

WebSocket.prototype.open = function(connection, head) {
	var self = this;
	var parser = new Parser();
	
	this.connection = connection;
	this.readable = this.writable = true;

	connection.setEncoding('utf-8');
	connection.setTimeout(2*60*1000);
		
	var destroy = function() {
		connection.destroy();
	};
	var onclose = common.once(function() {
		self.readable = self.writable = false;
		self.emit('close');
	});	

	parser.on('message', function(message) {
		if (self.readable) {
			self.emit('message', message);		
		}
	});
	parser.on('close', destroy);	

	connection.on('end', function() {
		connection.end();
		onclose();
	});

	connection.on('timeout', destroy);	
	connection.on('error', onclose);
	connection.on('close', onclose);
	
	connection.on('data', function(data) {
		parser.parse(data);
	});

	this.emit('open');

	// maybe do something with head?
};

WebSocket.prototype.send = function(data) {
	var length = Buffer.byteLength(data);
	var message = new Buffer(2+length);
	
	message.write('\u0000', 'binary');
	message.write(data, 1, 'utf-8');
	message.write('\uffff', length+1, 'binary');

	this.connection.write(message); // we encourage the socket to send it as one package
}
WebSocket.prototype.ping = noop;
WebSocket.prototype.end = WebSocket.prototype.close = function() {
	this.connection.end();
};
WebSocket.prototype.destroy = function() {
	this.connection.destroy();
};

exports.create = function(options) {
	return new WebSocket(options);
};