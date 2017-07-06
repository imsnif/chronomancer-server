'use strict'

const test = require('tape')
const fixtures = require('./fixtures')

test.onFinish(async t => {
  const conn = await fixtures()
  conn.close()
})
