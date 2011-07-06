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

var verbose = require('./datepattern');
var regex = require('./compiledate');
var fastcompile = require('./compiledatefast');

var subject = new Date('august 22 2011 10:30:00');

var amount = 10000;
var count = 0;

var funcs = [];
for(var j in verbose.tests) {
	funcs.push(verbose.match(verbose.tests[j]));		
}

var then = Date.now();
for(var i=0 ; i < amount; i++) {
	for(var j in funcs) {
		count++;
		funcs[j](subject);
	}
}
var time = Date.now() - then;
var vb = Math.round(count/time);
console.log(vb + ' matches/ms Verbose ' + time + ' ms');

/*******************************************************/

var count = 0;
var funcs = [];

for(var j in regex.tests) {
	funcs.push(regex.match(regex.tests[j]));		
}

var then = Date.now();
for(var i=0 ; i < amount; i++) {
	for(var j in funcs) {
		count++;
		funcs[j](subject);
	}
}
var time = Date.now() - then;
var rb = Math.round(count/time);
console.log(rb + ' matches/ms Compile ' + time + ' ms');

/*******************************************************/

var count = 0;
var funcs = [];

for(var j in fastcompile.tests) {
	funcs.push(fastcompile.match(fastcompile.tests[j]));		
}

var then = Date.now();
for(var i=0 ; i < amount; i++) {
	for(var j in funcs) {
		count++;
		funcs[j](subject);
	}
}
var time = Date.now() - then;
var rb = Math.round(count/time);
console.log(rb + ' matches/ms Compile-Fast ' + time + ' ms');

console.log(Math.round((vb*100)/rb) + '% Verbose vs Compile-Fast');