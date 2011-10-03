# buffoon

a module for buffering streams into strings, buffers, json or queries.  
it's available through npm

	npm install buffoon

usage is simple

``` js
var buffoon = require('buffoon');

// convert a stream to a string
buffoon.string(stream, console.log);

// convert a stream to a specific string encoding (defaults to utf-8)
buffoon.string(stream, 'ascii', console.log);

// buffer a stream into a single buffer
buffoon.buffer(stream, console.log);

// parse a stream as json
buffoon.json(stream, console.log);

// parse a stream as a querystring
buffoon.query(stream, console.log);
```