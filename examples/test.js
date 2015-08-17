/* istanbul ignore next */
var gitscrub = require('../lib/gitscrub')
var secret = require('../lib/secret')
var rest = require('restler')
value = undefined
objArr = []
    //Temp filter object
var filter = []

// desiredRepos = ["gitscrub", "FuturesRevealed", "summon", "pasteDump",
//     "arduinoBrakelightBackpack", "Grumble", "dinnerBell"
// ]

/* istanbul ignore next */
//gitscrub.scrubADubDub(secret.username, secret.password, null, function(data, err){
//    console.log(data)
//})

gitscrub.reset()