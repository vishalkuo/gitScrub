#!/usr/bin/env node

var program = require('commander')

var gitscrub = require('../lib/gitscrub')
var secret = require('../lib/secret')

function list(val) {
    return val.split(',');
}

program
    .version('1.1.0')
    .option('-c, --clear', 'Clear the list of packages to scrub')
    .option('-f, --file <filename>', 'Optional file name to use in place of the default repos_to_scrub.json')
    .option('-a, --add <repos>', 'Specify comma separated list of repos to be scrubbed', list)

program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ select-repo -c');
    console.log('    $ select-repo -f myFile.json -a myRepo');
    console.log('    $ select-repo -a repo1,repo2,repo3');
    console.log('');
});

program.parse(process.argv)

gitscrub.authenticate(secret.username, secret.password, function(isAuth) {
    if(!isAuth) {
        console.error('Authentication failed!');
        process.exit(1);
    }
    var fileName = program.file || gitscrub.standardFileName;
    if(program.clear) {
        gitscrub.clearSelRepos(fileName, function(err, data) {
            if(err) {
                throw err;
                process.exit(1);
            }
            console.log('Successfully cleared list of repos to scrub.');
            process.exit(0);
        })
    }
    if(program.add) {
        gitscrub.selectRepos(program.add, fileName, function(err, data) {
            if(err) {
                console.error(err);
                process.exit(1);
            }
            console.log('Successfully added repos.');
            process.exit(0);
        })
    }

})
