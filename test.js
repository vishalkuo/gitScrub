var gitscrub = require('./lib/gitscrub');
var secret = require('./lib/secret');
var RSVP = require('rsvp');
value = undefined;



var promise = new RSVP.Promise(function(resolve, reject) {
    gitscrub.authenticate(secret.username, secret.password, function(resultData) {
        value = resultData;
        if (value != undefined) {
            resolve(value)
        } else {
            reject(Error("It Broke"))
        }
    })
})

promise.then(function(result) {
    gitscrub.getAllRepos(function(repoData) {
        objArr = new Array();
        for (var result in repoData) {
            objArr.push(repoData[result]['name'])
        }
        // gitscrub.grabAllReadmes(null, null, function(res) {
        //     gitscrub.parseAllReadMes(objArr, null, function(data) {
        //         console.log(data)
        //     })
        //})

        gitscrub.grabReadMeAtRepo(objArr[8], function(result){
            var b64string = result['content']
            var buf = new Buffer(b64string, 'base64')
            gitscrub.parseReadMe(buf.toString('utf-8'), null, function(data){
                console.log(data)
            })
        })

    })
})