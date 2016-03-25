(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var recursiveCamelCaseKeys = require('../lib/recursive-camel-case-keys.js');
  var yaml = require('js-yaml');

  function readConfigsDir(dir) {
    var p = new Promise(function (resolve, reject) {
      try {
        fs.readdir(dir, function (err, files) {
          if (err) {
            return reject(err);
          }

          return resolve(files);
        });
      } catch (e) {
        if (e) return reject(e);
      }
    });

    return p.then(function (files) {
      return Promise.all((files || []).map(function (file) {
        return new Promise(function (resolve, reject) {
          return fs.readFile(path.resolve(dir, file), function (err, data) {
            if (err) {
              return reject(err);
            }

            return resolve(data);
          });
        });
      })).then(function (fileBodies) {
        var data = [];

        fileBodies.forEach(function (body) {
          yaml.loadAll(body, function (doc) {
            data.push(recursiveCamelCaseKeys(doc));
          });
        });

        return data;
      });
    });
  }

  function configLoader(proxy, router, respond) {
    return function (cfg) {
      router.add(router.match(cfg.match), respond(cfg.response));
    };
  }

  function runProxy(proxy, router, respond) {
    return function (argv) {
      var p =  path.join(process.cwd(), (argv.d || 'examples'))
      readConfigsDir(p)
        .then(function (cfgs) {
          cfgs.forEach(configLoader(proxy, router, respond));

          // This is important, apparently :P
          proxy.use(function (req, res, next) {
            if (typeof req.host !== 'undefined') {
              req.originalHost = req.host;
            }

            if (req.headers) {
              req.host = req.headers.host;
            }

            next();
          });

          // proxy.use(require('body-parser').text({type: '*/*'}));

          // proxy.use(function (req, res, next) {
          //   console.log('Proxying %s%s', req.host, req.url);
          //   next();
          // });

          proxy.use(router);

          proxy.use(function (req, res, next) {
            proxy.forward(req, res, function (proxyReq) {
              proxyReq.on('response', function (response) {
                res.writeHead(response.statusCode, response.headers);
                response.pipe(res);
              });

              proxyReq.on('error', function (err) {
                console.log('Air Roar! Air Roar!');
                console.log(err);
                res.end();
              })
            });
          });

          proxy.on('error', function (err) {
            console.log('Air Roar! Air Roar!');
            console.log(err, err.stack.split('\n'));
          });

          proxy.listen(argv.port, 'localhost', function (err) {
            if (err) {
              console.error('this is broken for some reason!');
            } else {
              console.log('Listening on port %d', argv.port);
            }
          });
        })
        .catch(function (err) {
          console.error(err);
          throw err;
        });
    };
  }

  module.exports = runProxy;
})();
