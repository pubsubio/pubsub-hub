var querify = require('querify');
var common = require('common');
var signer = require('signer');

var Matcher = function() {
	this._queries = {};
};

Matcher.prototype.put = function(query, fn) {
	var id = common.gensym();
	var compiled = querify.compile(query);
	var queries = this._queries;
	
	queries[id] = function(doc,a,b) {
		if (compiled(doc)) {
			fn(doc,a,b);
		}
	};
	
	return function() {
		delete queries[id];
	};	
};
Matcher.prototype.match = function(doc,a,b) {
	for (var i in this._queries) {
		this._queries[i](doc,a,b);
	}
};

/*
	signed values are represented as: {$signed:sig, value:val}
	authenticated values are represented as: {$authenticated:prop, value:val}
*/

var SecureMatcher = function(key) {
	this.signer = signer.create(key);
	this.matcher = new Matcher();
};

SecureMatcher.prototype.put = function(query, fn) {
	for (var i in query) {
		if (query[i].$authencated) {
			query[i].$any = query[i].$authenticated.value;
		}
	}
	this.matcher.put(query, function(doc, a, b) {
	});
};
SecureMatcher.prototype.match = function(doc, a, b) {
	this.matcher.put(doc, a, b);
};

exports.createMatcher = function(key) {
	return key ? new SecureMatcher(key) : new Matcher();
};