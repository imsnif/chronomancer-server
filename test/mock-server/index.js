'use strict'

const http = require('http')
const WebSocket = require('ws')

let server, wss

module.exports = async function mockServer (connection) {
  if (wss) wss.close()
  if (server) server.close()
  await new Promise(resolve => setTimeout(resolve, 200))
  server = http.createServer()
  await new Promise(resolve => {
    server.listen(1337, resolve)
  })
  wss = await require('../../channel')(server, connection)
  const client = new WebSocket('ws://localhost:1337')
  client.on('error', () => {}) // Do not paste to production code! This is a mock!
  return Promise.resolve({
    client,
    server,
    wss
  })
}
