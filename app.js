var spawn = require('child_process').spawn
var ProgressBar = require('progress')
var exec = require('child_process').exec
var fs = require('fs');
var fmt = require('./dd-fmt.js')

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

  if (err) throw err

  var size = stats.size || Number.MAX_VALUE
  var oldTotal = 0
  var totalTransferredBytes = 0
  var progress = 0

  var dd = spawn('dd', [bs, inf, of], { 'stdio' : 'pipe' })
  dd.stderr.pipe(fmt)

  var bar = new ProgressBar('  transfering [:bar] :percent elapsed: :elapsed sec', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: size
  })

  var t = setInterval(function() {
    exec('sudo kill -SIGINFO ' + dd.pid)
  }, 1000)

  fmt.on('data', function(data) {
    totalTransferredBytes = parseInt(data.toString())
    progress = totalTransferredBytes - oldTotal
    bar.tick(progress)
    oldTotal = totalTransferredBytes
  })

  fmt.on('end', function() {
    t.unref()
  })
})
