(function () {
  'use strict';

  var assign = require('lodash.assign');
  var fs = require('fs');

  function respond(opts) {
    return function (req, res, next) {
      var promises = [];

      if (typeof opts.statusCode !== 'undefined') {
        var statusCode = parseInt(opts.statusCode, 10);
        if (statusCode) {
          res.statusCode = statusCode;
          promises.push(Promise.resolve({statusCode: statusCode}));
        }
      }

      if (typeof opts.headers !== 'undefined' && Object.keys(opts.headers).length) {
        for (var header in opts.headers) {
          if (opts.headers.hasOwnProperty(header)) {
            res.setHeader(header, opts.headers[header]);
          }
          promises.push(Promise.resolve({headers: opts.headers}));
        }
      }

      if (typeof opts.content !== 'undefined') {
        promises.push(new Promise(function (resolve, reject) {
          return res.write(opts.content, function (err) {
            if (err) return reject(err);

            return resolve({content: opts.content});
          });
        }));
      }

      if (opts.contentFile) {
        promises.push(new Promise(function (resolve, reject) {
          fs.readFile(opts.contentFile, function (err, data) {
            if (err) {
              return reject(err);
            } else {
              return res.write(data, function (err) {
                if (err) {
                  return reject(err);
                }

                return resolve({content: data});
              });
            }
          });
        }));
      }

      return Promise.all(promises).then(function (results) {
        res.end();
        return results.reduce(assign, {});
      }).catch(function (err) {
        throw err;
        res.writeHead(500, 'Proxy error from doing proxy things....');
        res.end('proxy error: error doing stuff!');
      });
    };
  }

  module.exports = respond;
})();
