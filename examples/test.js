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
//    console.log(JSON.stringify(data, null, 1))
//})
//gitscrub.selectRepos(['gitScrub'], null, function(err, result){
//    gitscrub.scrubADubDub(secret.username, secret.password, ['select'], function(result, err) {
//    })
//})
//
gitscrub.authenticate(secret.username, secret.password, function(done){
    gitscrub.getAllRepos({username: secret.username, password: secret.password}, function(val){
        console.log(JSON.stringify(val, null, 1))
        //var test = []
        //gitscrub.grabReadMeAtRepo('gitScrub', function(data){
        //    test.push(data)
        //    gitscrub.grabReadMeAtRepo('FuturesRevealed', function(data1){
        //        test.push(data1)
        //        gitscrub.grabReadMeAtRepo('arduinoBrakelightBackpack', function(data2){
        //            test.push(data2)
        //            console.log(JSON.stringify(test, null, 1))
        //        })
        //    })
        //})
    })
})

