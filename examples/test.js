/* istanbul ignore next */
var gitscrub = require('../lib/gitscrub')
var secret = require('../lib/secret')
var rest = require('restler')
value = undefined
objArr = []
    //Temp filter object
var filter = []
gitscrub.scrubADubDub(secret.username, secret.password, null, function(done, err){
    console.log(done)
    console.log(err)
})