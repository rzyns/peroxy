describe('recursive camel case keys', function () {
  var expect = require('chai').expect;

  var recursiveCamelCaseKeys = require('../lib/recursive-camel-case-keys.js');

  var obj = {
    "foo bar baz": 7,
    "bam blaz blatt": {
      "your mom": "your dad",
      "your father": {
        "your uncle": 99
      }
    }
  };

  it('should do what\'s on the tin', function () {
    expect(recursiveCamelCaseKeys(obj)).to.deep.equal({
      fooBarBaz: 7,
      bamBlazBlatt: {
        yourMom: "your dad",
        yourFather: {
          yourUncle: 99
        }
      }
    });
  });
});
