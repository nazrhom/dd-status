var spawn = require('child_process').spawn
var ProgressBar = require('node-progress')
var exec = require('child_process').exec
var fs = require('fs')
/*
cli
  .version('0.0.1')
  .option('-b', '--bs', 'bs', '')
  .option('-i', '--if', 'if', '')
  .option('-o', '--of', 'of', '')
  .parse(process.argv) */

var args = process.argv

var bs = args[2]
var inf = args[3]
var of = args[4]

var dd = spawn('dd', [bs, inf, of], { 'stdio' : 'inherit' })

var inputFile = inf.split('=').pop()
fs.stat(inputFile, function(err, stats) {
  if (err) throw err
  var size = stats.size
  
  /*
  var bar = new ProgressBar('  downloading [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: size 
  })
  */

  setInterval(function() {
    exec('sudo kill -SIGINFO ' + dd.pid, function(err) {
        if(err) console.log(err)
    })
  }, 10000)
})
