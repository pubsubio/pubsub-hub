var signer = require('signer');
var compile = require('querify').compile;

var authenticator = function(doc) {
	var auths = {};
	var signed = {};
	
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
/*
var ex0 = {user: {$authenticated:1, $any:'ian'},name: {$signed:signer.sign('name/mathias'),value:'mathias'}};
var doc = {user:{$signed:signer.sign('user/ian'),value:'ian'},name:{$authenticated:1,value:'mathias'}};

var authD = authenticator(doc);
var authQ = authenticator(ex0);

console.log(authD(authQ()) && authQ(authD()));
*/