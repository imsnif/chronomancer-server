'use strict'

const test = require('tape')
const fixtures = require('./fixtures')

test.onFinish(async t => {
  await new Promise(resolve => setTimeout(resolve, 200))
  const conn = await fixtures()
  const { server, wss } = await require('./mock-server')(conn)
  wss.close()
  server.close()
  conn.close()
})
