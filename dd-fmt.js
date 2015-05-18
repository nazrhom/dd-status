var through2 = require('through2')
var _ = require('lodash')

var progress = through2(function (chunk, enc, callback) {
  var self = this
  var buf = chunk.toString()
  var lines = buf.split('\n')
  var capture = /([\d]+) bytes/

  var updates = _.compact(_.map(lines, function (line) {
    var match = capture.exec(line)
    if (match) {
      return match[1]
    }
  }))

  _.forEach(updates, function (update) {
    self.push(update)
  })

  callback()
})

var error = through2(function(chunk, enc, callback) {
  var self = this
  var buf = chunk.toString()
  var lines = buf.split('\n')
  var expr = /dd: /

  var updates = _.compact(_.map(lines, function (line) {
    if (expr.test(line)) {
      return line
    }
  }))

  _.forEach(updates, function (update) {
    self.push(update)
  })

  callback()
});

module.exports.Progress = progress
module.exports.Error = error
