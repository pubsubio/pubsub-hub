var request = require('request');

var merge = function() {
	var result = {};

	for (var i = 0; i < arguments.length; i++) {
		var obj = arguments[i];
		
		for (var j in obj) {
			result[j] = obj[j];
		}
	}
	return result;
};

var get = function(url, options, callback) {
	if(!callback) {
		callback = options;
		options = {};
	}
	
	var options = merge(options,{url:url},{method:'GET'});
	
	delete options.uri;
	
	request(options, callback);
};

var post = function(url, body, options, callback) {
	if(!callback) {
		callback = options;
		options = {};
	}
	
	var options = merge(options,{
		method: 'PUT',
		url: url,
		body: body,
		'content-length': body.length
	});
	
	delete options.uri;
	
	request(options, callback);
};

var getJSON = function(url, options, callback) {
	if(!callback) {
		callback = options;
		options = {};
	}
	
	get(url, options, function(err, response, body) {
		if(err) {
			callback(err, null, null); 
			return;
		}
		callback(null, response, JSON.parse(body))
	});
};

var postJSON = function(url, data, options, callback) {
	if(!callback) {
		callback = options;
		options = {};
	}

	var options = merge(options, {'content-type': 'application/json'});
	
	delete options.uri;
	
	post(url, JSON.stringify(data), options, callback);
};