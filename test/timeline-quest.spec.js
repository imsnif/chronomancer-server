'use strict'

const _ = require('lodash')
const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const {
  getPlayerItems,
  getPlayerActions,
  stubPassport,
  getMessages
} = require('./test-utils')

test('POST /timeline/quest/:timelineName => adds relevant item to player', async t => {
  t.plan(1)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .expect(200)
    const playerItems = await getPlayerItems(userId, conn)
    t.deepEquals(playerItems, [{source: 'Timeline 1', name: 'steal'}], 'Item added to player')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => creates relevant message', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    await request(app)
      .post(`/timeline/quest/${timelineName}`)
      .expect(200)
    const messages = await getMessages(conn)
    const relevantMessage = messages.find(m => m.playerId === userId)
    t.deepEquals(_.omit(relevantMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId: userId,
      readBy: [],
      text: 'is questing for steal',
      timelineName
    }, 'message created as expected')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => costs 1 action', async t => {
  t.plan(1)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .expect(200)
    const playerActions = await getPlayerActions(userId, conn)
    t.equals(playerActions, 9, 'actions decremented by 1')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => with no actions left', async t => {
  t.plan(2)
  try {
    const userId = '5'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .expect(403)
    const playerItems = await getPlayerItems(userId, conn)
    const playerActions = await getPlayerActions(userId, conn)
    t.deepEquals(
      playerItems,
      [
        { name: 'assist', source: 'Timeline 2' },
        { name: 'lock', source: 'Timeline 2' },
        { name: 'unlock', source: 'Timeline 2' },
        { name: 'reset', source: 'Timeline 2' },
        { name: 'steal', source: 'Timeline 2' }
      ],
      'item not added to player'
    )
    t.equals(playerActions, 0, 'actions remain at 0')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => appends to existing item list', async t => {
  t.plan(1)
  try {
    const userId = '2'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .expect(200)
    const playerItems = await getPlayerItems(userId, conn)
    t.deepEquals(playerItems, [
      {source: 'Timeline 2', name: 'assist'},
      {source: 'Timeline 1', name: 'steal'}
    ], 'Item appended to player')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    stubPassport('foo', 'bar', null)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .expect(403)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => bad parameters - no timelineName', async t => {
  t.plan(1)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest')
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => bad parameters - non-existent user', async t => {
  t.plan(1)
  try {
    const userId = '99999'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => bad parameters - non-existent timeline', async t => {
  t.plan(1)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/foo')
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => user not in timeline', async t => {
  t.plan(2)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/Timeline 4')
      .expect(403)
    const playerItems = await getPlayerItems(userId, conn)
    const playerActions = await getPlayerActions(userId, conn)
    t.deepEquals(playerItems, [], 'item not added to player')
    t.equals(playerActions, 10, 'actions remain at 10')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
