var DAYS = {sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};
var DATETIME_PATTERN = /^(?:(mon|tue|wed|thu|fri|sat|sun)\w*)?\s*(\d{1,2})?\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)?\s*(\d{4})?\s*(?:(\d{1,2})h)?\s*(?:(\d{1,2})m)?\s*(?:(\d{1,2})s)?\s*([+-]\d*\.?\d+)?\s*$/i;

var match = function(pattern) {
	
	var match = pattern.match(DATETIME_PATTERN).slice(1);
	
	var regex = '^';
	var offset = 0;
	
	var prependZero = function(str) {
		if(str.length === 1) {
			return '0' + str;
		}
		return str;
	};
	
	var matchers = [
		function(exp) {
			return exp ? exp.substring(0,3) + ', ' : '\\w{3}, ';
		},
		function(exp) {
			return exp ? prependZero(exp) + ' ' : '\\d{2} ';
		},
		function(exp) {
			return exp ? exp.substring(0,3) + ' ' : '\\w{3} ';
		},
		function(exp) {
			return exp ? exp + ' ' : '\\d{4} ';
		},
		function(exp) {
			return exp ? prependZero(exp) + ':' : '\\d{2}:';
		},
		function(exp) {
			return exp ? prependZero(exp) + ':' : '\\d{2}:';
		},
		function(exp) {
			return exp ? prependZero(exp) : '\\d{2}';
		},
		function(exp) {
			offset = exp && Math.round(Number(exp) * 60);
			return '';
		}
	];
	
	for(var i=0; i < match.length; i++) {
		regex += matchers[i](match[i]);
	}
	regex = new RegExp(regex,'i');
	
	return function(date) {
		
		if (offset !== undefined && date.getTimezoneOffest !== offset) {
			var tmp = date;
			date = new Date(date.getTime() + 60000 * (date.getTimezoneOffset() + offset));
			date = new Date(tmp.getTime() + 60000 * offset);
		}
		
		return regex.test(date.toUTCString());
	}
};
var subject = new Date('august 22 2011 10:30:00');
console.log(subject);
/*console.log(match('monday')(subject));
console.log(match('monday 22')(subject));
console.log(match('monday 22 august')(subject));
console.log(match('monday 22 august 2011')(subject));
console.log(match('monday 22 august 2011 8h')(subject));
*/
console.log(match('monday 22 august 2011 8h 30m')(subject));
console.log(match('monday 22 august 2011 8h 30m 00s')(subject));
console.log(match('monday 22 august 2011 10h 30m 0s +2')(subject));
console.log(match('monday 22 august 2011 7h 30m 0s -1')(subject));
console.log(match('monday 22 august 2011 9h 00m 0s +.5')(subject));
console.log(match('monday 22 august 2011 10h 00m 0s +1.5')(subject));
console.log(match('22 august 2011 10h')(new Date('august 22 2011 10:30:00 GMT+0000')));
console.log(match('22 august 2011 10h +2')(new Date('august 22 2011 10:30:00 GMT+0200')));
console.log(match('22 august 2011 10h -2')(new Date('august 22 2011 10:30:00 GMT-0200')));
