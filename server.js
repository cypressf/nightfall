var express = require('express');
var app = express();

app.set('title', 'Nightfall');

app.get('/', function(req, res){
    res.send('hi');
});

app.listen(5000);