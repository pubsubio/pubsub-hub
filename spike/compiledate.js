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

var tests = [
	'monday',
	'monday 22',
	'monday 22 august',
	'monday 22 august 2011',
	'22 august 2011 8:--:--',
	'monday 22 august 2011 8:30:--',
	'monday 22 august 2011 8:30:00',
	'monday 22 august 2011 10:30:00 +2',
	'monday 22 august 2011 7:30:00 -1',
	'monday 22 august 2011 9:00:00 +.5',
	'monday 22 august 2011 10:00:00 +1.5',
	'tue',
	'tue 23',
	'tue 23 august',
	'tue 23 august 2011',
	'23 august 2011 8:--:--',
	'tue 22 august 2012 8:30:--',
	'tue 22 september 2011 8:30:00',
	'tue 22 august 2011 9:30:00 +2',
	'tue 22 august 2011 8:40:00 -1',
	'tue 22 august 2011 9:00:10 +.5',
	'tue 22 august 2011 10:00:01 +1.5'
];

exports.match = match;
exports.tests = tests;

/*var subject = new Date('august 22 2011 10:30:00');
for(var i in tests) {
	console.log(match(tests[i])(subject));
}*/
