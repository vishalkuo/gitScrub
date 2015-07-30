var gs = require('../lib/gitscrub')
var fs = require('fs')
var path = require('path')
var assert = require('assert')
var secret = undefined
try {
    secret = require('../lib/secret')
} catch (e) {
    console.log("SECRET WAS NOT FOUND, USING ENV VARIABLES INSTEAD")
}

var name = (typeof secret === 'undefined') ? process.env.name : secret.username
var pwd = (typeof secret === 'undefined') ? process.env.password : secret.password

describe('gitscrub', function() {
    //AUTH
    describe('#authenticate', function() {
        it('should return false when authenticated with bad credentials', function(done) {
            gs.authenticate('', null, function(result) {
                assert.equal(false, result)
                done()
            })
        })
        it('should return true when authenticated with good credentials', function(done) {
            gs.authenticate(name, pwd, function(result) {
                assert.equal(true, result)
                done()
            })
        })
    })

    //GET ALL
    describe('#getAllRepos', function() {
            beforeEach(function() {
                gs.reset()
            })
            it('should return false when poorly authenticated (this shouldn\'t happen)', function(done) {
                gs.getAllRepos({
                    username: '',
                    password: ''
                }, function(data) {
                    assert.equal(false, data)
                    done()
                })
            })
            it('should return an array when properly authenticated and repos have been grabbed', function(done) {
                gs.getAllRepos({
                    username: name,
                    password: pwd
                }, function(result) {
                    assert.equal(typeof result, 'object')
                    done()
                })
            })
            it('should provide an id and an owner for each object in that array', function(done) {
                gs.getAllRepos({
                    username: name,
                    password: pwd
                }, function(result) {
                    assert.notEqual(typeof result[0].id, 'undefined')
                    done()
                })
            })
        })
        //GET SOME REPOS BASED ON FILE
    describe('#getSomeRepos', function() {
            beforeEach(function() {
                gs.reset()
            })
            it('should throw an error when no file/incorrect file is available', function(done) {
                gs.getSelRepos('', function(data, err) {
                    assert.notEqual(typeof err, 'undefined')
                    done()
                })
            })
            it('should return an empty array when a good file is available with no data', function(done) {
                gs.getSelRepos(gs.standardFileName, function(err, data) {
                    assert.equal(err, null)
                    assert.equal(typeof data, 'object')
                    assert.equal(data.length, 0)
                    done()
                })
            })
            it('should return an array with repos specified in a file with good data', function(done) {
                gs.authenticate(name, pwd, function(result) {
                    gs.getSelRepos('test_repos.json', function(err, data) {
                        assert.equal(data[0], 'FuturesRevealed')
                        assert.equal(data[1], 'gitScrub')
                        done()
                    })
                })
            })
        })
        //Does gitscrub reset
    describe('#reset', function() {
            beforeEach(function() {
                gs.reset()
            })
            it('should reset all data', function(done) {
                gs.authenticate(name, pwd, function(result) {
                    assert.equal(true, gs.isAuth)
                    gs.reset()
                    assert.equal(false, gs.isAuth)
                    done()
                })
            })
        })
        //Does it scrubadubdub
    describe('#scrubadubdub', function() {
        this.timeout(30000)
        beforeEach(function() {
            gs.reset()
        })
        it('should return all formatted readmes', function(done) {
            gs.scrubADubDub(name, pwd, null, function(result, err) {
                assert.equal(typeof result, 'object')
                for (var i = 0; i < result.length; i++) {
                    assert.equal(typeof result[i].headers, 'object')
                }
                done()
            })
        })
        it('should return an error object when something goes wrong', function(done) {
            gs.scrubADubDub('', null, null, function(result, err) {
                assert.equal(typeof result, 'undefined')
                assert.equal('Bad Credentials!', err)
                done()
            })
        })
    })

    describe('#grabReadMeAtRepo', function() {
        var repoList
        before(function(done) {
            gs.authenticate(name, pwd, function(result) {
                gs.getAllRepos({
                    username: name,
                    password: pwd
                }, function(result) {
                    repoList = result
                    done()
                })
            })
        })

        it('should be able to grab a certain repo\'s readme', function(done) {
            gs.grabReadMeAtRepo(repoList[0].name, function(result) {
                assert.equal(result.name, 'README.md')
                assert.equal(result.path, 'README.md')
                done()
            })
        })

        it('should return an empty string with no readme available', function(done) {
            var index = -1
            for (var i = 0; i < repoList.length; i++) {
                if (repoList[i].name === 'textBasedBattleShip') {
                    index = i
                    break
                }
            }
            gs.grabReadMeAtRepo(repoList[index].name, function(result) {
                assert.equal(result.message, 'Not Found')
                assert.equal(result.content, '')
                done()
            })

        })
    })

    describe('#selectRepos', function() {
        beforeEach(function(done) {
            gs.reset()
            gs.authenticate(name, pwd, function(result) {
                done()
            })
        })

        it('should return an error when no array is provided', function(done) {
            gs.selectRepos('test', null, function(err, result) {
                assert.equal('Argument must be an array of repos to scrub', err)
                assert.equal(result, null)
                done()
            })
        })
        it('should write to a file when passed a name', function(done) {
            gs.selectRepos(['AngelHack', 'summon'], null, function(err, result) {
                assert.equal(result, true)
                fs.readFile(path.join(__dirname, '../lib', gs.standardFileName), 'utf-8', function(err, data) {
                    assert.notEqual(err, true)
                    var reposToScrub = JSON.parse(data)
                    assert.equal(reposToScrub.repos[0], 'AngelHack')
                    assert.equal(reposToScrub.repos[1], 'summon')
                    done()
                })

            })
        })

        after(function(){
            gs.reset()
        })
    })

    describe('#clearSelRepos', function() {
        beforeEach(function(done) {
            gs.reset()
            gs.authenticate(name, pwd, function(result) {
                done()
            })
        })
        it('should clear the file', function(done) {
            gs.clearSelRepos(null, function(err, result) {
                assert.equal(result, true)
                fs.readFile(path.join(__dirname, '../lib', gs.standardFileName), 'utf-8', function(err, data) {
                    assert.notEqual(err, true)
                    var reposToScrub = JSON.parse(data)
                    assert.equal(reposToScrub.repos.length, 0)
                    done()
                })

            })
        })
        it('should return an error if given a path to a nonexistent file', function(done) {
            gs.clearSelRepos("nonexistentfile.txt", function(err, result) {
                assert.equal(result, null)
                assert.notEqual(err, null)
                done()
            })
        })
    })

    describe('#options', function(){
        beforeEach(function(){
            gs.resetOptions
        })
        it('should return an empty object on resetting options', function(done){
            gs.getOptions(function(options){
                assert.equal(false, Object.keys(options).length)
                done()
            })
        })

        it('should allow for setting of options', function(done){
            optObject = {name:'test', option: 'testOption'}
            gs.setOptions(optObject)
            gs.getOptions(function(options){
                assert.deepEqual(options, optObject)
                done()
            })
        })

        it('should allow for resetting of options', function(done){
            gs.resetOptions()
            gs.getOptions(function(options){
                assert.deepEqual({}, options)
                done()
            })
        })
        //THROWING THIS ONE IN THERE
        it('this is checking is undefined', function(){
            assert.equal(true, gs.isUndefined(undefined))
            assert.equal(false, gs.isUndefined('hello'))
        })
    })

    describe('#config-readme', function(){
        var initialSecret

        function getFile(){
            return fs.readFileSync(path.join(__dirname, '../lib/secret.js'))
        }

        before(function(){
            if (secret === undefined){
                fs.writeFileSync(path.join(__dirname, '../lib/secret.js'), '')
            }
            initialSecret = getFile().toString()
        })
        it('should be able to clear a readme', function(done){
            gs.configSecret({clear: true}, function(complete, err){
                assert.equal('', getFile().toString())
                done()
            })
        })
        it('should be able to set a readme', function(done){
            gs.configSecret({set: true, username: 'testname', password: 'test'}, function(complete, err){
                result = getFile().toString().split('\n')
                assert.equal(result[0], 'secret = module.exports')
                assert.equal(result[1], 'secret.username = \'testname\'')
                assert.equal(result[2], 'secret.password = \'test\'')
                done()
            })
        })
        after(function(){
            fs.writeFileSync(path.join(__dirname, '../lib/secret.js'), initialSecret)
        })
    })
})