var rest = require('restler')
var prompt = require('prompt')
var RSVP = require('rsvp')
var Lazy = require('lazy.js')
var gitscrub = module.exports


isAuth = false;
userObj = {}
GITHUB_USERNAME_URL = 'https://api.github.com/users/'
GITHUB_API_URL = 'https://api.github.com/'
repoList = new Array();
readmeDump = {}
repoArray = []


gitscrub.authenticate = function(name, pwd, logValue) {
  rest.get(GITHUB_USERNAME_URL + name, {
    username: name,
    password: pwd
  }).on('complete', function(data) {
    isAuth = (data.message === "Bad credentials") ? false : true
    logValue(isAuth)
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
          rest.get(GITHUB_API_URL + 'repos/' + userObj.username + '/' + repoList[rName] + '/readme', {
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
    // var readMeParsed = Lazy(readme).split("\n")
    // position = -1
    // readMeParsed.each(function(line) {
    //   if (line.substring(0, 2) === "# ") {
    //     position++
    //     formattedReadMe[position].push({
    //       header: line.substring(2),
    //       text: "",
    //       jotNotes: []
    //     }) 
    //   } else if (line.substring(0, 3) === "## ") {
    //     header = line.substring(3)
    //   } else if (header != "") {
    //     if (line.substring(0,2) === "* " || line.substring(0,2) === "- "){
    //       formattedReadMe[position].jotNotes.push(line.substring(2))
    //     }else{
    //       formattedReadMe[position].text += line  
    //     }
    //   }
    // })
  var position = 0
  isFirst = false
  var readMeArray = readme.split('\n').filter(function(line) {
    return line !== ''
  })
  for (i = 0; i < readMeArray.length; i++) {
    var line = readMeArray[i]
    if (line.substring(0, 2) === "# ") {
      formattedReadMe.title = line.substring(2)
    } else if (line.substring(0, 3) === '## ') {
      position = (isFirst) ? position : position + 1
      formattedReadMe.headers[position] = {
        header: line.substring(3),
        text: 't',
        jotNotes: []
      }
    } else {
      if (line.substring(0, 2) === '* ' || line.substring(0,2) === '- ') {
        formattedReadMe.headers[position].jotNotes.push(line.substring(2))
      } else{
        console.log(formattedReadMe.headers)
      }
    } 
  }

  console.log(formattedReadMe)
  callback(formattedReadMe)
}

gitscrub.parseAllReadMes = function(options, callback) {
  var totalList = new Array();
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
        userObj.username = name
        userObj.password = pwd
        resolve(data)
          //console.log('Good credentials!');
      } else {
        reject(function() {
          return "Bad credentials!"
        });
      }
    })
  }).then(function(data) {
    gitscrub.getAllRepos(function(repoData) {
      for (var result in repoData) {
        repoArray.push(repoData[result].name)
      }
      gitscrub.grabAllReadmes(function(readMeData) {
        gitscrub.parseAllReadMes(options, function(parsedReadMes) {
          callback(parsedReadMes)
        })
      })
    })
  }).catch(function(error) {
    console.log(error())
  })
}