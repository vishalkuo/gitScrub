var gitscrub = require('./lib/gitscrub')
var secret = require('./lib/secret')
var RSVP = require('rsvp')
value = undefined
objArr = []



// promise = new RSVP.Promise(function(resolve, reject) {
//     gitscrub.authenticate(secret.username, secret.password, function(resultData) {
//         value = resultData;
//         if (value !== undefined) {
//             console.log(resultData)
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
//         // gitscrub.grabReadMeAtRepo(data[8], function(result) {
//         //     var b64string = result.content
//         //     var buf = new Buffer(b64string, 'base64')
//         //     gitscrub.parseReadMe(buf.toString('utf-8'), null, function(data) {
//         //         console.log(data)
//         //     })
//         // })
//         gitscrub.grabAllReadmes(function(data1){
//             gitscrub.parseAllReadMes(null, function(data2){
//                 console.log(data2)
//             })
//         })
//     })
// })
// 

gitscrub.scrubADubDub(secret.username,   secret.password, null, function(data){
    
})