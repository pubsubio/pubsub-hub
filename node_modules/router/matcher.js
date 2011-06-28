var escapeRegex = function(str) {
	return str.replace(/([\/\\\*\+\.\?\|\(\)\[\]\{\}])/g, '\\$1');
};

module.exports = function(pattern) {
	if (typeof pattern !== 'string') { // regex
		return function(url) {
			return url.match(pattern);
		};
	}
	var offset = 0;
	var keys = [];
	var res = '^';

	pattern.replace(/\{[^\{\}]+\}/g, function(a,b) { // a hack - we use replace as a tokenizer :)
		res += escapeRegex(pattern.substring(offset, b));
		offset = a.length+b;

		res += '([^\\'+(pattern[offset]||'/')+']*)';

		keys.push(a.substring(1, a.length-1));		
	});

	res += escapeRegex(pattern.substring(offset));
	res += (res[res.length-1] === '/' ? '' : '/?')+'$';
	res = new RegExp(res, 'i');

	if (!keys.length) { // small optimization
		return function(str) {
			return res.test(str);
		};
	}
	return function(str) {
		var match = str.match(res);

		if (!match) {
			return match;
		}
		var map = {};
		
		match.slice(1).forEach(function(result, i) {
			map[keys[i]] = result;
		});
		
		return map;
	};
};