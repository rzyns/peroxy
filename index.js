// require('ssl-root-cas')
//   .inject()
//   .addFile(__dirname + '/fullchain.pem')
//   .addFile(__dirname + '/chain.pem')
//   .addFile(__dirname + '/cert.pem')
// ;

var https = require('https');
var http = require('http');
var fs = require('fs');

https.createServer({
    key: fs.readFileSync(__dirname + '/privkey.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem'),
    ca: fs.readFileSync(__dirname + '/chain.pem')
}, function (req, res) {
  console.log('hi');
  res.write('foo');
  res.end();
}).listen(8009);

http.createServer(function (req, res) {
  res.write('foo');
  res.end();
}); //.listen(8009);

