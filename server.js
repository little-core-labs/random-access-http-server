const middleware = require('./middleware')
const http = require('http')

/**
 * Creates a HTTP server with request middleware installed
 * @public
 * @param {Object} opts
 * @return {htt.Server}
 */
function createServer(opts) {
  const server = http.createServer()
  const onrequest = middleware(opts)
  server.on('request', onrequest)
  return server
}

/**
 * Module exports.
 */
module.exports = {
  createServer
}
