var gitscrub = require('./lib/gitscrub')
var secret = require('./lib/secret')
var RSVP = require('rsvp')
value = undefined
objArr = []


gitscrub.scrubADubDub(secret.username,   secret.password, null, function(data){
    // for (i = 0; i < data.length; i++){
    //     console.log(data[i].title )
    //     console.log(data[i].headers)
    // }
    console.log(data)

})

// promise = new RSVP.Promise(function(resolve, reject) {
//     gitscrub.authenticate(secret.username, secret.password, function(result) {
//         value = result;
//         if (value) {
//             resolve(value)
//         } else {
//             reject(Error("It Broke"))
//         }
//     })
// })

// promise.then(function(result) {
//      nestedPromise = new RSVP.Promise(function(resolve, reject) {
//         gitscrub.getAllRepos(function(repoData) {
//                 for (var result in repoData) {
//                     objArr.push(repoData[result].name)
//                 }
//                 resolve(objArr)
//             })
//             // gitscrub.grabAllReadmes(function(data) {
//             //     console.log(data)
//             // })
//             // gitscrub.grabReadMeAtRepo(objArr[6], function(result){
//             //     
//             // })

//     })
//     nestedPromise.then(function(data0) {
//         gitscrub.grabReadMeAtRepo(data0[13], function(result) {
//             console.log(data0[13])
//             var b64string = result.content
//             var buf = new Buffer(b64string, 'base64') 
//             gitscrub.parseReadMe(buf.toString('utf-8'), null, function(data) {
//                 console.log(data)
//             })
//         })
        
//     })
// })
