var chai   = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);
// chai.use(require('sinon-chai-in-order').default);

describe('modules/router.js', function () {
  describe('_matches', function () {
    var _matches;
    beforeEach(function () {
      _matches = require('../modules/router.js')()._matches;
    })

    it('Should work with strings', function () {
      expect(_matches('foo', 'foo')).to.be.true;
      expect(_matches('foo', 'bar')).to.be.false;
    });

    it('Should work with arrays', function () {
      expect(_matches('foo', ['foo', 'bar', 'baz'])).to.be.true;
      expect(_matches('foo', ['bar', 'baz', 'bam'])).to.be.false;
      expect(_matches('foo', [])).to.be.false;
    });

    it('Should work with regexes', function () {
      expect(_matches('yourmom', /your/)).to.be.true;
      expect(_matches('yourmom', /^your/)).to.be.true;
      expect(_matches('yourmom', /david/)).to.be.false;
    });
  });

  // describe('match', function () {
  //   var match;
  //   beforeEach(function () {
  //     match = require('../modules/router.js')().match;
  //   });

  //   it('Should work', function () {

  //   });
  // });

  describe('function matchers', function () {
    it('should...', function () {
      var router = require('../modules/router.js')();
      var req = {
        host: 'www.google.com',
        url: '/search?q=yourmom',
        headers: {
          'host': 'www.google.com',
          'content-type': 'application/json'
        }
      };

      var matcher = sinon.spy(function (req) { return false; });
      var middleware = sinon.spy(function (req, res, next) {});
      var next = sinon.spy(function () {});

      router.add(matcher, middleware);
      router(req, {}, next);

      expect(matcher).to.have.been.calledOnce;
      expect(middleware).to.have.been.notCalled;
      expect(next).to.have.been.calledOnce;
    });

  });
  describe('Object matchers', function () {
    var test = {};

    beforeEach('set up routing', function () {
      test = {
        router: require('../modules/router.js')(),
        callback: sinon.stub(),
        matchGoogleSearch: {host: 'www.google.com', url: /^\/search/},
        routeGoogleSearch: sinon.stub(),
        matchGoogle: {host: 'www.google.com'},
        routeGoogle: sinon.stub()
      };

      test.router.add(test.router.match(test.matchGoogleSearch), test.routeGoogleSearch);
      test.router.add(test.router.match(test.matchGoogle), test.routeGoogle);
    });

    it('Should execute the first match only', function () {
      test.router({host: 'www.google.com', url: '/search'}, {}, test.callback);

      expect(test.routeGoogle)
        .to.have.been.notCalled;
      expect(test.routeGoogleSearch)
        .to.have.been.calledOnce;
      expect(test.callback)
        .to.have.been.notCalled;
    });

    it('Should fall back to the next match in the chain', function () {
      test.router({host: 'www.google.com'}, {}, test.callback);

      expect(test.routeGoogleSearch)
        .to.have.been.notCalled;
      expect(test.routeGoogle)
        .to.have.been.calledOnce;
      expect(test.callback)
        .to.have.been.notCalled;
    });

    it('Should call next() callback when no matches', function () {
      test.router({host: 'example.com'}, {}, test.callback);

      expect(test.routeGoogle)
        .to.have.been.notCalled;
      expect(test.routeGoogleSearch)
        .to.have.been.notCalled;
      expect(test.callback)
        .to.have.been.calledOnce;
    });
  });
});
