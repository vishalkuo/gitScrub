/**
 * Created by vishalkuo on 15-08-17.
 */
var rest = require('restler')
var restadapter = module.exports

restadapter.get = function(url, authentication, callback){
    rest.get(url,{
        username: authentication.username,
        password: authentication.password
    }).on('complete', function(response){
        callback(response)
    })

}
