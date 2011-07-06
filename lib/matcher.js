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

exports.create = function() {
	return new Matcher();
};