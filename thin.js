var fs = require('fs');
var https = require('https');
var path = require('path');

var Thin = require('thin');

var proxy = new Thin();

// `req` and `res` params are `http.ClientRequest` and `http.ServerResponse` accordingly
// be sure to check http://nodejs.org/api/http.html for more details
proxy.use(function(req, res, next) {
  console.log('Proxying:', req.url);
  console.log(' - Method: %s', req.method);
  return next();
});

proxy.use(function (req, res, next) {
  req.once('data', function (data) {
    if (data == 'foo') {
      res.write('yourmom!\n', function () {
        next();
      });
    } else {
      next();
    }
  });
});

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

  require('child_process').exec('/usr/bin/env https_proxy=http://localhost:8081 curl -k -X POST -d foo https://www.google.com', function (err, stdout, stderr) {
    if (err) {
      console.error(err);
    }

    // console.log('STDERR: ', stderr.toString());
    console.log(stdout.toString());
  });
});

function matcher(req) {
}
