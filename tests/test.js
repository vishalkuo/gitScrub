var gs = require('../lib/gitscrub')
var assert = require('assert')
var secret = undefined
try{
    secret = require('../lib/secret')    
}catch(e){
    console.log("SECRET WAS NOT FOUND, USING ENV VARIABLES INSTEAE")
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
        //GET SOME
    describe('*getSomeRepos', function() {
        it('should throw an error when no file/incorrect file is available', function(done) {
            gs.getSelRepos('', function(data, err){
                assert.notEqual(typeof err, 'undefined')
                done()
            })
        })
        it('should return an empty array when a good file is available', function(done){
            gs.getSelRepos(gs.standardFileName, function(data, err){
                assert.equal(typeof err, 'undefined')
                assert.equal(typeof data, 'object')
                assert.equal(data.length, 0)
                done()
            })
        })
    })

})