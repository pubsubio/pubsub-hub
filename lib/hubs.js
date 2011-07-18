var common = require('common');
var signer = require('signer')
var createMatcher = require('./matcher').create;

var noop = function() {};

/*
	signed values are represented as: {$signed:sig, value:val}
	authenticated values are represented as: {$authenticated:prop, value:val}
*/

var selector = function(selection) {
	if (!selection || !Object.keys(selection).length) {
		return function(doc) {
			return doc;
		};
	}
	
	return function (doc) {
		var result = {};
		
		for (var i in selection) {
			if (doc[i]) {
				result[i] = doc[i];
			}
		}
		return result;
	};
};

var Hub = common.emitter(function(key) {
	this.subscriptions = {};
	this.matcher = createMatcher();
	this.signer = key ? signer.create(key) : signer;
});

Hub.prototype.subscribe = function(query, selection, callback) {
	var id = common.gensym();
	var self = this;
	
	var authDoc = this._authenticator(query);
	var select = selector(selection);

	this.members++;

	this.subscriptions[id] = this.matcher.put(query, function(doc, authQuery) {
		if (authQuery(authDoc()) && authDoc(authQuery())) {
			callback(select(doc));
		}
	});
	
	return function() {
		if (!self.subscriptions[id]) {
			return;
		}
		self._unsubscribe(id);
		self.members--;
		
		if (!self.members) {
			self.emit('empty');
		}
	};
};
Hub.prototype.publish = function(doc) {
	this.matcher.match(doc, this._authenticator(doc));
};
Hub.prototype.clear = function() {
	for (var i in this.subscriptions) {
		this.subscriptions[i]();
	}
	this.subscriptions = {};
};


Hub.prototype._unsubscribe = function(id) {
	this.subscriptions[id]();
	delete this.subscriptions[id];
};
Hub.prototype._authenticator = function(doc) {
	var auths = {};
	var signed = {};
	
	var signer = this.signer;

	for (var i in doc) {
		var val = doc[i];
		var auth = val.$authenticated;

		if (auth) {
			auths[i] = (typeof auth === 'string' ? auth : i).replace(/\//g,'-');
		}
		if (val.$signed) {
			signed[i] = val;
		}
		if (val.$signed || (auth && 'value' in val)) {
			doc[i] = val.value;
		}
	}
	return function(trusted) {
		if (!trusted) {
			return signed;
		}
		for (var i in auths) {
			var val = trusted[i];

			if (!(val && signer.verify(auths[i]+'/'+val.value, val.$signed))) { // should cache the result of verify
				return false;
			}
		}
		return true;
	};
};

var LazyHub = common.emitter(function(create) {
	this.create = create;
	this.hub = null;
});

LazyHub.prototype.subscribe = function(query, selection, callback) {
	if (!this.hub) {
		var self = this;
		
		this.hub = this.create();
		this.hub.on('clear', function() {
			self.emit('clear');
		});
	}
	return this.hub.subscribe(query, selection, callback);
};
LazyHub.prototype.publish = function(doc) {
	if (!this.hub) {
		return;
	}
	this.hub.publish(doc);
};
LazyHub.prototype.clear = function() {
	this.hub.clear();
};


var hubs = {};

exports.active = function(name) {
	return !!hubs[name];
};
exports.remove = function(name) {
	if (!hubs[name]) {
		return;
	}
	hubs[name].clear();
	delete hubs[name];
};
exports.add = function(name, key) {
	hubs[name] = new Hub(key);
};
exports.use = function(name) {
	return hubs[name] || new LazyHub(function() {
		if (!hubs[name]) {
			var hub = hubs[name] = new Hub();

			hub.on('empty', function() {
				delete hubs[name];
			});

			return hub;
		}
		return hubs[name];		
	});
};