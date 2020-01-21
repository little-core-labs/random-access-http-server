const parseRange = require('range-parser')
const debug = require('debug')('randmo-access-http-server')
const mime = require('mime')
const path = require('path')
const url = require('url')

/**
 * HTTP status code for "OK"
 * @private
 */
const HTTP_STATUS_OK = 200

/**
 * HTTP status code for "Partial Content"
 * @private
 */
const HTTP_STATUS_PARTIAL_CONTENT = 206

/**
 * HTTP status code for "Bad Request"
 * @private
 */
const HTTP_STATUS_BAD_REQUEST = 400

/**
 * HTTP header key for "Accept-Ranges"
 * @private
 */
const HTTP_HEADER_ACCEPT_RANGES = 'Accept-Ranges'

/**
 * HTTP header key for "Content-Range"
 * @private
 */
const HTTP_HEADER_CONTENT_RANGE = 'Content-Range'

/**
 * HTTP header key for "Content-Length"
 * @private
 */
const HTTP_HEADER_CONTENT_LENGTH = 'Content-Length'

/**
 * HTTP header key for "Content-Type"
 * @private
 */
const HTTP_HEADER_CONTENT_TYPE = 'Content-Type'

/**
 * Creates request middleware for a `server` instance.
 * @public
 * @param {Object} opts
 * @param {Function} opts.storage
 * @return {Function}
 */
function middleware(opts) {
  return onrequest
  function onrequest(req, res, next) {
    const { method } = req
    // istanbul ignore next
    const headers = req.headers || {}

    // istanbul ignore next
    if ('function' !== typeof next) {
      // istanbul ignore next
      next = (err) => {
        debug(err)
        send()
      }
    }

    const uri = url.parse(req.url)
    const storage = opts.storage(uri.pathname, opts, req, res)
    const contentType = mime.getType(uri.pathname)

    return void storage.open(onopen)

    function send(buffer) {
      res.end(buffer)
      // istanbul ignore next
      if (false !== opts.autoCloseStorage) {
        storage.close()
      }
    }

    function onopen(err) {
      // istanbul ignore next
      if (err) { return onerror(err) }
      stat(storage, onstat)
    }

    function onerror(err) {
      // istanbul ignore next
      next(err)
      // istanbul ignore next
      if (false !== opts.autoCloseStorage) {
        storage.close((err) => {
          if (err) { debug(err) }
        })
      }
    }

    function onread(err, buffer) {
      send(buffer)
    }

    function onstat(err, stats) {
      // istanbul ignore next
      if (err) { return onerror(err) }

      const { size } = stats
      const range = headers.range
        ? parseRange(size, headers.range)[0]
        : null

      res.setHeader(HTTP_HEADER_ACCEPT_RANGES, 'bytes')

      // istanbul ignore next
      if (contentType) {
        res.setHeader(HTTP_HEADER_CONTENT_TYPE, contentType)
      }

      if (range) {
        const { start, end } = range
        const length = end - start + 1
        const bytes = `bytes ${start}-${end}/${size}`
        res.statusCode = HTTP_STATUS_PARTIAL_CONTENT
        res.setHeader(HTTP_HEADER_CONTENT_LENGTH, length)
        res.setHeader(HTTP_HEADER_CONTENT_RANGE, bytes)
      } else {
        res.statusCode = HTTP_STATUS_OK
        res.setHeader(HTTP_HEADER_CONTENT_LENGTH, size)
      }

      // istanbul ignore next
      if (opts.headers && 'object' === typeof opts.headers) {
        for (const key in opts.headers) {
          res.setHeader(key, opts.headers[key])
        }
      }

      switch (method) {
        case 'HEAD':
          send(null)
          break

        case 'GET':
          // istanbul ignore next
          if (range) {
            const { start, end } = range
            storage.read(start, end - start + 1, onread)
          } else {
            // istanbul ignore next
            storage.read(0, size, onread)
          }
          break

        // istanbul ignore next
        default:
          res.statusCode = HTTP_STATUS_BAD_REQUEST
          next(null)
      }
    }
  }
}

/**
 * Queries for storage stats.
 * @param {Object} storage
 * @param {Function} callback
 * @private
 */
// istanbul ignore next
function stat(storage, callback) {
  if (false !== storage.statable && 'function' === typeof storage.stat) {
    storage.stat(callback)
  } else if ('number' === typeof storage.length) {
    process.nextTick(callback, null, { size: storage.length })
  } else if ('string' === typeof storage.length) {
    process.nextTick(callback, null, { size: parseInt(storage.length) || 0 })
  } else  {
    // istanbul ignore next
    process.nextTick(callback, null, { size: 0 })
  }
}

/**
 * Module exports.
 */
module.exports = middleware
