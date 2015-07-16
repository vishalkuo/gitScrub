
var rest = require('restler');
var prompt = require('prompt');
var gitscrub = module.exports;


isAuth = false;
userObj = {}
GITHUB_USERNAME_URL = 'https://api.github.com/users/'
GITHUB_API_URL = 'https://api.github.com/'
repoList = {}
readmeDump = {}

gitscrub.authenticate = function(name, pwd, logValue) {
  rest.post(GITHUB_USERNAME_URL + name, {
    username: name,
    password: pwd
  }).on('complete', function(data) {
    isAuth = true;
    userObj.username = name;
    userObj.password = pwd;
    logValue(data);
  })
}

gitscrub.getAllRepos = function(logValue) {
  rest.get(GITHUB_USERNAME_URL + userObj.username + '/repos', {
    username: userObj.username,
    password: userObj.password
  }).on('complete', function(data) {
    for (var result in data) {
      repoList.push(data[result]['name'])
    }
    logValue(data)
  })
}

gitscrub.grabReadMeAtRepo = function(repoName, logValue) {
  rest.get(GITHUB_API_URL + 'repos/' + userObj.username + '/' + repoName + '/readme', {
    username: userObj.username,
    password: userObj.password
  }).on('complete', function(data) {
    logValue(data)
  })
}

gitscrub.grabAllReadmes = function(logValue) {
    for (name in repoList) {
      rest.get(rest.get(GITHUB_API_URL + 'repos/' + userObj.username + '/' + repoList[name] + '/readme', {
          username: userObj.username,
          password: userObj.password
        }).on('complete', function(data) {
          var b64String = data['content']
          var buf = new Buffer(b64string, 'base64')
          readmeDump.push({repoList[name], buf.toString('utf-8')})
        })
      }
    }
