var rest = require('restler');
var prompt = require('prompt');
var gitscrub = module.exports;


isAuth = false;
userObj= {}
GITHUB_URL = 'https://api.github.com/users/'
repoList = {}

gitscrub.authenticate = function(name, pwd, logValue){
    rest.get(GITHUB_URL + name, {
    username: name,
    password: pwd
    }).on('complete', function(data){
        isAuth = true;
        userObj.username = name;
        userObj.password = pwd;
        logValue(data);
    })
}

gitscrub.getAllRepos = function(logValue){
  rest.get(GITHUB_URL + userObj.username + '/repos', {

  }).on('complete', function(data){
    repoList = data;
    logValue(data)
  })
}