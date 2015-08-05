/* istanbul ignore next */
var gitscrub = require('../lib/gitscrub')
var secret = require('../lib/secret')
var RSVP = require('rsvp')
var path = require('path')
value = undefined
objArr = []
    //Temp filter object
var filter = []

// desiredRepos = ["gitscrub", "FuturesRevealed", "summon", "pasteDump",
//     "arduinoBrakelightBackpack", "Grumble", "dinnerBell"
// ]

/* istanbul ignore next */


gitscrub.scrubADubDub(secret.username, secret.password, {'filter': {'enabled': true,'repos': ['gitScrub']}}, function(err, result) {
    console.log(result)
})

