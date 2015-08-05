var rest = require('restler')
var RSVP = require('rsvp')
var fs = require('fs')
var path = require('path')
var sort = require('./sort.json')
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
defaultOptions = {}
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
    /* istanbul ignore if */
    if (err) {
      throw err
    }
  })
  defaultOptions = {}
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
        /* istanbul ignore if */
        if (err) {
          logValue(err, null)
        } else {
          var reposToScrub = JSON.parse(data);
          // check if repos specified in argument are valid and
          // push them onto our local reposToScrub object
          for (var repo in reposToSelect) {
            if (repoList.indexOf(reposToSelect[repo]) > -1 && reposToScrub.repos.indexOf(reposToSelect[repo]) < 0) {
              reposToScrub.repos.push(reposToSelect[repo])
            }
          }
          // finally, write our modified repostoScrub object back to the file
          fs.writeFile(path.join(__dirname, fileName), JSON.stringify(reposToScrub, null, 2), function(err) {
            /* istanbul ignore if */
            if (err) {
              logValue(err, null)
            } else {
              logValue(null, true)
            }
          })
        }
      })
    })
  } else {
    logValue("Argument must be an array of repos to scrub", null)
  }
}

gitscrub.clearSelRepos = function(optionalFileName, logValue) {
  fileName = optionalFileName || gitscrub.standardFileName
  fs.readFile(path.join(__dirname, fileName), 'utf8', function(err, data) {
    if (err) {
      logValue(err, null)
    } else {
      var reposToScrub = JSON.parse(data);
      reposToScrub.repos = []
      fs.writeFile(path.join(__dirname, fileName), JSON.stringify(reposToScrub, null, 2), function(err) {
        /* istanbul ignore if */
        if (err) {
          logValue(err, null)
        }
        logValue(null, true)
      })
    }
  })
}

gitscrub.getSelRepos = function(fileName, logValue) {
  fs.readFile(path.join(__dirname, fileName), 'utf8', function(err, data) {
    if (err) {
      logValue(err, false)
    } else {
      if (typeof data !== 'undefined') {
        var reposToScrub = JSON.parse(data)
        var repos = reposToScrub.repos
        for (var repo in repos) {
          selRepoList.push(repos[repo])
        }
        logValue(undefined, selRepoList)
      } else {
        if (typeof err === 'undefined') {
          logValue("Error!", false)
        }
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

gitscrub.setOptions = function(options) {
  //Append to options instead of resetting
  for (obj in options) {
    defaultOptions[obj] = options[obj]
  }
}

gitscrub.getOptions = function(callback) {
  callback(defaultOptions)
}
gitscrub.resetOptions = function() {
  defaultOptions = {}
}

gitscrub.isUndefined = function(check) {
  return (typeof check === "undefined")
}

gitscrub.configSecret = function(options, done) {
  if (options.clear) {
    fs.writeFile(path.join(__dirname, 'secret.js'), '', function(err) {
      /* istanbul ignore if */
      if (err) {
        done(false, true)
      }
      done(true, false)
    })
  } else if (options.set) {
    fs.writeFile(path.join(__dirname, 'secret.js'), '', function(err) {
      /* istanbul ignore if */
      if (err) {
        done(false, true)
      }
      formattedString = 'secret = module.exports\nsecret.username = \'' + options.username +
        '\'\nsecret.password = \'' + options.password + '\''
      fs.writeFile(path.join(__dirname, 'secret.js'), formattedString, function(err) {
        /* istanbul ignore if */
        if (err) {
          done(false, true)
        }
        done(true, false)
      })
    })
  }
}

function alphaSort(a, b) {
  lowerCaseA = a.title.toLowerCase()
  lowerCaseB = b.title.toLowerCase()
  return (lowerCaseA > lowerCaseB) ? 1 : (lowerCaseB > lowerCaseA ? -1 : 0) 
}

gitscrub.sort = function(list, callback) {
  if (!sort.enabled) {
    callback(false, list)
  } else if (sort.alphabetical) {
    list.sort(alphaSort)
    callback(false, sort.reverse ? list.reverse() : list)
  }
}

function updateSort(sortObject){
  fs.writeFileSync(path.join(__dirname, 'sort.json'),
                JSON.stringify(sortObject, null, 2))
  refreshSort()
}

function refreshSort(){
  sort =  JSON.parse(fs.readFileSync(path.join(__dirname, 'sort.json')))
}

gitscrub.setSortOptions = function(options){
  for (obj in options){
    sort[obj] = options[obj]
  }
  updateSort(sort)
}

gitscrub.filter = function(list, filter, callback){
	retArr = []

	for (obj in list){
		if (filter.indexOf(list[obj].title) > -1){
			retArr.push(list[obj])
		}
	}
	callback(false, retArr)
}

gitscrub.scrubADubDub = function(name, pwd, options, callback) {	
  definedOptions = options || defaultOptions
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
           if(typeof definedOptions['filter'] === 'undefined'){
            callback(parsedReadMes, undefined)
           }else{
            gitscrub.filter(parsedReadMes, definedOptions['filter']['repos'], function(err, result){
              callback(false, result)
            })
           }
        })
      })
    })
  }).catch(function(error) {
    callback(undefined, error)
  })
}