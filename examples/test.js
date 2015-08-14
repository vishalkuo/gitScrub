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

var options = gitscrub.getOptions()
gitscrub.setOptions({'filter': {
    'enabled': true,
    'repos': [
        'gitScrub'
    ]
}
})

gitscrub.scrubADubDub(secret.username, secret.password, null, function(result, err) {
    console.log(result)
})

rest.get().on('complete', function(data){
    console.log(data)
})
