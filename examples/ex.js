var query = require('./query');
var berlin = {
  lon: 52.523,
  lat: 13.412
};
query.reverse(point:$distance:)
//console.log(query.filter([{hi:3},{hi:10},{hi:14},{hi:11},{hi:30}],{hi:{$gt:5,$lt:23,$mod:[2,0]}}));

//console.log(query.filter([{id:1},{id:2}],{id:{$gt:0}}));
//console.log(query.reverse([{id:{$gt:1}},{id:1}],{id:2}));

/*var query = {
    age: {$gt:20, $lte:40, $mod:[2,0]} // only match even ages between 20+ and 40        
};*/

/*var oslo = {
  lon: 59.914,
  lat: 10.752
};
var berlin = {
  lon: 52.523,
  lat: 13.412
};*/


var subject = new Date('august 22 2011 10:30:00');
var subject = new Date();
console.log(query.filter([{time:subject}],{time:{$datetime:'sat 09:--:-- +2'}}));