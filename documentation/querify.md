# querify - the query language of pubsub.io

*draft 1 - june 2011, [@mafintosh](http://twitter.com/mafintosh), [@ianjorgensen](http://twitter.com/ianjorgensen)*

the query language syntax is derived from the query language of [mongodb](http://mongodb.com).  
in general any property of a query that is not a language property represents a `===` relation,
except if it is a regex - it is then the same as a `$regex` relation.

the language consists of 2 parts. the outer language `{$outer:...}` and the inner language `{prop:{$inner:...}}`.

## the outer language
`$has: key(s)` checks if the document has the given keys. multiple has an `and` relation	
`$or: [paths]` define multiple query paths

	var query = {
		$or: [{
			name:'pubsub.io' // check where the name pubsub.io
		}, {
			{$has:'alias'}   // or wether it has a property called alias
		}]
	};

## the inner language

`$exists: bool`    checks if the given property exists  
`$nil: bool`       is `undefined` or `null`  

	var query = {
		name: {$nil:false},   // will reject if name is null or undefined
		coupling: {$exists:false} // document must not have a property called coupling
	};
	
`$any: value(s)`   is equal to any of the values  
`$regex: regex`    must match regex  
`$like: substr`    property must have a substring which is case-insensitive equal to substr  

	var query = {
		name: {$any:['mathias', 'ian']},  // name must be equal to either mathias or ian
		project: /pubsub\.io/i            // project should have a substring pubsub.io in any case
	};
	
`$gt: num`         must be strictly greater than the num  
`$gte: num`        must be greater or equal than the num  
`$lt: num`         must be strictly lower than the num  
`$lte: num`        must be lower or equal than the num  
`$mod: [base,val]` same as `property % base === val`  

	var query = {
		age: {$gt:20, $lte:40, $mod:[2,0]} // only match even ages between 20+ and 40		
	};

`$datetime: pattern`	query against dates. Pattern format: day? date? month? year? hour? minute? second? e.g. `Monday 22 August 2011 10h 30m 01s`
	
	var query = {
		time : {$datetime: 'monday 2011'} // matches dates on mondays in 2011
	}
	
	var query = {
		time : {$datetime: '10h 30m 00s'} // matches dates every day at 10:30:00 am 
	}
`$not: value`      must not be equal to value or match value if it is a regex  
	
all language properties can be negated by putting `$not` in front of it.
i.e. `$notnil` checks if a property is different from `undefined` and `null`

	var query = {
		friend: {$notlike:'nemesis'} // our friend must not contain the substring nemesis
	};
