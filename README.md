random-access-http-server
=========================

> Server and middleware to serve read only random access storages over HTTP.

## Status

> **Stable**

> [![Actions Status](https://github.com/little-core-labs/random-access-http-server/workflows/Node%20CI/badge.svg)](https://github.com/little-core-labs/random-access-http-server/actions)

## Installation

```sh
$ npm install random-access-http-server
```

## Usage

```js
const { createServer } = require('random-access-http-server')
const raf = require('random-access-file')
const server = createServer({
  storage(pathname, opts, req, res) {
    // return `random-access-storage` compliant object based
    // on `pathname` from the request URL
    return raf(pathname)
  }
})
```

```js
const http = request('http')
const raf = require('random-access-file')
const onrequest = require('random-access-http-server/middleware')({
  storage(pathname, opts, req, res) {
    // same as above
    return raf(pathname)
  }
})

const server = http.createServer(onrequest)
```

## API

<a name="api-create-server"></a>
### `const server = createServer(opts)`

Creates a new
[`http.Server`](https://nodejs.org/api/http.html#http_class_http_server)
instance with `opts` passed directly to
[`middleware(opts)`](#api-middleware).

<a name="api-middleware"></a>
### `const onrequest = middleware(opts)`

Creates a new middleware function (`onrequest(req, res, next)`) suitable
for handling
[request](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
and [response](https://nodejs.org/api/http.html#http_class_http_serverresponse)
objects from a
[`http.Server`](https://nodejs.org/api/http.html#http_class_http_server).

## License

MIT
