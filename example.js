const { createServer } = require('./server')
const raf = require('random-access-file')
const rah = require('random-access-http')

const server = createServer({
  storage(pathname) {
    return raf(__filename)
  }
})

server.listen(3000, () => {
  const file = rah('http://localhost:3000')
  file.open(() => {
    console.log(file.length)
    file.read(0, file.length, (err, buffer) => {
      console.log('%s', buffer)
    })
  })
})
