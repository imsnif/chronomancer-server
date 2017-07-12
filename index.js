'use strict'

const r = require('rethinkdb')
const http = require('http');

(async function startServer () {
  try {
    const connection = await new Promise((resolve, reject) => {
      r.connect((err, conn) => {
        if (err) return reject(err)
        resolve(conn)
      })
    })
    const app = require('./app')(connection)
    const server = http.createServer(app)
    require('./channel')(server, connection)
    server.listen(3000, function listening () {
      console.log('Listening on %d', server.address().port)
    })
  } catch (e) {
    console.error('Failed to start server:', e)
  }
})()
