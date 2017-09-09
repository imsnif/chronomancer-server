'use strict'

const WebSocket = require('ws')

let server, wss

module.exports = async function mockServer (connection) {
  if (server) server.close()
  if (wss) wss.close()
  await new Promise(resolve => setTimeout(resolve, 200)) // TODO: do we need this?
  const app = require('../../app')(connection)
  await new Promise(resolve => {
    server = app.listen(1337, resolve)
  })
  require('../../channel')(app, connection)
  const client = new WebSocket('ws://localhost:1337/socket/feed')
  client.on('error', () => {}) // Do not paste to production code! This is a mock!
  wss = app.wss
  return Promise.resolve({client, server, wss})
}
