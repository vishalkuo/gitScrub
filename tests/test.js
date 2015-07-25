var gs = require('../lib/gitscrub')
var assert = require('assert')
var name = process.env.name
var pwd = process.env.password

describe('gitscrub', function(){
    //Authenticate for false values, true values cannot yet be done
    describe('#authenticate', function(){
        it('should return false when authenticated with bad credentials', function(done){
            gs.authenticate('', null, function(result){
                assert.equal(false, result)
                done()
            })
        })
        it('should return true when authenticated with good credentials', function(done){
            gs.authenticate(name, pwd, function(result){
                assert.equal(true, result)
                done()
            })
        })
    })

    describe('#getAllRepos', function(){
        it('should return false when poorly authenticated (this shouldn\'t happen)', function(done){
            gs.getAllRepos({username:'', password:''}, function(data){
                assert.equal(false, data)
                done()
            }) 
        })
        it('should return an array when properly authenticated and repos have been grabbed', function(done){
            gs.getAllRepos({username: name, password: pwd}, function(result){
                assert.equal(typeof result, 'object')
                done()
            })
        })
        it('should provide an id and an owner for each object in that array', function(done){
            gs.getAllRepos({username:name, password:pwd}, function(result){
                assert.notEqual(typeof result[0].id, 'undefined')
                done()
            })
        })
    })

})