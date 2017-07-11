'use strict'

const test = require('tape')
const _ = require('lodash')
const fixtures = require('./fixtures')
const mockServer = require('./mock-server')
const { sortData, failureTimeout, insertFakeData } = require('./test-utils')

function verifyMessageData (mockData, client, tableName, timeout, t) {
  let counter = 0
  client.on('message', (e) => {
    if (counter === 1) { // allow bootstrap message to be sent
      try {
        clearTimeout(timeout)
        const data = JSON.parse(e)
        t.deepEquals(
          _.omit(data[tableName], ['id']),
          mockData,
          'change propagated to client'
        )
      } catch (e) {
        clearTimeout(timeout)
        t.fail(e)
        t.end()
      }
    }
    counter += 1
  })
}

test('Initial data is sent on connection', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const mockData = require('./fixtures/mock-data')
    const timeout = failureTimeout(t)
    client.on('message', (e) => {
      try {
        clearTimeout(timeout)
        if (!e) throw (new Error('malformed message'))
        const data = JSON.parse(e)
        t.deepEquals(
          data.players.sort(sortData),
          mockData['players'].sort(sortData),
          'initial players data sent properly'
        )
        t.deepEquals(
          data.powers.map(p => _.omit(p, ['id'])).sort(sortData),
          mockData['powers'].sort(sortData),
          'initial powers data sent properly'
        )
        t.deepEquals(
          data.timelines.map(t => _.omit(t, ['id'])).sort(sortData),
          mockData['timelines'].sort(sortData),
          'initial timelines data sent properly'
        )
      } catch (e) {
        console.error(e.stack)
        t.fail()
        t.end()
      }
    })
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})

test('Players changes propagated through message channel', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1}
    verifyMessageData(mockData, client, 'players', timeout, t)
    await new Promise(resolve => setTimeout(resolve, 200)) // allow bootstrapping time
    await insertFakeData('players', mockData, conn)
    t.pass() // somewhat of an ugly hack to avoid a race condition
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})

test('Timelines changes propagated through message channel', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1}
    verifyMessageData(mockData, client, 'timelines', timeout, t)
    await new Promise(resolve => setTimeout(resolve, 200)) // allow bootstrapping time
    await insertFakeData('timelines', mockData, conn)
    t.pass() // somewhat of an ugly hack to avoid a race condition
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})

test('Powers changes propagated through message channel', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1}
    verifyMessageData(mockData, client, 'powers', timeout, t)
    await new Promise(resolve => setTimeout(resolve, 200)) // allow bootstrapping time
    await insertFakeData('powers', mockData, conn)
    t.pass() // somewhat of an ugly hack to avoid a race condition
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})
