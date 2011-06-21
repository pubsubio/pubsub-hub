# Pubsub.io documentation
**a query based client/server publish subscribe protocol built on node.js.**

Client implementions currently exists for the browser and node.js.


	// to connect in node.js do:
	var pubsub = require('pubsub').connect('www.pubsub.io');

	// to connect in the browser do:
	var pubsub = pubsub.connect('www.pubsub.io');

	pubsub.subscribe({}, function(doc) {
		console.log('someone published', doc);
	});

	pubsub.publish({foo:'bar'});

### [try running this yourself](http://jsconsole.com/?%3Aload%20http%3A%2F%2Fpubsub.io%2Fjs%2Fpubsub.js)

The client library is hosted at [http://pubsub.io/js/pubsub.js](http://pubsub.io/js/pubsub.js)

# Publish

Whenever you want to send documents to other pubsub clients you need to publish it.
The published document is then received by all subscribers whose query match the document.

	pubsub.publish({name: 'pubsub', authors: ['mathias', 'ian'], version: 0.1});

# Subscribe

Whenever you want to receive documents from other pubsub clients you need to create a subscription with a query.
The subscription is evaluated at the hub against all documents as they are published, if the query matches the published document your subscription handler will invoked with the document.

	pubsub.subscribe({name: 'pubsub', version: {$gt:0}}, function(doc) {
		console.log('i love',doc);
	});
	
Subscribe can also be called with the following options
	
	// count
	pubsub.subscribe(query, {count:2}, function(doc){
		console.log(doc); // will be called upto 2 times
	});
	
	// once
	pubsub.subscribe(query, {once:true}, function(doc){
		console.log(doc); // will be called at most once
	});

	// frequency
	pubsub.subscribe(query, {frequency:1000}, function(doc){
		console.log(doc); // will be called at most once per 1000 ms
	});
	
	// select
	pubsub.subscribe(query, {select:{property1:1, property2:1}}, function(doc){
		console.log(doc); // will only contain the selected properties
	});
	
# Unsubscribe

In order to unsubscribe a subscription, you call the function returned when subscribing

	var sub = pubsub.subscribe({foo:'bar'},function(doc) {
		console.log(doc);
	}); // creates the subscription

	sub(); // removes the subscription

# Token and authentication

As a subscriber you can use authentication to make sure that you can trust the data you subscribe to. In order to do this the publisher must provide signed 'authenticated' properties. The signed properties are provided by the token.

As a publisher you can use authentication to limit the subscribers by the data by demanding that they use signed properties in their subscription queries.

	var token = ... get authtoken from you authentication enpoint
	// in order for the hub to verifed the signed token it need to share key with the authentication enpoint

	// we subscribe as a signed user so publishers can trust us
	pubsub.subscribe({to: token.user, from: {$authenticated:'user',value:'transmitter'}}, function(doc) {
		// the doc.from was authenticated as a user, the doc can therefore be trusted
	});

	// we want to limit the subscribers to authenticated users only
	pubsub.publish({to: {$authenticated:'user', value:'receiver'},from: token.user});

# The Query Language

The query language syntax is derived from the query language of [mongodb](http://mongodb.com).  
In general any property of a query that is not a language property represents a `===` relation,
except if it is a regex - it is then the same as a `$regex` relation.

The language consists of 2 parts. The outer language `{$outer:...}` and the inner language `{prop:{$inner:...}}`.

## The outer language
`$has: key(s)` checks if the document has the given keys. multiple has an `and` relation	
`$or: [paths]` define multiple query paths

	var query = {
		$or: [{
			name:'mafintosh' // check where the name is mafintosh
		}, {
			{$has:'alias'}   // or wether it has a property called alias
		}]
	};

## The inner language

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

`$not: value`      must not be equal to value or match value if it is a regex  
	
All language properties can be negated by putting `$not` in front of it,
i.e. `$notnil` checks if a property is different from `undefined` and `null`

	var query = {
		friend: {$notlike:'nemesis'} // our friend must not contain the substring nemesis
	};