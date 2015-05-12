var spawn = require('child_process').spawn
var ProgressBar = require('progress')
var exec = require('child_process').exec
var fs = require('fs');
var fmt = require('./dd-fmt.js');
// var temp = require('temp').track()


if(process.getuid() != 0) throw 'You must run dd-node as root'

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
    var totalTransferredBytes = parseInt(data.toString())
    var progress = totalTransferredBytes - oldTotal
    bar.tick(progress)
    oldTotal = totalTransferredBytes
  })

  fmt.on('end', function() {
    t.unref()
  })
})
