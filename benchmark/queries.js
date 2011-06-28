var compile = require('querify').compile;

var queries = [
	compile({
		foo:'bar',
		lol:'meh'
	}), 
	compile({
		hello:'world',
		age: {$gt:10}
	}), 
	compile({
		age: {$gt:10, $lt:20},
		yay: {$exists:true},
		meh: {$notany:[':)']}
	}),
	compile({
		time: {$datetime: 'monday 2011'}
	})
];

var MATCHES = 1000000;

var now = Date.now();

for (var h = 0; h < MATCHES; h++) {
	var doc = {hello:'world', age:h-1, foo:'bar', time: new Date('august 22 2011 10:30:00')};
	
	for (var i = 0; i < queries.length; i++) {
		queries[i](doc);
	}
}

var time = Date.now() - now;

console.log(Math.round(MATCHES*queries.length/time)+' queries/ms, time ' + time + ' ms');