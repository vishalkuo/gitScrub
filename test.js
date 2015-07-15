var gitscrub = require('./lib/gitscrub');
var secret = require('./lib/secret');
var RSVP = require('rsvp');
value = undefined;



var promise = new RSVP.Promise(function(resolve, reject){
    gitscrub.authenticate(secret.username, secret.password, function(resultData){
    value = resultData;
    if (value != null){
        console.log("here")
        resolve(value)
    }else{
        reject(Error("It Broke"))
    }
    });
})

promise.then(function(result){
    gitscrub.getAllRepos(function(repoData){
        for (var result in repoData){
            console.log(repoData[result]['id'])
        }
    })
})
