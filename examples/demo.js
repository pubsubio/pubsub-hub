var query = require('./query');



var subject = new Date('august 22 2011 10:30:00');
//var subject = new Date();
console.log(query.filter([{time:subject}],{time:{$datetime:'tuesday'}}));


//console.log(query.reverse([{},{hi:1},{hi:{$gt:1}},{hi:{$gte:1}},{hi:{$gt:1,$lt:10}}],