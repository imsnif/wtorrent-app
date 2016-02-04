var WebFS = require("web-fs")

var fs = new WebFS()

Object.keys(fs.__proto__).forEach(function (key) {
  var origFunc = fs.__proto__[key]
  fs.__proto__[key] = function() {
    if (this.entry !== undefined) return origFunc.apply(this, arguments)
    throw new Error("No fs entry")
  }.bind(fs)
})

module.exports = fs
