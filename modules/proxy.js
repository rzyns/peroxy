/*
 * This is basically a shameless rip of node-thin by Dmitry Shirokov:
 *   https://github.com/runk/node-thin
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Dmitry Shirokov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var http = require('http'),
  net = require('net'),
  https = require('https'),
  fs = require('fs'),
  os = require('os'),
  request = require('request'),
  url = require('url'),
  EventEmitter = require('events').EventEmitter,
  util = require('util');

function Mitm(opts) {
  this.opts = opts || {};

  if (!this.opts.hasOwnProperty('followRedirect'))
    this.opts.followRedirect = true;

  // socket path for system mitm https server
  this.socket = os.tmpdir() + '/node-thin.' + process.pid + '.sock';
  this.interceptors = [];

  this.log = new Logger(false); // true for debug
}

util.inherits(Mitm, EventEmitter);

Mitm.prototype.listen = function(port, host, cb) {
  var self = this;

  // make sure there's no previously created socket
  if (fs.existsSync(this.socket))
    fs.unlinkSync(this.socket);

  var options = {
    SNICallback: this.opts.SNICallback,
    key: fs.readFileSync(__dirname + '/../cert/dummy.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/../cert/dummy.crt', 'utf8')
  };

  // fake https server, MITM if you want
  this.httpsServer = https.createServer(options, this._handler.bind(this)).listen(this.socket);

  // start HTTP server with custom request handler callback function
  this.httpServer = http.createServer(this._handler.bind(this)).listen(port, host, function(err) {
    if (err)
      self.log.error('Cannot start proxy', err);
    // else
    //   this.log.info('Listening on %s:%s [%d]', this.opts.host, this.opts.port, process.pid);
    cb(err);
  });

  // add handler for HTTPS (which issues a CONNECT to the proxy)
  this.httpServer.addListener('connect', this._httpsHandler.bind(this));
};


Mitm.prototype.close = function(cb) {
  var self = this;
  self.httpServer.close(function(err) {
    if (err)
      return cb(err);
    self.httpsServer.close(cb);
  });
};


Mitm.prototype._handler = function(req, res) {

  var interceptors = this.interceptors.concat([this.direct.bind(this)]);
  var layer = 0;

  (function runner() {
    var interceptor = interceptors[layer++];
    interceptor(req, res, function(err) {
      if (err) return res.end('Proxy error: ' + err.toString());
      runner();
    });
  })();
};


Mitm.prototype._httpsHandler = function(request, socketRequest, bodyhead) {
  var self = this;
  var log = this.log,
    url = request['url'],
    httpVersion = request['httpVersion'];

  log.info('  = will connect to socket "%s"', this.socket);

  // set up TCP connection
  var proxySocket = new net.Socket();
  proxySocket.connect(this.socket, function() {
    log.info('< connected to socket "%s"', self.socket);
    log.info('> writing head of length %d', bodyhead.length);

    proxySocket.write(bodyhead);

    // tell the caller the connection was successfully established
    socketRequest.write('HTTP/' + httpVersion + ' 200 Connection established\r\n\r\n');
  });

  proxySocket.on('data', function(chunk) {
    log.info('< data length = %d', chunk.length);
    socketRequest.write(chunk);
  });

  proxySocket.on('end', function() {
    log.info('< end');
    socketRequest.end();
  });

  socketRequest.on('data', function(chunk) {
    log.info('> data length = %d', chunk.length);
    proxySocket.write(chunk);
  });

  socketRequest.on('end', function() {
    log.info('> end');
    proxySocket.end();
  });

  proxySocket.on('error', function(err) {
    socketRequest.write('HTTP/' + httpVersion + ' 500 Connection error\r\n\r\n');
    log.error('< ERR: %s', err);
    socketRequest.end();
  });

  socketRequest.on('error', function(err) {
    log.error('> ERR: %s', err);
    proxySocket.end();
  });
};


Mitm.prototype.use = function(fn) {
  this.interceptors.push(fn);
};


Mitm.prototype.removeInterceptors = function() {
  this.interceptors.length = 0;
};

Mitm.prototype.forward = function(req, res, cb) {
  var log = this.log,
    self = this,
    path = url.parse(req.url).path,
    schema = req.connection.encrypted ? 'https' : 'http',
    dest = schema + '://' + req.headers['host'] + path;

  var params = {
    url: dest,
    strictSSL: this.opts.strictSSL,
    rejectUnauthorized: this.opts.rejectUnauthorized,
    method: req.method,
    proxy: this.opts.proxy,
    followRedirect: this.opts.followRedirect,
    headers: {}
  };

  // Set original headers except proxy system's headers
  var exclude = ['proxy-connection'];
  for (var hname in req.headers)
    if (!~exclude.indexOf(hname))
      params.headers[hname] = req.headers[hname];

  var buffer = '';
  req.on('data', function(chunk) {
    buffer += chunk;
  });

  req.on('end', function() {
    params.body = buffer;
    var proxyReq = request(params);
    cb(proxyReq);
  });

  // This is required if body-parser is used since all the data is consumed
  // and the IncomingMessage stream will be closed by the time `Mitm#forward()`
  // is called, and thus no `data` or `end` events will be fired, but we already
  // have the entire body.
  if (typeof req.body !== 'undefined') {
    params.body = req.body;
    var proxyReq = request(params);
    cb(proxyReq);
  }
};

Mitm.prototype.direct = function(req, res) {
  var self = this;
  this.forward(req, res, function(r) {
    r.on('error', function(err) {
      self.emit('error', err);
      res.end();
    });
    r.pipe(res);
  });
};

function Logger(debug) {
  this.debug = debug;
}

Logger.prototype.info = function() {
  if (!this.debug)
    return;
  console.log.apply(console, arguments);
};

Logger.prototype.error = function() {
  console.error.apply(console, arguments);
};

module.exports = Mitm;
