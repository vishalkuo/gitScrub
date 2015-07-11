var rest = require('restler');
var prompt = require('prompt');

prompt.start();

var properties = [
    {
      name: 'username', 
      validator: /^[a-zA-Z\s\-]+$/,
      warning: 'Username must be only letters, spaces, or dashes'
    },
    {
      name: 'password',
      hidden: true
    }
];


prompt.get(properties, function(err, result){
    rest.get('https://api.github.com',{
    username: result.username,
    password: result.password
    }).on('complete', function(data){
        console.log(data);
    })    
})

