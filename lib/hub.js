var common = require('common');
var createMatcher = require('./matcher').create;

var noop = function(){};

var hubs = {};

var Hub = function() {
	this.subscriptions = {};
	this.matcher = createMatcher();
};

Hub.prototype.subscribe = function(query, selection, callback) {
	var id = common.gensym();
	var self = this;

	this.subscriptions[id] = this.matcher.put(query, this._selector(selection, callback));
	
	return function() {
		self._unsubscribe(id);
	};
};
Hub.prototype.publish = function(doc) {
	this.matcher.match(doc);
};

Hub.prototype._selector = function(selection, fn) {
	if (!selection || !Object.keys(selection).length) {
		return fn;
	}
	
	return function (doc) {
		var result = {};
		
		for (var i in selection) {
			if (doc[i]) {
				result[i] = doc[i];
			}
		}
		fn(result);
	};
};
Hub.prototype._unsubscribe = function(id) {
	(this.subscriptions[id] || noop)();
	delete this.subscriptions[id];
};

exports.create = function(name) {
	return hubs[name] = hubs[name] || new Hub();
};

/*var hub = new Hub();

var un = hub.subscribe({}, {},function(doc) {
	console.log('matched',doc);
});

hub.publish({hi:1,lo:2});
hub.publish({lo:2});*/