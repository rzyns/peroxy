(function () {
  var camelCase = require('camelcase');

  function recursiveCamelCaseKeys(obj) {
    // var ret = ref || {};
    var ret = {};
    Object.keys(obj).forEach(function (key) {
      if (typeof obj[key] === 'object') {
        ret[camelCase(key)] = recursiveCamelCaseKeys(obj[key]);
      } else {
        ret[camelCase(key)] = obj[key];
      }
    });

    return ret;
  }

  module.exports = recursiveCamelCaseKeys;
})();
