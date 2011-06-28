


/*{date : {$time : 'Wednesday"}}


Second : Minute : Hour Day Month  Year

day date  Day Month Year Hour:Minute:Second +offset-
*/

var days = {sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};
var months = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
var pattern = /^(?:(mon|tue|wed|thu|fri|sat|sun)\w*)?\s*(\d{1,2})?\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)?\s*(\d{4})?\s*(?:(\d{1,2})h)?\s*(?:(\d{1,2})m)?\s*(?:(\d{1,2})s)?\s*([+-]\d*\.?\d+)?\s*$/i;

var match = function(str) {
	var match = str.match(pattern);

	if (!match) {
		return null;
	}
	
	var time = {
		day:days[match[1] && match[1].toLowerCase()],
		date:match[2] && parseInt(match[2],10),
		month:months[match[3] && match[3].toLowerCase()],
		year:match[4] && parseInt(match[4],10) - 1900,	
		hour:match[5] && parseInt(match[5],10),
		minute:match[6] && parseInt(match[6],10),
		second:match[7] && parseInt(match[7],10),
		timeoffset:match[8] && Math.round(Number(match[8]) * 60)
	};
	
	return function(date) {
		if(time.timeoffset && date.getTimezoneOffset() !== time.timeoffset) {
			date = new Date(date.getTime() + 60000 * (date.getTimezoneOffset() + time.timeoffset));
		}
		if (time.day !== undefined && date.getDay() !== time.day) {
			return false;
		}
		if (time.date && date.getDate() !== time.date) {
			return false;
		}
		if (time.month && date.getMonth() !== time.month) {
			return false;
		}
		if (time.year && date.getYear() !== time.year) {
			return false;
		}
		if (time.hour !== undefined && date.getHours() !== time.hour) {
			return false;
		}
		if (time.minute !== undefined && date.getMinutes() !== time.minute) {
			return false;
		}
		if (time.second !== undefined && date.getSeconds() !== time.second) {
			return false;
		}
		return true;
	};
};

var subject = new Date('august 22 2011 10:30:00');
console.log(match('monday')(subject));
console.log(match('monday 22')(subject));
console.log(match('monday 22 august')(subject));
console.log(match('monday 22 august 2011')(subject));
console.log(match('monday 22 august 2011 10h')(subject));
console.log(match('monday 22 august 2011 10h 30m')(subject));
console.log(match('monday 22 august 2011 10h 30m 0s')(subject));
console.log(match('monday 22 august 2011 10h 30m 0s +2')(subject));
console.log(match('monday 22 august 2011 7h 30m 0s -1')(subject));
console.log(match('monday 22 august 2011 9h 00m 0s +.5')(subject));
console.log(match('monday 22 august 2011 10h 00m 0s +1.5')(subject));
