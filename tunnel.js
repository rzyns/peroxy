var http = require('http');
var net = require('net');
var url = require('url');
var fs = require('fs');

var ssl_opts = {
  key: fs.readFileSync(__dirname + '/privkey.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem'),
  ca: fs.readFileSync(__dirname + '/chain.pem')
};

// Create an HTTP tunneling proxy
var proxy = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('okay');
});

proxy.on('connect', function(req, cltSocket, head) {
  // connect to an origin server
  var srvUrl = url.parse('http://' + 'localhost:1337');
  var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, function() {

    console.log('Forwarding %s to %s', req.url, url.format(srvUrl));

    cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                    'Proxy-agent: Node-Proxy\r\n' +
                    '\r\n');
    srvSocket.write(head);
    srvSocket.pipe(cltSocket);
    cltSocket.pipe(srvSocket);
  });
});

// now that proxy is running
proxy.listen(1337);
