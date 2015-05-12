var spawn = require('child_process').spawn
var ProgressBar = require('progress')
var exec = require('child_process').exec
var fs = require('fs');
var fmtProgress = require('./dd-fmt.js').Progress
var fmtError = require('./dd-fmt.js').Error

if (process.getuid() != 0) {
  console.log('You must run dd-node as root')
  process.exit(0)
}

var args = process.argv

var bs = args[2]
var inf = args[3]
var of = args[4]

var buf = []
var inputFile = inf.split('=').pop()

fs.stat(inputFile, function(err, stats) {

  if (err) stats = {};

  var size = stats.size || Number.MAX_VALUE
  var oldTotal = 0
  var totalTransferredBytes = 0
  var progress = 0

  var dd = spawn('dd', [bs, inf, of], { 'stdio' : 'pipe' })
  dd.stderr.pipe(fmtProgress)
  dd.stderr.pipe(fmtError)

  var bar = new ProgressBar('  transfering [:bar] :percent elapsed: :elapseds', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: size
  })

  var t = setInterval(function() {
    exec('sudo kill -SIGINFO ' + dd.pid)
  }, 1000)

  fmtProgress.on('data', function(data) {
    totalTransferredBytes = parseInt(data.toString())
    progress = totalTransferredBytes - oldTotal
    bar.tick(progress)
    oldTotal = totalTransferredBytes
  })

  fmtProgress.on('end', function() {
    t.unref()
  })

  fmtError.on('data', function(data) {
    if (dd.exitCode !== 0) {
      console.log(data.toString())
      process.exit(0)
    }
  })
})
