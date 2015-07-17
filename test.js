var gitscrub = require('./lib/gitscrub');
var secret = require('./lib/secret');
var RSVP = require('rsvp');
value = undefined;



var promise = new RSVP.Promise(function(resolve, reject) {
    gitscrub.authenticate(secret.username, secret.password, function(resultData) {
        value = resultData;
        if (value != null) {
            resolve(value)
        } else {
            reject(Error("It Broke"))
        }
    });
})

promise.then(function(result) {
    gitscrub.getAllRepos(function(repoData) {
        objArr = new Array();
        for (var result in repoData) {
            objArr.push(repoData[result]['name'])
        }
        /*for (var i in objArr){
            gitscrub.grabReadMes(objArr[i], function(result){
                var b64 string = result[0]['content']

            })   
        }*/
        gitscrub.grabReadMeAtRepo(objArr[0], function(result){
            var b64string = result['content']
            var buf = new Buffer(b64string, 'base64')
            //console.log(buf.toString('utf-8'))
            gitscrub.grabAllReadmes(function(res){
                // for (obj in res){
                //     console.log(obj)
                // }
                console.log(res)
            })
        })
    });
})

