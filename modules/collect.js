(function () {
  'use strict';

  // function onError(ctx, err) {}
  // function onCertificateRequired(hostname, callback) {}
  // function onCertificateMissing(ctx, files, callback) {}
  function onRequest(ctx, callback) {}
  function onRequestData(ctx, chunk, callback) {}
  // function onResponse(ctx, callback) {}
  // function onResponseData(ctx, chunk, callback) {}
  // function onWebSocketConnection(ctx, callback) {}
  // function onWebSocketSend(ctx, message, flags, callback) {}
  // function onWebSocketMessage(ctx, message, flags, callback) {}
  // function onWebSocketError(ctx, err) {}
  // function onWebSocketClose(ctx, code, message, callback) {}

  module.exports = {
    onError: onError,
    onCertificateRequired: onCertificateRequired,
    onCertificateMissing: onCertificateMissing,
    onRequest: onRequest,
    onRequestData: onRequestData,
    onResponse: onResponse,
    onResponseData: onResponseData
  }
});
