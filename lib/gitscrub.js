var rest = require('restler');
var prompt = require('prompt');
var RSVP = require('rsvp');
var gitscrub = module.exports;


isAuth = false;
userObj = {}
GITHUB_USERNAME_URL = 'https://api.github.com/users/'
GITHUB_API_URL = 'https://api.github.com/'
var repoList = new Array();
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
    if (typeof data['content'] === "undefined") {
      data['content'] = ""
    }
    logValue(data);
  })
}

gitscrub.grabAllReadmes = function(logValue) {
  promise = new RSVP.Promise(function(resolve, reject) {
    for (name in repoList) {
      (function(rName) {
        var repoName = repoList[rName]
        nestedPromise = new RSVP.Promise(function(nResolve, nReject) {
          rest.get(GITHUB_API_URL + 'repos/' + userObj.username + '/' + repoList[name] + '/readme', {
            username: userObj.username,
            password: userObj.password
          }).on('complete', function(data) {
            if (data['content'] != undefined) {
              data['repoName'] = repoName
              nResolve(data)
            }
          })
        })
        nestedPromise.then(function(result) {
          var bString = result['content']
          var buf = new Buffer(bString, 'base64')
          readmeDump[repoName[name]] = buf.toString('utf-8')
          if (++rName == repoList.length){ resolve(readmeDump) }
        })
      })(name)
    }

  })

  promise.then(function(result) {
    logValue(result)  
  })
}