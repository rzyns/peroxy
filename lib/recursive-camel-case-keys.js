(function () {
  var camelCase = require('camelcase');
  var isPlainObject = require('is-plain-object');

  function recursiveCamelCaseKeys(obj) {
    // var ret = ref || {};
    var ret = {};
    Object.keys(obj).forEach(function (key) {
      if (isPlainObject(obj[key])) {
        ret[camelCase(key)] = recursiveCamelCaseKeys(obj[key]);
      } else {
        ret[camelCase(key)] = obj[key];
      }
    });

    return ret;
  }

  module.exports = recursiveCamelCaseKeys;
})();
