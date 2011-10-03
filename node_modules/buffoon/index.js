var common = require('common');
var parseQuery = require('querystring').parse;

var onclose = function(stream, callback) {
	stream.on('error', callback);
	stream.on('close', function() {
		callback(new Error('premature close'));
	});	
};

exports.string = function(stream, encoding, callback) {
	if (!callback) {
		callback = encoding;
		encoding = 'utf-8';
	}
	
	var buffer = '';

	callback = common.once(callback);	
	onclose(stream, callback);

	stream.setEncoding(encoding);
	stream.on('data', function(data) {
		buffer += data;
	});
	stream.on('end', function() {
		callback(null, buffer);
	});
};

exports.buffer = function(stream, callback) {
	var buffer = [];
	var length = 0;
	
	callback = common.once(callback);
	onclose(stream, callback);
	
	stream.on('data', function(data) {
		buffer.push(data);
		length += data.length;
	});
	stream.on('end', function() {
		var result = new Buffer(length);
		var offset = 0;
		
		for (var i = 0; i < buffer.length; i++) {
			buffer[i].copy(result, offset);
			offset += buffer[i].length;
		}
		callback(null, result);
	});
};

var parser = function(strat) {
	return function(stream, callback) {
		exports.string(common.fork(callback, function(result) {
			try {
				result = strat(result);
			} catch(err) {
				callback(err);
				return;
			}
			callback(null, result);
		}));		
	};
};

exports.json = parser(JSON.parse);
exports.query = parser(parseQuery);