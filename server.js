var sitePath = process.argv[2] || ".";
var port = 4242;

var express = require('express');
var app = express();

app.use(function(req, res, next) {
  console.log(req.url);
  next();
});

app.use(express.static(__dirname + '/' + sitePath));
app.listen(port, function() {
  console.log('server running at ' + port);
});
