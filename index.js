module.exports = { install: install }

var fs = require('fs')
var js = require.extensions['.js']
var jstransform = require('jstransform')

var installed = false

function install(opts) {
  if (installed) {
    return
  }

  var visitors = (opts.visitors || []).reduce(function (visitors, visitor) {
    return visitors.concat(visitor.visitorList || visitor)
  }, [])

  require.extensions['.js'] = function (module, filename) {
    if (filename.match(/node_modules/)) {
      return js(module, filename)
    }

    var before = fs.readFileSync(filename, 'utf8')
    var after = jstransform.transform(visitors, before).code

    return module._compile(after, filename)
  }

  installed = true
}
