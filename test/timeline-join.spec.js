'use strict'

const _ = require('lodash')

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const {
  getPlayerActions,
  getTimeline,
  stubPassport,
  getMessages
} = require('./test-utils')

test('POST /timeline/join/:timelineName => joins timeline with no players', async t => {
  t.plan(1)
  try {
    const userId = '10'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 4'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .expect(200)
    const timeline = await getTimeline(timelineName, conn)
    t.ok(timeline.players.includes(userId), 'player joined timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => creates relevant message', async t => {
  t.plan(1)
  try {
    const userId = '10'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 4'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .expect(200)
    const messages = await getMessages(conn)
    const relevantMessage = messages.find(m => m.playerId === userId)
    t.deepEquals(_.omit(relevantMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId: '10',
      readBy: [],
      text: 'has travelled to this timeline',
      timelineName
    }, 'message created as expected')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => joins timeline with existing players', async t => {
  t.plan(1)
  try {
    const userId = '10'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 2'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .expect(200)
    const timeline = await getTimeline(timelineName, conn)
    t.deepEquals(timeline.players.sort(), ['10', '2', '3'].sort(), 'player appended to timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => costs 1 action', async t => {
  t.plan(1)
  try {
    const userId = '10'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 2'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .expect(200)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 9, 'one action was decremented')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => with no actions left', async t => {
  t.plan(2)
  try {
    const userId = '5'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 0, 'actions remain at 0')
    t.notOk(timeline.players.includes(userId), 'user not added to timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => when over iterations cap', async t => {
  t.plan(2)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 4'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions remain at 10')
    t.notOk(timeline.players.includes(userId), 'user not added to timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    stubPassport('foo', 'bar', null)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/join/Timeline 5')
      .expect(403)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => bad parameters - no timelineName', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/join')
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => bad parameters - non-existent user', async t => {
  t.plan(1)
  try {
    const userId = '99999'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/join/Timeline 1')
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => bad parameters - non-existent timeline', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/join/foo')
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => user already in timeline', async t => {
  t.plan(2)
  try {
    const userId = '10'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 9'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.deepEquals(timeline.players.sort(), ['10', '9'].sort(), 'timeline players unchanged')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => timeline is locked', async t => {
  t.plan(2)
  try {
    const userId = '4'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 5'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.deepEquals(timeline.players.sort(), ['1', '2', '3', '5'].sort(), 'timeline players unchanged')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
