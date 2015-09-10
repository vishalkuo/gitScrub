# gitScrub

## Status
[![Build Status](https://travis-ci.org/vishalkuo/gitScrub.svg?branch=master)](https://travis-ci.org/vishalkuo/gitScrub)
[![Coverage Status](https://coveralls.io/repos/vishalkuo/gitScrub/badge.svg?branch=master&service=github)](https://coveralls.io/github/vishalkuo/gitScrub?branch=master)
[![Dependencies](https://david-dm.org/vishalkuo/gitscrub.svg)](https://david-dm.org/vishalkuo/gitscrub.svg)

## Installation
* In your project directory: ```npm install --save-dev gitscrub```
* In your project: ```var gs = require('gitscrub')```
* To save Github username and password, first add a filename to your .gitignore. I called mine secret.js. Open this up in project root by typing ```nano .gitignore```

### .gitignore ###
```gitignore
#Other file names
secret.js #Or whatever you named your username/password file
```
### secret.js ###
```Javascript 
  secret = module.exports;
  secret.username = YOUR_GITHUB_USERNAME
  secret.password = YOUR_GITHUB_PASSWORD
```

## Usage
```Javascript
var gs = require('gitscrub')
var secret = require('./path_to_secret.js')
//Options is a WIP
var options = null
//This is the most basic configuration
gitscrub.scrubadubdub(secret.username, secret.password, options, function(data){
  for (i = 0; i < data.length; i++){
    console.log(data[i].title )
    console.log(data[i].headers)
  }
})
```

## GitScrub Format
* Always start headers with ```##``` with a space following afterwards 
* Title will always start with ```#``` with a space following afterwards
* Jot notes will be parsed into their own array inside of each header object. Be prepared for that
* Headers ```###``` or longer will simply be included in the most recent header object.
* Code blocks are not formatted yet. This is a feature that welcomes a PR. 
* Output format is structured as follows: 
```
[{title: 'repo title',
  headers:[
      {
        header: 'header title',
        text: 'body text',
        jotNotes: [jotNote1, jotNote2, ...],
      }
      //Rest of your headers...
    ]
  }
//Rest of your repos...
]
```
* Check out the raw version of this readme for what a formatted read me will end up looking like and checkout ```tests/scrubadubub.json``` for what your readmes will parse to

## Options
### Selecting & Custom Sorting Repos
```Javascript
var gitscrub = require('gitscrub')
var secret = require('./secret')
//List your repos exact titles below
gitscrub.setSortOptions({'custom': [
    'FuturesRevealed',
    'gitScrub',
    'pasteDump',
    'codeStats',
    'arduinoBrakelightBackpack',
    'Grumble',
    'Summon (A.K.A. Genie)',
    'dotDash',
    'dinnerBell',
    'StarRush']})
gitscrub.scrubADubDub(secret.username, secret.password, null, function(result, err){
    gitscrub.customSort(result, function(done){
        //Data is outputted like this to easily be loaded into an HTML page and rendered using Angular
        console.log('data = ' + JSON.stringify(done,null, 1))
    })
})
```

### Selecting files other than README
```Javascript
var gitscrub = require('gitscrub')
var secret = require('./secret')
//List your repos exact titles below
//This will select all files named license.md and parse them just like the readme is
gitscrub.setOptions({customFile: 'license'})
gitscrub.scrubADubDub(secret.username, secret.password, null, function(result, err){
    console.log('data = ' + JSON.stringify(done,null, 1))
})
```

More info/beta stuff in the examples and tests folders

## About
gitScrub was created with the intention of keeping personal websites up to date without having to manually enter new projects into them every time. The idea is that this npm module might run nightly, weekly, or monthly to produce a json object which will get included on the front-end of a website. Using a framework such as angular, the object can quickly be iterated through to produce a formatted list of all your projects to date.

## Dates
July 2015 - Present
  
## Links
http://www.github.com/vishalkuo.gitScrub

https://www.npmjs.com/package/gitscrub

## Technologies
* nodeJS
* Github API
* RSVPromise
* Restler

## Notes
gitscrub can be heavy to run (as much as two seconds to grab 15 repos due to the inability to batch requests) so it is reccomended this be run in a development enviroment then have the output deployed to production as a static json file. I use a gulpfile, alternatives are cronjobs or bash scripts. Go crazy.

## Contributors
* [Jerry Wang](https://github.com/yisenjerrywang)
* [Chris Grandoit](https://twitter.com/cgrandoit) (for inspiration)
* Vishal Kuo

## Milestones
* 921 Downloads: Sep 9, 2015
