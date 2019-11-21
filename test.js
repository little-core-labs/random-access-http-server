const test = require('tape')
const raf = require('random-access-file')
const rah = require('random-access-http')
const ram = require('random-access-memory')
const fs = require('fs')

const { createServer } = require('./server')

test('basic', (t) => {
  const server = createServer({
    storage(pathname) {
      return raf(__filename)
    }
  })

  server.listen(0, () => {
    const { port } = server.address()
    const file = rah(`http://localhost:${port}`)
    file.open((err) => {
      t.error(err)
      file.read(0, file.length, (err, buffer) => {
        const expected = fs.readFileSync(__filename)
        t.error(err)
        t.ok(0 === Buffer.compare(buffer, expected))
        file.read(4, 8, (err, buffer) => {
          const expected = fs.readFileSync(__filename).slice(4, 12)
          t.error(err)
          t.ok(0 === Buffer.compare(buffer, expected))
          t.end()
          server.close()
        })
      })
    })
  })
})

test('basic in memory', (t) => {
  const server = createServer({
    storage() {
      return ram(Buffer.from('hello'))
    }
  })

  server.listen(0, () => {
    const { port } = server.address()
    const hello = rah(`http://localhost:${port}`)
    hello.open((err) => {
      t.error(err)
      hello.read(0, hello.length, (err, buffer) => {
        const expected = Buffer.from('hello')
        t.error(err)
        t.ok(0 === Buffer.compare(buffer, expected))
        t.end()
        server.close()
      })
    })
  })
})

test('basic http proxy', (t) => {
  const server = createServer({
    storage() {
      return ram(Buffer.from('hello'))
    }
  })

  const proxy = createServer({
    storage(pathname) {
      const { port } = server.address()
      return rah(`http://localhost:${port}${pathname}`)
    }
  })

  server.listen(0, () => {
    proxy.listen(0, () => {
      const { port } = proxy.address()
      const hello = rah(`http://localhost:${port}`)
      hello.open((err) => {
        t.error(err)
        hello.read(0, hello.length, (err, buffer) => {
          const expected = Buffer.from('hello')
          t.error(err)
          t.ok(0 === Buffer.compare(buffer, expected))
          t.end()
          server.close()
          proxy.close()
        })
      })
    })
  })
})
