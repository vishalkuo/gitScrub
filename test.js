var gitscrub = require('./lib/gitscrub')
var secret = require('./lib/secret')
var RSVP = require('rsvp')
value = undefined
objArr = []


// gitscrub.scrubADubDub(secret.username,   secret.password, null, function(data){
//     for (i = 0; i < data.length; i++){
//         console.log(data[i].title )
//         console.log(data[i].headers)
//     }
//})

gitscrub.authenticate(secret.username, secret.password, function(data){
    gitscrub.getSelRepos(gitscrub.standardFileName, function(data, err){
        console.log(data)
    })
})

