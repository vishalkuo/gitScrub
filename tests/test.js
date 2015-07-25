var gs = require('../lib/gitscrub')
var secret = require('../lib/secret')
var assert = require('assert')


describe('gitscrub', function(){
    //Authenticate for false values, true values cannot yet be done
    describe('#authenticate', function(){
        it('should return false when authenticated with bad credentials', function(){
            gs.authenticate(null, null, function(result){
                assert.equal(true, result)
                done()
            })
        })
        it('should return true when authenticated with good credentials', function(){
            gs.authenticate(secret.username, secret.password, function(result){
                assert.equal(true, result)
            })
        })
    })

    describe('#getAllRepos', function(){
        it('should return false when poorly authenticated (this shouldn\'t happen)', function(){
            gs.getAllRepos({name:'lol'}, function(data){
                assert.equal(false, data)
            }) 
        })
        it('should return an array when properly authenticated and repos have been grabbed', function(){
            gs.getAllRepos(secret.username, secret.password, function(result){
                assert(typeof result === "Array")
            })
        })
        it('should provide an id and an owner for each object in that array', function(){
            gs.getAllRepos(secret.username, secret.password, function(result){
                assert.equal(false, true)
            })
        })
    })

})
