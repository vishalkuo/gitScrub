#!/usr/bin/env node
var program = require('commander')
var pjson = require('../package.json')
var gitscrub = require('../lib/gitscrub')
var prompt = require('prompt')

var secret
try {
    secret = require('../lib/secret')
} catch (e) {
}

program
    .version(pjson.version)
    .option('-c, --clear', 'Clear the secret file')
    .option('-s, --set <username>', 'Set a secret file with this username. If there is one in place it will be replaced')
    .option('-l, --list', 'list the username of the current secret file (if there is one)')

program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ config-secret -c');
    console.log('    $ config-secret -s vishalkuo');
    console.log('    $ config-secret -a repo1,repo2,repo3');
    console.log('');
});

program.parse(process.argv)

if (program.clear){
    gitscrub.configSecret({clear: true}, function(done, err){
        if(err){
            throw err
            process.exit(1)
        }
        console.log('Ok, secret.js has been cleared')
        process.exit(0)
    })
}
if (program.set){
    gitscrub.configSecret({set: true, secretExists: (typeof secret === 'undefined')}, 
        function(done, err){
        
    })
}
if (program.list){
    if (typeof secret === 'undefined'){
        console.log("No secret file has been set yet. Use config-secret -s to set a file")
    }else{
        console.log("The current username in secret.js is: " + secret.username)
    }
}
