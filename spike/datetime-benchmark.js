var verbose = require('./datepattern');
var regex = require('./compiledate');

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
console.log(rb + ' matches/ms Regex ' + time + ' ms');

console.log(Math.round((vb*100)/rb) + '% Verbose vs. Regex');