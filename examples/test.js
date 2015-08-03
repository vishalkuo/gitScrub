/* istanbul ignore next */
var gitscrub = require('../lib/gitscrub')
var secret = require('../lib/secret')
var RSVP = require('rsvp')
var path = require('path')
value = undefined
objArr = []
//Temp filter object
var filter = []

desiredRepos = ["gitscrub", "FuturesRevealed", "summon", "pasteDump", 
"arduinoBrakelightBackpack", "Grumble", "dinnerBell"]

/* istanbul ignore next */
gitscrub.scrubADubDub(secret.username,secret.password, null, function(data, err){
    gitscrub.sort(data,function(err, done){
        data.filter(function(obj){
            return (desiredRepos.indexOf(obj.title))
        })
        for (i = 0; i < data.length; i++){
            if (data[i].title === ''){
                data.splice(i, 1)
            }
        }
        console.log(JSON.stringify(done, null, 2))
    })
})
