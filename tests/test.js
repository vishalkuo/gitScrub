var gs = require('../lib/gitscrub')
var fs = require('fs')
var path = require('path')
var assert = require('assert')
var sort = require('../lib/sort.json')
var rester = require('../lib/restadapter')
var nock = require('nock')
const ALL_EXPECTED_REPOS = require('./sample_all_repos.json')
const ALL_READMES = require('./all_readmes.json')
const EXPECTED_SCRUB = require('./scrubadubdub.json')
const EXPECTED_LICENSE = require('./licenses.json')
const GITHUB_API_TEST_URL = 'https://api.github.com'

var secret = undefined
try {
    secret = require('../lib/secret')
} catch (e) {
    console.log("SECRET WAS NOT FOUND, USING ENV VARIABLES INSTEAD")
}

var name = (typeof secret === 'undefined') ? process.env.name : secret.username
var pwd = (typeof secret === 'undefined') ? process.env.password : secret.password

describe('gitscrub', function() {
    before(function(){
        nock(GITHUB_API_TEST_URL)
            .get('/users/')
            .reply(404, {
                message: 'Not Found',
                documentation_url: 'https://developer.github.com/v3'
            })
            .get('/users/' + name)
            .reply(200, {
                login: 'Gucci'
            })
        gs.reset()
    })
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
            before(function(){
                nock(GITHUB_API_TEST_URL)
                    .get('/users/')
                    .reply(404, {
                        message: 'Not Found',
                        documentation_url: 'https://developer.github.com/v3'
                    })
                    .get('/users/' + name + '/repos')
                    .times(2)
                    .reply(200, ALL_EXPECTED_REPOS)
            })
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
             this.timeout(30000)
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
            after(function(){
                gs.reset()
            })
        })
        //Does gitscrub reset
    describe('#reset', function() {
            before(function(){
                nock(GITHUB_API_TEST_URL)
                    .get('/users/' + name)
                    .reply(200, {
                        login: 'Gucci'
                    })
            })
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
        this.timeout(15000)
        beforeEach(function() {
            gs.reset()
        })
        it('should return all formatted readmes', function(done) {
            nock(GITHUB_API_TEST_URL)
                .get('/users/' + name)
                .reply(200, {
                    login:'Gucci'
                })
                .get('/users/' + name + '/repos')
                .reply(200, ALL_EXPECTED_REPOS)
                .filteringPath(function(path){
                    if (path.indexOf('readme') > -1) {
                        return '/test'
                    }
                    return path
                })
                .get('/test').times(ALL_EXPECTED_REPOS.length)
                .reply(200, ALL_READMES[0])

            gs.scrubADubDub(name, null, null, function(result, err) {
                assert.equal(typeof result, 'object')
                for (var i = 0; i < result.length; i++) {
                    assert.equal(typeof result[i].headers, 'object')
                }
                done()
            })
        })
        it('should return an error object when something goes wrong', function(done) {
            nock(GITHUB_API_TEST_URL)
                .get('/users/' + name)
                .reply(404, {
                    message: 'Not Found',
                    documentation_url: 'https://developer.github.com/v3'
                })
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
            nock(GITHUB_API_TEST_URL)
                .get('/users/' + name)
                .reply(200, {
                    login:'Gucci'
                })
                .get('/users/' + name + '/repos')
                .reply(200, ALL_EXPECTED_REPOS)
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
            nock(GITHUB_API_TEST_URL)
                .filteringPath(function(path){
                    return '/test'
                })
                .get('/test')
                .reply(200, ALL_READMES[0])
            gs.grabReadMeAtRepo(repoList[1].name, function(result) {
                assert.equal(result.name, 'README.md')
                assert.equal(result.path, 'README.md')
                done()
            })
        })

        it('should return an empty string with no readme available', function(done) {
            nock(GITHUB_API_TEST_URL)
                .filteringPath(function(path){
                    return '/test'
                })
                .get('/test')
                .reply(404, {
                    message: 'Not Found',
                    documentation_url: 'https://developer.github.com/v3'
                })
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
            nock(GITHUB_API_TEST_URL)
                .get('/users/' + name)
                .reply(200, {
                    login: 'Gucci'
                })
            gs.selectRepos('test', null, function(err, result) {
                assert.equal('Argument must be an array of repos to scrub', err)
                assert.equal(result, null)
                done()
            })
        })
        it('should write to a file when passed a name', function(done) {
            nock(GITHUB_API_TEST_URL)
                .get('/users/' + name)
                .reply(200, {
                    login: 'Gucci'
                })
                .get('/users/' + name + '/repos')
                .reply(200, ALL_EXPECTED_REPOS)
            gs.selectRepos(['gitScrub'], null, function(err, result) {
                assert.equal(result, true)
                fs.readFile(path.join(__dirname, '../lib', gs.standardFileName), 'utf-8', function(err, data) {
                    assert.notEqual(err, true)
                    var reposToScrub = JSON.parse(data)
                    assert.equal(reposToScrub.repos[0], 'gitScrub')
                    done()
                })

            })
        })

        it ('should work with scrubadubdub', function(done){
            nock(GITHUB_API_TEST_URL)
                .get('/users/' + name)
                .times(2)
                .reply(200, {
                    login: 'Gucci'
                })
                .get('/users/' + name + '/repos')
                .reply(200, ALL_EXPECTED_REPOS)
                .filteringPath(function(path){
                    if (path.indexOf('readme') > -1) {
                        return '/test'
                    }
                    return path
                })
                .get('/test').times(ALL_EXPECTED_REPOS.length - 1)
                .reply(200, ALL_READMES[0])
                .get('/test')
                .reply(200, ALL_READMES[1])
            this.timeout(15000)
            gs.authenticate(name, pwd, function(){
                gs.selectRepos(['gitScrub'], 'repos_to_scrub.json', function(meh, mehmeh){
                    gs.scrubADubDub(name, pwd, ['select'], function(result, err){
                        assert.equal(result[0]['title'], 'gitScrub')
                        assert.equal(undefined, err)
                        done()
                    })
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
            gs.reset()
        })
        it('should return an empty object on resetting options', function(){
             var options = gs.getOptions()
             assert.equal(false, Object.keys(options).length)

        })

        it('should allow for setting of options', function(){
            optObject = {name:'test', option: 'testOption'}
            gs.setOptions(optObject)
            var options = gs.getOptions()
            assert.deepEqual(options, optObject)


        })

        it('should allow for resetting of options', function(){
            gs.resetOptions()
            var options = gs.getOptions()
            assert.deepEqual({}, options)


        })
        //THROWING THIS ONE IN THERE
        it('this is checking is undefined', function(){
            assert.equal(true, gs.isUndefined(undefined))
            assert.equal(false, gs.isUndefined('hello'))
        })
    })

    describe('#config-secret', function(){
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
        it('should be able to clear a secret', function(done){
            gs.configSecret({clear: true}, function(complete, err){
                assert.equal('', getFile().toString())
                done()
            })
        })
        it('should be able to set a secret', function(done){
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
    describe('#sort', function(){
        var initialSettings
        before(function(){
            //Deep copy
            initialSettings = JSON.parse(JSON.stringify(sort))
        })
        
        var unsortedArray = [{title: 'Cars'}, {title: 'Apples'}, {title: 'Bananas'}]
        var sortedArray = [{title: 'Apples'}, {title: 'Bananas'}, {title: 'Cars'}]
        var reverseSorted = [{title: 'Cars'}, {title: 'Bananas'}, {title: 'Apples'}]
        function updateSort(sortObject){
            fs.writeFileSync(path.join(__dirname,'../lib', 'sort.json'),
                JSON.stringify(sortObject, null, 2))
        }
        
        it ('shouldn\'t sort when not required to ', function(done){
            sort.enabled = false
            updateSort(sort)
            gs.sort(unsortedArray, function(err, result){
                assert.equal(err, false)
                assert.equal(result, unsortedArray)
                done()
            })
        })

        it('should sort when the wizards require it to', function(done){
            sort.enabled = true
            sort.alphabetical = true
            sort.reverse = false
            updateSort(sort)
            gs.sort(unsortedArray, function(err, result){
                assert.equal(err, false)
                assert.deepEqual(result, sortedArray)
                done()
            })
        })

        it('should reverse when we want it to reverse', function(done){
            sort.enabled = true
            sort.alphabetical = true
            sort.reverse = true
            updateSort(sort)
            gs.sort(unsortedArray, function(err, result){
                assert.equal(err,false)
                assert.deepEqual(result, reverseSorted)
                done()
            })
        })

        it('should allow for setting options', function(done){
            gs.setSortOptions({"testing": true})
            testObj = JSON.parse(fs.readFileSync(path.join(__dirname,'../lib', 'sort.json')))
            assert.equal(testObj.testing, true)
            done()
        })

        it('should allow for custom sorting', function(done){
            gs.setSortOptions({"custom": ['Cars', 'Apples', 'Bananas']})
            gs.customSort([{title: 'Bananas'}, {title: 'Apples'}, {title: 'Cars'}], function(ret){
                assert.deepEqual(ret, [ { title: 'Cars' }, { title: 'Apples' }, { title: 'Bananas' } ])
                done()
            })
        })

        after(function(){
            sort = initialSettings
            updateSort(sort)
        })
    })

    describe('#grabOtherFile', function(){
        it('should be able to grab other files', function(done){
            nock(GITHUB_API_TEST_URL)
                .get('/users/' + name)
                .reply(200, {
                    login:'Gucci'
                })
                .get('/users/' + name + '/repos')
                .reply(200, ALL_EXPECTED_REPOS)
                .filteringPath(function(path){
                    if (path.indexOf('readme') > -1) {
                        return '/test'
                    } else if (path.indexOf('license') > -1){
                        return '/lic'
                    }
                    return path
                })
                .get('/test').times(ALL_EXPECTED_REPOS.length)
                .reply(200, ALL_READMES[0])
                .get('/lic').times(ALL_EXPECTED_REPOS.length)
                .reply(200, EXPECTED_LICENSE)

            gs.scrubADubDub(name, null, null, function(g, err){
                gs.setOptions({customFile: 'license'})
                gs.grabAllReadmes(function(res){
                    for (obj in res){
                        assert.equal(res[obj].split('\n')[0],'The MIT License (MIT)')
                    }


                    done()
                })
            })
        })
    })

    after(function(){
        gs.reset()
    })
})

