var chai   = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

var expect = chai.expect;

describe('I ate some garbidge', function () {
  'use strict';

  var path = require('path');
  var respond = require('../modules/response.js');

  var testData = {
    response: {
      headers: {
        'Content-Type': 'text/plain'
      },
      statusCode: 200,
      contentFile: path.resolve(__dirname, 'files/sample.txt')
    }
  };

  function MockResponse() {
    this.headers = {};
  }

  MockResponse.prototype.setHeader = function setHeader(key, val) {
    if (this.closed) {
      throw new Error('Tried to set header after end, jerk!');
      return; // Unnecessary! Probably.
    }

    this.headers[key] = val;
    this.closed = false;
  };

  MockResponse.prototype.write = function write(a, cb) {
    if (this.closed) {
      return cb(new Error('Write after end, jerk!'));
    }
    return cb();
  };

  MockResponse.prototype.writeHead = function writeHead(code, text) {
    this.error = code + ' ' + text;
  };

  MockResponse.prototype.end = function end(a) {
    this.closed = true;
  };

  it('But it wasn\'t very tasty', function (done) {
    var res = new MockResponse();
    sinon.stub(res, 'end');
    sinon.stub(res, 'setHeader');
    var s = sinon.stub(res, 'write');
    s.callsArg(1);

    respond(testData.response)(res).then(function (results) {
      expect(res.end).to.have.callCount(1);
      expect(res.setHeader).to.have.callCount(1);
      expect(res.setHeader).to.have.been.calledWithExactly('Content-Type', 'text/plain');
      expect(res.write).to.have.callCount(1);
      expect(res.write).to.have.been.calledWith(new Buffer('this is the body\n'));

      expect(results).to.have.property('headers');
      expect(results).to.have.deep.property('headers.Content-Type', 'text/plain');
      expect(results).to.have.property('statusCode', 200);
      expect(results).to.have.property('content');

      done();
    }).catch(done);
  });
});
