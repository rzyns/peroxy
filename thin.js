var fs = require('fs');
var https = require('https');
var path = require('path');
var child_process = require('child_process');

var Thin = require('thin');

var proxy = new Thin();

var router = require('./modules/router.js')();

// `req` and `res` params are `http.ClientRequest` and `http.ServerResponse` accordingly
// be sure to check http://nodejs.org/api/http.html for more details
proxy.use(function(req, res, next) {
  console.log('Proxying:', req.url);
  console.log(' - Method: %s', req.method);
  return next();
});

proxy.use(function (req, res, next) {
  if (typeof req.host !== 'undefined') {
    req.originalHost = req.host;
  }

  if (req.headers) {
    // req.host should be undefined if req.headers.host is undefined
    req.host = req.headers.host;
  }

  next();
});

router.add(function (req) {
  console.log(req.headers.host);
  return false;
}, function () {});

router.add(function (req) {
  return req.url === '/foo' && req.method === 'GET';
}, function (req, res, next) {
  res.end('I ate your face!');
});

router.add(function (req) {
  return req.url === '/bar' && req.method === 'POST';
}, function (req, res, next) {
  res.end('I ate your mom\'s face!');
});

proxy.use(router);

// you can add different layers of "middleware" similar to "connect",
// but with few exclusions
proxy.use(function(req, res, next) {
  // if (req.url === '/foobar')
  // var str = fs.readFileSync('/Users/janusz/git/cater/tests/files/PullShipmentsTest-SHIR100.xml');
  var str = 'hi there, friend!';
  matcher(req);
  res.end(str);
  // return next();
});

proxy.listen(8081, 'localhost', function(err) {
  if (err) {
    console.error('this is broken for some reason: ', err);
  } else {
    console.log('Proxy listening on port 8081');
  }
});

https.createServer({
  key: fs.readFileSync('./privkey.pem'), // your server keys
  cert: fs.readFileSync('./cert.pem'),
  ca: fs.readFileSync('./chain.pem')
}, function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('your mother was a whore');
  res.end();
}).listen(3001, function(err) {
  if (err) console.log('https server', err);

  child_process.exec('/usr/bin/env https_proxy=http://localhost:8081 curl -k -X POST -d foo https://www.google.com/bar', function (err, stdout, stderr) {
    if (err) {
      console.error('First: %s', err);
    }

    // console.log('STDERR: ', stderr.toString());
    console.log('First: %s', stdout.toString());
  });

  child_process.exec('/usr/bin/env https_proxy=http://localhost:8081 curl -k https://www.google.com/foo', function (err, stdout, stderr) {
    if (err) {
      console.error('Second: %s', err);
    }

    console.log('Second: %s', stdout.toString());
  });
});

function matcher(req) {
}
