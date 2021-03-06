/**
 * This class is getting too big...
 * -vk
 */
var rest = require('restler')
var RSVP = require('rsvp')
var restadapter = require('./restadapter')
var fs = require('fs')
var path = require('path')
var sort = require('./sort.json')
var stringUtils = require('./utils/stringUtils.js')
var gitscrub = module.exports

const GITHUB_USERNAME_URL = 'https://api.github.com/users/'
const GITHUB_API_URL = 'https://api.github.com/'
const GITHUB_README = 'readme'

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
  selRepoList = []
  var emptyReposList = {
    repos: []
  }
  fs.writeFileSync(path.join(__dirname, gitscrub.standardFileName), JSON.stringify(emptyReposList, null, 2))
  defaultOptions = {}
  gitscrub.standardFileName = 'repos_to_scrub.json'
}

gitscrub.authenticate = function(name, pwd, logValue) {
  restadapter.get(GITHUB_USERNAME_URL + name, {username: name, password: pwd}, function(data){
    gitscrub.isAuth = (typeof data.message !== "undefined") ? false : true
    if (gitscrub.isAuth) {
      userObj.username = name
      userObj.password = pwd
    }
    logValue(gitscrub.isAuth)
  })
}

gitscrub.getAllRepos = function(userObject, logValue) {
  restadapter.get(GITHUB_USERNAME_URL + userObject.username + '/repos',
      {username: userObject.username, password: userObject.password}, function(data){
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
          try{
            var reposToScrub = JSON.parse(data)
          }catch(e){
            console.error(e)
          }
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
  var file = defaultOptions['customFile'] || GITHUB_README
  promise = new RSVP.Promise(function(resolve, reject) {
    for (name in repoList) {
      (function(rName) {
        var repoName = repoList[rName]
        nestedPromise = new RSVP.Promise(function(nResolve, nReject) {
          rest.get(GITHUB_API_URL + 'repos/' + userObj.username + '/' + repoName + '/' + file, {
            username: userObj.username,
            password: userObj.password
          }).on('complete', function(data) {
            if (data.message != 'Not Found'){
              data['repoName'] = repoName
            } else {
              data['undefined'] = true
            }
            data['rName'] = rName
            nResolve(data, rName)
          }).on('error', function(err){
            throw err
          })
        })
        nestedPromise.then(function(result) {
          currentIndex = parseInt(result['rName']) + 1
          if (!result['undefined']) {
            var bString = result['content']
            var buf = new Buffer(bString, 'base64')
            readmeDump[result['repoName']] = buf.toString('utf-8')
          }
          if (currentIndex === repoList.length) {
            resolve(readmeDump)
          }
        })
      })(name)
    }
    /* istanbul ignore next */
  }).catch(function(e){
        throw e
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
  var position = 0
  isFirst = true
  var readMeArray = readme.split('\n').filter(function(line) {
    return line !== ''
  })

  for (i = 0; i < readMeArray.length; i++) {
    var line = readMeArray[i]
    if (line.substring(0, 2) === "# ") {
      formattedReadMe.title = stringUtils.rTrim(line, 2)
    } else if (line.substring(0, 3) === '## ') {
      position = (isFirst) ? position : position + 1
      isFirst = false
      formattedReadMe.headers[position] = {
        header: stringUtils.rTrim(line, 3),
        text: '',
        jotNotes: []
      }
    } else if (typeof formattedReadMe.headers[position] != 'undefined') {
      if (line.substring(0, 2) === '* ' || line.substring(0, 2) === '- ') {
        formattedReadMe.headers[position].jotNotes.push(stringUtils.rTrim(line, 2))
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
  options = options || []
  if (options.indexOf('select') > -1){
    gitscrub.getSelRepos(gitscrub.standardFileName, function(err, result){
      var expectedObj = []
      for (readme in readmeDump){
        if (result.indexOf(readme) > -1){
          expectedObj.push(readme)
        }
      }
      for (repo in expectedObj){
        parse(expectedObj[repo], expectedObj.length)
      }
    })
  } else {
    for (readme in readmeDump) {
      parse(readme, Object.keys(readmeDump).length)
    }
  }

  function parse(rName, expectedIndex){
    gitscrub.parseReadMe(readmeDump[rName], null, function(data) {
      if (data.title != ''){
        totalList.push(data)
      }
      if (currentIndex + 1 === expectedIndex) {
        if (options.indexOf('sort') > -1){
          gitscrub.customSort(totalList, function(result){
            callback(result)
          })
        } else {
          callback(totalList)
        }
      }
      currentIndex++
    })

  }
}

gitscrub.setOptions = function(options) {
  //Append to options instead of resetting
  for (obj in options) {
    defaultOptions[obj] = options[obj]
  }
}

gitscrub.getOptions = function() {
  return defaultOptions
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
  refreshSort()
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

gitscrub.scrubADubDub = function(name, pwd, options, callback) {	
  definedOptions = options || []
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

//Can someone do better than n^2?
gitscrub.customSort = function(sortList, callback){
  refreshSort()
  retVal = []
  for (repo in sort['custom']){
    for (repoObj in sortList){
      if (sortList[repoObj].title === sort['custom'][repo]){
        retVal.push(sortList[repoObj])
        break
      }
    }
  }
  callback(retVal)
}