var gitscrub = require('./lib/gitscrub');
var secret = require('./lib/secret');

value = undefined;

gitscrub.authenticate(secret.username, secret.password, function(resultData){
    value = resultData;
    console.log(value);
});