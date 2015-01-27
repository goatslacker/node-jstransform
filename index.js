module.exports = { install: install }

var fs = require('fs')
var js = require.extensions['.js']
var jstransform = require('jstransform')

var installed = {}

function install(opts) {
  var visitors = (opts.visitors || []).reduce(function (visitors, visitor) {
    return visitors.concat(visitor.visitorList || visitor)
  }, [])

  var extensions = opts.extensions || ['.js']

  extensions.forEach(addExtension(visitors))
}

function addExtension(visitors) {
  return function (ext) {
    if (installed[ext]) {
      return
    }

    require.extensions[ext] = function (module, filename) {
      if (filename.match(/node_modules/)) {
        return js(module, filename)
      }

      var before = fs.readFileSync(filename, 'utf8')
      var after = jstransform.transform(visitors, before).code

      return module._compile(after, filename)
    }

    installed[ext] = true
  }
}

