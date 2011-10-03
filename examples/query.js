var querify = require('querify');

var filter = function(data, query) {
	return querify.filter(data, {query:query});
};
exports.filter = filter;

var reverse = function(queries, data) {
	var result = [];
	
	queries.forEach(function(query) {
		if (querify.compile(query)(data)) {
			result.push(query);
		}
	});
	
	return result;
};
exports.reverse = reverse;