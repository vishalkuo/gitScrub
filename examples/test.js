/* istanbul ignore next */
var gitscrub = require('../lib/gitscrub')
var secret = require('../lib/secret')
var rest = require('restler')
value = undefined
objArr = []
    //Temp filter object
var filter = []

gitscrub.setOptions({customFile: 'license'})

gitscrub.scrubADubDub(secret.username, secret.password, null, function(done, err){
    gitscrub.grabAllReadmes(function(done){
        console.log(JSON.stringify(done, null, 1))
    })
})