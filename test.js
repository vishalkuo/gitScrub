/* istanbul ignore next */
var gitscrub = require('./lib/gitscrub')
var secret = require('./lib/secret')
var RSVP = require('rsvp')
value = undefined
objArr = []

/* istanbul ignore next */
gitscrub.scrubADubDub(secret.username,secret.password, null, function(data, err){
    gitscrub.sort(data,function(err, done){
        console.log(done)
    })
})
// gitscrub.authenticate(secret.username, secret.password, function(data){
//     gitscrub.clearSelRepos(gitscrub.standardFileName, function(err, data) {
//         console.log(data);
//     })
// })
// gitscrub.authenticate(secret.username, secret.password, function(data){
//     gitscrub.getSelRepos(gitscrub.standardFileName, function(data, err){
//         console.log(data)
//     })
// })
