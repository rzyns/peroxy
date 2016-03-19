var Proxy = require('http-mitm-proxy');
var proxy = Proxy();
var circ = require('circular-json');
var fs = require('fs');
var path = require('path');

proxy.onError(function (ctx, err, errorKind) {
  var url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : '';
  console.error(errorKind + ' on ' + url + ':', err);
});

proxy.onCertificateRequired = function (hostname, callback) {
  return callback(null, {
    keyFile: __dirname + '/privkey.pem',
    certFile: __dirname + '/cert.pem'
  });
};

proxy.onRequest(function (ctx, callback) {
  // fs.open(path.resolve(process.cwd(), 'client_to_proxy_request.json'), 'w', function (err, fd) {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     fs.write(fd, circ.stringify(ctx.clientToProxyRequest), function (err) {
  //       if (err) {
  //         console.error(err);
  //       }

  //       fs.close(fd);
  //     });
  //   }
  // });

  if (ctx.clientToProxyRequest.headers.host == 'www.google.com' && ctx.clientToProxyRequest.url.indexOf('/search') === 0) {
    ctx.use(Proxy.gunzip);
    ctx.onResponseData(function (ctx, chunk, callback) {
      chunk = new Buffer(chunk.toString().replace(/<h3.*?<\/h3>/g, '<h3>Pwned!</h3>'));
      return callback(null, 'yourmom');
    });
  }

  return callback();
});

proxy.listen({
  port: 8081
});
