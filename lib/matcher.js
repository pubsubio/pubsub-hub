var compile = require('querify').compile;
var common = require('common');

var Matcher = function() {
	this._queries = {};
};

Matcher.prototype.put = function(query, fn) {
	var id = common.gensym();
	var compiled = compile(query);
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
	Just leaving this here for now:
	
	signed values are represented as: {$signed:sig, value:val}
	authenticated values are represented as: {$authenticated:prop, value:val}
*/

exports.create = function() {
	return new Matcher();
};