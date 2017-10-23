var express = require('express');
var exphbs  = require('express-handlebars');

var app = express();
var port = 5050;
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.listen(port);
console.log("Listening on port: " + port);
