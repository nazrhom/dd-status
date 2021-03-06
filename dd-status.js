#!/usr/bin/env node

var _ = require('lodash')
var ProgressBar = require('progress')
var exec = require('child_process').exec
var spawn = require('child_process').spawn
var fs = require('fs')
var fmtProgress = require('./dd-fmt.js').Progress
var fmtError = require('./dd-fmt.js').Error
var dd;

if (process.getuid() != 0) {
  console.log('You must run dd-node as root')
  process.exit(1)
}

var args = process.argv.slice(2)
var buf = []
var inputFile = findInputFile(args).split('=').pop()

fs.stat(inputFile, function(err, stats) {

  if (err) stats = {}

  var size = stats.size || Number.MAX_VALUE
  var totalTransferredBytes = 0
  var oldTotal = 0
  var progress = 0

  dd = spawn('dd', args, { 'stdio' : 'pipe' })
  dd.stderr.pipe(fmtProgress)
  dd.stderr.pipe(fmtError)

  var bar = new ProgressBar('  copying [:bar] :percent elapsed: :elapseds', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: size
  })

  setInterval(sendSignal, 1000).unref()

  fmtProgress.on('data', function(data) {
    totalTransferredBytes = parseInt(data.toString())
    progress = totalTransferredBytes - oldTotal
    bar.tick(progress)
    oldTotal = totalTransferredBytes
  })

  fmtError.on('data', function(data) {
    if (dd.exitCode !== 0) {
      console.log('\n')
      console.log(data.toString())
      process.exit(1)
    }
  })
})


function findInputFile(args) {
  return _.find(args, function(arg) {
    return arg.match(/if=[.]+/)
  }) || ''
}

function sendSignal() {
  exec('sudo kill -SIGINFO ' + dd.pid)
}
