const { createServer } = require('./server')
const middleware = require('./middleware')

/**
 * Module exports.
 */
module.exports = {
  createServer,
  middleware
}
