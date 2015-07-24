# gitScrub

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

## About
This is a formatted readme, it will look for ```##``` headers and parse them into objects to be added to a json array. In this case, this section should be added to about. Now I'm just rambling on to fill the about section.

## Dates
July 2015 - Present
  
## Links
http://www.github.com/vishalkuo.gitScrub

## Technologies
* nodeJS
* Gitup API
* RSVPromise
* Restler

## Notes
Hopefully gitScrub will be smart enough to create an array of objects if bullet points are present, else it'll present everything as a single string object. Obviously very much so a WIP so fork and PR away! At this point I'm just adding sections to fill the readme so I have something to test so don't mind me!

