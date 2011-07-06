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