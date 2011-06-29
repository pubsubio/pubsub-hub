var verbose = require('./datepattern');
var regex = require('./compiledate');
var fastcompile = require('./compiledatefast');

var subject = new Date('august 22 2011 10:30:00');

var amount = 100000;
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