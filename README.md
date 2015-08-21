# gitScrub

## Status
[![Build Status](https://travis-ci.org/vishalkuo/gitScrub.svg?branch=master)](https://travis-ci.org/vishalkuo/gitScrub)
[![Coverage Status](https://coveralls.io/repos/vishalkuo/gitScrub/badge.svg?branch=master&service=github)](https://coveralls.io/github/vishalkuo/gitScrub?branch=master)
[![Dependencies](https://david-dm.org/vishalkuo/gitscrub.svg)](https://david-dm.org/vishalkuo/gitscrub.svg)

[![NPM](https://nodei.co/npm/gitscrub.png?compact=true)](https://nodei.co/npm/gitscrub/)

[![forthebadge](http://forthebadge.com/images/badges/gluten-free.svg)](http://forthebadge.com)

## Installation
* In your npm project directory: ```npm install --save gitscrub```
* In your project: ```var gs = require('gitscrub')```
* To save username and passcode, first add a filename to your .gitignore. I called mine secret.js. Open this up in project root by typing ```nano .gitignore```

### .gitignore ###
```gitignore
#Other file names
secret.js
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
var options = null
//Options object is a WIP, feel free to pass in null at the moment.
gitscrub.scrubadubdub(secret.username, secret.password, options, function(data){
  for (i = 0; i < data.length; i++){
    console.log(data[i].title )
    console.log(data[i].headers)
  }
})
```

## GitScrub Format
* Always start headers with ```## ``` (space included)
* Title will always start with ```# ```
* Jot notes will be parsed into their own array inside of each header object. Be prepared for that
* Headers ```###``` or longer will simply be included in the most recent header object.
* Code blocks are not formatted yet. This is a feature that welcomes a PR. 
* Output format is structured as follows: 
```
[{title: 'repo title',
  headers:[
      {
        header: 'header title',
        text: 'header text',
        jotNotes: [jotNote1, jotNote2, ...],
      }
      //Rest of your headers...
    ]
  }
//Rest of your repos...
]
```

## About
gitScrub was created with the intention of keeping personal websites up to date without having to manually enter new projects into them every time. The idea is that this npm module might run nightly, weekly, or monthly to produce a json object which will get included on the front-end of a website. Using a framework such as angular, the object can quickly be iterated through to produce a formatted list of all your projects to date.

## Dates
July 2015 - Present
  
## Links
http://www.github.com/vishalkuo.gitScrub

## Technologies
* nodeJS
* Github API
* RSVPromise
* Restler

## Notes
It is reccomended that gitScrub be run as a cronjob (nightly or weekly) and its outputs be saved into a file instead of loading it each time that a resource requires it. The parsing takes as long as 2 seconds (on a 2013 15-inch Macbook Pro), for only 15 repos of which many have null or one-liner readmes. 

## Contributors
* [Jerry Wang](https://github.com/yisenjerrywang)
* [Chris Grandoit](https://twitter.com/cgrandoit) (for inspiration)
* Vishal Kuo
