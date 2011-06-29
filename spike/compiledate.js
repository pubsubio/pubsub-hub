var match = function(pattern) { 
	var template = /^(?:(mon|tue|wed|thu|fri|sat|sun)\w*)?,?\s*(\d{2})?\s*([a-z]+)?\s*(\d{4})?\s*([\d|-]{1,2}:[\d|-]{1,2}:[\d|-]{1,2})?\s*([+-]\d*\.?\d+)?/i;
	var matches = pattern.match(template);
	
	if (!matches) {
		return function() {
			return false;
		};
	}
	
	matches = matches.slice(1);
	
	var offset = Math.round(Number(matches[5] || 0) * 60);
	var regex = '^';

	regex += matches[0] ? matches[0].substring(0, 3)+', ' : '\\w{3}, ';
	regex += matches[1] ? matches[1] + ' ' : '\\d{2} ';
	regex += matches[2] ? matches[2].substring(0, 3)+' ' : '\\w{3} ';
	regex += matches[3] ? matches[3] + ' ' : '\\d{4} ';
	regex += matches[4] ? matches[4].replace(/(^|:)(\d(?::|$))/g,'$10$2').replace(/(^|:)(\d(?::|$))/g,'$10$2').replace(/--/g,'\\d{2}') : '\\d{2}:\\d{2}:\\d{2}'; 
	
	regex = new RegExp(regex,'i');

	return function(date) {
		if (offset) {
			date = new Date(date.getTime() + 60000 * offset);
		}
		return regex.test(date.toUTCString());
	};
};

var subject = new Date('august 22 2011 10:30:00');
console.log(match('august')(subject));
console.log(match('monday 22')(subject));
console.log(match('monday 22 august')(subject));
console.log(match('monday 22 august 2011')(subject));
console.log(match('monday 22 august 2011 8:--:--')(subject));
console.log(match('monda 22 august 2011 8:30:-- +0')(subject));
console.log(match('monday 22 august 2011 8:30:00')(subject));
console.log(match('monday 22 august 2011 10:30:0 +2')(subject));
console.log(match('monday 22 august 2011 7:30:0 -1')(subject));
console.log(match('monday 22 august 2011 9:00:0 +.5')(subject));
console.log(match('monday 22 august 2011 10:00:0 +1.5')(subject));
console.log(match('22 august 2011 10:--:--')(new Date('august 22 2011 10:30:00 GMT+0000')));
console.log(match('22 august 2011 10:--:-- +2')(new Date('august 22 2011 10:30:00 GMT+0200')));
console.log(match('22 august 2011 10:--:-- -2')(new Date('august 22 2011 10:30:00 GMT-0200')));
console.log(match('22 august 2011 10:30:-- +2')(new Date('august 22 2011 10:30:00 GMT+0200')));