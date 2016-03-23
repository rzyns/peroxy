(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');

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
        var yaml = require('js-yaml');
        var data = [];

        fileBodies.forEach(function (body) {
          yaml.safeLoadAll(body, function (doc) {
            data.push(doc);
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
      readConfigsDir(process.cwd() + '/examples')
        .then(function (cfgs) {
          console.log('As promised!');
          console.log(argv);
          cfgs.forEach(configLoader(proxy, router, respond));
          proxy.use(function (req, res, next) {
            console.log('Proxying %s', req.url);
            next();
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
          throw err;
        });
    };
  }

  module.exports = runProxy;
})();
