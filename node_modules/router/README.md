# Router
A lean and mean web router for [node.js](http://nodejs.org).  
It is available through npm:

	npm install router
	
The router routes using the method and a pattern

``` js
var router = require('router').create();

router.get('/', function(request, response) {
	response.writeHead(200);
	response.end('hello index page');
});

router.listen(8080); // start the server on port 8080
```

If you want to grap a part of the path you can use capture groups in the pattern:

``` js
router.get('/{base}', function(request, response) {
	var base = request.matches.base; // ex: if the path is /foo/bar, then base = foo
});
```

The capture patterns matches until the next `/` or character present after the group

``` js
router.get('/{x}x{y}', function(request, response) {
	// if the path was /200x200, then request.matches = {x:'200', y:'200'}
});
```

You can also use regular expressions and the related capture groups instead:

``` js
router.get(/^\/foo\/(\w+)/, function(request, response) {
	var group = request.matches[1]; // if path is /foo/bar, then group is bar
});
```

Besides `get` the avaiable methods are `post`, `put`, `head`, `del`, `request` and `upgrade`.
`request` matches all the standard http methods and `upgrade` is usually used for websockets.