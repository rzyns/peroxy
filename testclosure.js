function makeClosure() {
  var foo;

  return {
    setFoo: function (a) { foo = a; },
    getFoo: function () { return foo; }
  };
}
