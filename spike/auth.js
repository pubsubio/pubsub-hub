var signer = require('signer');

// subscriptions:

var ex1 = {user: {$authenticated:1, value:'ian'}};
var ex2 = {from: {$authenticated:'user', value:'mathias'}};
var ex3 = {from: {$authenticated:'user'}};

