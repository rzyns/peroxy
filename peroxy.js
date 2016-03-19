var http = require('http');
var https = require('https');
var net = require('net');
var tls = require('tls');
var fs = require('fs');
var path = require('path');

var server = net.createServer();

var sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
  ca: fs.readFileSync(path.join(__dirname, 'chain.pem'))
};

var httpsServer = https.createServer(sslOptions, function (req, res) {
  console.log(arguments);
  res.write('hi');
  res.end();
});

httpsServer.listen(path.join(__dirname, 'tmp.sock'));


