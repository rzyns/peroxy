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

  var routes = [];

  function add(matcher, fn) {
    routes.push({matcher: matcher, fn: fn});
  }

  function router(req, res, next) {
    for (var i = 0; i < matchers.length; i++) {
      if (matchers[i].matcher(req)) {
        return matchers[i].fn(req, res, next);
      }
    }

    return next();
  }

  module.exports = {
    add: add,
    router: router
  };
});
