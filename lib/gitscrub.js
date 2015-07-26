var rest = require('restler')
var RSVP = require('rsvp')
var Lazy = require('lazy.js')
var fs = require('fs')
var path = require('path')
var gitscrub = module.exports

GITHUB_USERNAME_URL = 'https://api.github.com/users/'
GITHUB_API_URL = 'https://api.github.com/'

gitscrub.isAuth = false
userObj = {}
repoList = []
repoList = []
selRepoList = []
readmeDump = {}
repoArray = []

gitscrub.standardFileName = 'repos_to_scrub.json'

gitscrub.reset = function() {
  gitscrub.isAuth = false
  userObj = {}
  repoList = []
  readmeDump = {}
  repoArray = []
  var emptyReposList = {
    repos: []
  }
  fs.writeFile(path.join(__dirname, gitscrub.standardFileName), JSON.stringify(emptyReposList, null, 2), function(err) {
    if (err) {
      throw err
    }
  })

}

gitscrub.authenticate = function(name, pwd, logValue) {
  rest.get(GITHUB_USERNAME_URL + name, {
    username: name,
    password: pwd
  }).on('complete', function(data) {
    gitscrub.isAuth = (typeof data.message !== "undefined") ? false : true
    if (gitscrub.isAuth) {
      userObj.username = name
      userObj.password = pwd
    }
    logValue(gitscrub.isAuth)
  })
}

gitscrub.getAllRepos = function(userObject, logValue) {
  rest.get(GITHUB_USERNAME_URL + userObject.username + '/repos', {
    username: userObject.username,
    password: userObject.password
  }).on('complete', function(data) {
    var success = (typeof data.message !== "undefined") ? false : true
    if (success) {
      // clear the repoList first in case of duplicates
      repoList = []
      for (var result in data) {
        repoList.push(data[result]['name'])
      }
      logValue(data)

    } else {
      logValue(false)
    }

  })
}

gitscrub.selectRepos = function(reposToSelect, optionalFileName, logValue) {
  if (Array.isArray(reposToSelect)) {
    fileName = optionalFileName || gitscrub.standardFileName
    gitscrub.getAllRepos({
      username: userObj.username,
      password: userObj.password
    }, function(data) {
      // first retrieve existing object from repos_to_scrub.json
      fs.readFile(path.join(__dirname, fileName), 'utf8', function(err, data) {
        if (err) {
          throw err
        }
        var reposToScrub = JSON.parse(data);
        // first clear the stored list of repos
        reposToScrub.repos = [];
        // check if repos specified in argument are valid and
        // push them onto our local reposToScrub object
        for (var repo in reposToSelect) {
          if (repoList.indexOf(reposToSelect[repo]) > -1) {
            reposToScrub.repos.push(reposToSelect[repo])
          }
        }
        // finally, write our modified repostoScrub object back to the file
        fs.writeFile(path.join(__dirname, fileName), JSON.stringify(reposToScrub, null, 2), function(err) {
          if (err) {
            throw err
          }
          logValue(true, undefined)
        })
      })
    })
  } else {
    logValue(undefined, "Argument must be an array of repos to scrub")
  }
}

gitscrub.getSelRepos = function(fileName, logValue) {
  fs.readFile(path.join(__dirname, fileName), 'utf8', function(err, data) {
    if (err) {
      logValue(false, err)
    }

    if (typeof data !== 'undefined') {
      var reposToScrub = JSON.parse(data)
      var repos = reposToScrub.repos
      for (var repo in repos) {
        selRepoList.push(repos[repo])
      }
      logValue(selRepoList, undefined)
    } else {
      if (typeof err === 'undefined') {
        logValue(false, "Error!")
      }
    }
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
          rest.get(GITHUB_API_URL + 'repos/' + userObj.username + '/' + repoName + '/readme', {
            username: userObj.username,
            password: userObj.password
          }).on('complete', function(data) {
            if (typeof data['content'] !== "undefined") {
              data['repoName'] = repoName
              nResolve(data)
            }
          })
        })
        nestedPromise.then(function(result) {
          var bString = result['content']
          var buf = new Buffer(bString, 'base64')
          readmeDump[result['repoName']] = buf.toString('utf-8')
          if (++rName == repoList.length) {
            resolve(readmeDump)
          }
        })
      })(name)
    }

  })

  promise.then(function(result) {
    logValue(result)
  })
}

gitscrub.parseReadMe = function(readme, options, callback) {
  var formattedReadMe = {
    title: '',
    headers: []
  }

  var header = ""
  var jotNoteArray = []
  var position = 0
  isFirst = true
  var readMeArray = readme.split('\n').filter(function(line) {
    return line !== ''
  })

  for (i = 0; i < readMeArray.length; i++) {
    var line = readMeArray[i]
    if (line.substring(0, 2) === "# ") {
      formattedReadMe.title = line.substring(2)
    } else if (line.substring(0, 3) === '## ') {
      position = (isFirst) ? position : position + 1
      isFirst = false
      formattedReadMe.headers[position] = {
        header: line.substring(3),
        text: '',
        jotNotes: []
      }
    } else if (typeof formattedReadMe.headers[position] != 'undefined') {
      if (line.substring(0, 2) === '* ' || line.substring(0, 2) === '- ') {
        formattedReadMe.headers[position].jotNotes.push(line.substring(2))
      } else if (typeof formattedReadMe.headers[position] !== 'undefined') {
        formattedReadMe.headers[position].text += line
      }
    }
  }

  callback(formattedReadMe)
}

gitscrub.parseAllReadMes = function(options, callback) {
  var totalList = []
  var currentIndex = 0
  for (readme in readmeDump) {
    (function(rName) {
      currentIndex++
      gitscrub.parseReadMe(readmeDump[rName], null, function(data) {
        totalList.push(data)
        if (currentIndex + 1 === Object.keys(readmeDump).length) {
          callback(totalList)
        }
      })
    })(readme)

  }
}

gitscrub.scrubADubDub = function(name, pwd, options, callback) {
  var promise = new RSVP.Promise(function(resolve, reject) {
    gitscrub.authenticate(name, pwd, function(data) {
      if (data) {
        resolve(data)
      } else {
        reject("Bad Credentials!");
      }
    })
  }).then(function(data) {
    gitscrub.getAllRepos(userObj, function(repoData) {
      for (var result in repoData) {
        repoArray.push(repoData[result].name)
      }

      gitscrub.grabAllReadmes(function(readMeData) {
        gitscrub.parseAllReadMes(options, function(parsedReadMes) {
          callback(parsedReadMes, undefined)
        })
      })
    })
  }).catch(function(error) {
    callback(undefined, error)
  })
}