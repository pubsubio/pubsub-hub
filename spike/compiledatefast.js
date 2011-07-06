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
	var map = {};

	matches[0] && (map.getUTCDay = ['sun','mon','tue','wed','thu','fri','sat'].indexOf(matches[0].substring(0, 3).toLowerCase()));
	matches[1] && (map.getUTCDate = parseInt(matches[1], 10));
	matches[2] && (map.getUTCMonth = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(matches[2].substring(0,3).toLowerCase()));
	matches[3] && (map.getUTCFullYear = parseInt(matches[3], 10));

	var time = matches[4] && matches[4].split(':');
	
	if (time) {
		time[0] !== '--' && (map.getUTCHours = parseInt(time[0], 10));
		time[1] !== '--' && (map.getUTCMinutes = parseInt(time[1], 10));
		time[2] !== '--' && (map.getUTCSeconds = parseInt(time[2], 10));
	}
	
	return function(date) {
		if (offset) {
			date = new Date(date.getTime() + 60000 * offset);
		}
		for (var method in map) {
			if (date[method]() !== map[method]) {
				return false;
			}
		}
		return true;
	};
};

//match('monday');

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

//var subject = new Date('august 22 2011 10:30:00');
//for(var i in tests) {
//	console.log(match(tests[i])(subject));
//}
