var gitscrub = require('./lib/gitscrub');
var secret = require('./lib/secret');

value = undefined;
gitscrub.authenticate(secret.username, secret.password, function(resultData){
    value = resultData;
    //console.log(value);
    gitscrub.getAllRepos(function(repoData){
//        console.log(JSON.stringify(resultData[0]['id']))
        for (var result in repoData){
            console.log(repoData[result]['id'])
        }
    })
});

