#! /usr/bin/env node
var fs = require('fs');
var https = require('https');
var path = require('path');
var child_process = require('child_process');

var Thin = require('thin');

var proxy = new Thin();

var router = require('./modules/router.js')();

var yargs = require('yargs');

yargs.describe('input', );

console.log(argv);
