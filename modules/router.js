(function () {
  'use strict';

  // function onError(ctx, err) {}
  // function onCertificateRequired(hostname, callback) {}
  // function onCertificateMissing(ctx, files, callback) {}
  // function onRequest(ctx, callback) {}
  // function onRequestData(ctx, chunk, callback) {}
  // function onResponse(ctx, callback) {}
  // function onResponseData(ctx, chunk, callback) {}
  // function onWebSocketConnection(ctx, callback) {}
  // function onWebSocketSend(ctx, message, flags, callback) {}
  // function onWebSocketMessage(ctx, message, flags, callback) {}
  // function onWebSocketError(ctx, err) {}
  // function onWebSocketClose(ctx, code, message, callback) {}

  // module.exports = {
  //   onError: onError,
  //   onCertificateRequired: onCertificateRequired,
  //   onCertificateMissing: onCertificateMissing,
  //   onRequest: onRequest,
  //   onRequestData: onRequestData,
  //   onResponse: onResponse,
  //   onResponseData: onResponseData
  // }

  var type = require('typechecker');

  function r() {
    var routes = [];

    function add(matcher, fn) {
      routes.push({matcher: matcher, fn: fn});
    }

    /*
     * host: string|regex|array
     * method: string|regex|array
     * url: string|regex|array
     */
    function match(obj) {
      return function(req) {
        return Object.keys(obj).reduce(function (acc, cur) {
          return !!acc && _matches(req[cur], obj[cur]);
        }, true);
      };
    }

    function _matches(val, cmp) {
      var ret = false;

      switch (true) {
        case type.isString(cmp): ret = val === cmp;             break;
        case type.isRegExp(cmp): ret = cmp.test(val);           break;
        case type.isArray(cmp):  ret = cmp.indexOf(val) !== -1; break;
      }

      return ret;
    }

    function router(req, res, next) {
      for (var i = 0; i < routes.length; i++) {
        if (routes[i].matcher(req)) {
          return routes[i].fn(req, res, next);
        }
      }

      return next();
    }

    router.add = add;
    router.match = match;
    router._matches = _matches;
    router._routes = routes;

    return router;
  }

  module.exports = r;
})();
