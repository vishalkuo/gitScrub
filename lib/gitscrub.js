var rest = require('restler');
var prompt = require('prompt');
var gitscrub = module.exports;


isAuth = false;
userObj= {}

gitscrub.authenticate = function(username, password, logValue){
    rest.get('https://api.github.com/users/' + username, {
    username: username,
    password: password
    }).on('complete', function(data){
        isAuth = true;
        userObj.username = username;
        userObj.password = password;
        logValue(data);
    })
}

if (isAuth){
  gitscrub.getreadme = function(){

  }
}