/* istanbul ignore next */
var gitscrub = require('../lib/gitscrub')
var secret = require('../lib/secret')
value = undefined
objArr = []
    //Temp filter object
var filter = []

// desiredRepos = ["gitscrub", "FuturesRevealed", "summon", "pasteDump",
//     "arduinoBrakelightBackpack", "Grumble", "dinnerBell"
// ]

/* istanbul ignore next */


gitscrub.scrubADubDub(secret.username, secret.password, null, function(result, err) {
    console.log(result)
})

