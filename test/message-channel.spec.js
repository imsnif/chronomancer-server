'use strict'

const test = require('tape')
const _ = require('lodash')
const fixtures = require('./fixtures')
const mockServer = require('./mock-server')
const {
  sortData,
  failureTimeout,
  insertFakeData,
  stubPassport
} = require('./test-utils')

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
  t.plan(4)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const mockData = require('./fixtures/mock-data')
    const timeout = failureTimeout(t)
    client.on('open', () => {
      client.send(1)
    })
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
        t.deepEquals(
          data.messages.map(m => _.omit(m, ['id', 'read'])).sort(sortData),
          mockData['messages'].map(m => _.omit(m, ['id', 'readBy'])).sort(sortData),
          'initial messages data sent properly'
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
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1, gameId: 1}
    verifyMessageData(mockData, client, 'players', timeout, t)
    client.on('open', () => {
      client.send(1)
    })
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
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1, gameId: 1}
    client.on('open', () => {
      client.send(1)
    })
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
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1, gameId: 1}
    client.on('open', () => {
      client.send(1)
    })
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

test('Messages changes propagated through message channel (unread message)', async t => {
  t.plan(2)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1, gameId: 1, readBy: []}
    client.on('open', () => {
      client.send(1)
    })
    const expectedMessage = Object.assign({}, mockData, {read: false})
    delete expectedMessage.readBy
    verifyMessageData(expectedMessage, client, 'messages', timeout, t)
    await new Promise(resolve => setTimeout(resolve, 200)) // allow bootstrapping time
    await insertFakeData('messages', mockData, conn)
    t.pass() // somewhat of an ugly hack to avoid a race condition
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})

test('Messages changes propagated through message channel (read message)', async t => {
  t.plan(2)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1, gameId: 1, readBy: ['1']}
    client.on('open', () => {
      client.send(1)
    })
    const expectedMessage = Object.assign({}, mockData, {read: true})
    delete expectedMessage.readBy
    verifyMessageData(expectedMessage, client, 'messages', timeout, t)
    await new Promise(resolve => setTimeout(resolve, 200)) // allow bootstrapping time
    await insertFakeData('messages', mockData, conn)
    t.pass() // somewhat of an ugly hack to avoid a race condition
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})

test('Game changes propagated through message channel', async t => {
  t.plan(2)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const { client } = await mockServer(conn)
    const timeout = failureTimeout(t)
    const mockData = {foo: 1} // TODO: fix this when we filter by games
    client.on('open', () => {
      client.send(1)
    })
    verifyMessageData(mockData, client, 'games', timeout, t)
    await new Promise(resolve => setTimeout(resolve, 200)) // allow bootstrapping time
    await insertFakeData('games', mockData, conn)
    t.pass() // somewhat of an ugly hack to avoid a race condition
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})
