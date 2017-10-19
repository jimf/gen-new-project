#!/usr/bin/env node

var interpret = require('../src/interpret')
var gen = require('../src/gen')

interpret(gen()).catch(function (err) {
  console.error(err)
  process.exit(1)
})
