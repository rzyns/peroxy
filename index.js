#! /usr/bin/env node
var fs = require('fs');
var https = require('https');
var path = require('path');
var child_process = require('child_process');

// var Thin = require('thin');
var router = require('./modules/router.js')();
var respond = require('./modules/response');

var yargs = require('yargs');

var proxy = new (require('./modules/proxy.js'))();

yargs
  .usage(`$0 <cmd> [args]`)
  .option('config-dir', {
    alias: 'd',
    default: '.',
    describe: 'where configs are located'
  })
  .command('run', 'run proxy', function (yargs) {
    return yargs.option('port', {
      alias: 'p',
      default: 8081,
      describe: 'Port proxy should listen on'
    });
  }, require('./modules/run-proxy.js')(proxy, router, respond))
  .help('help')
  .argv;

var camelCase = require('camelcase');
var yaml = require('js-yaml');

// var proxy = new Thin();
