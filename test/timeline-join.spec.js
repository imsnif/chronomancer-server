'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const { getPlayerActions, getTimeline } = require('./test-utils')

test('POST /timeline/join/:timelineName => joins timeline with no players', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 4'
    const userId = 3
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .set('userId', userId)
      .expect(200)
    const timeline = await getTimeline(timelineName, conn)
    t.ok(timeline.players.includes(userId), 'player joined timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => joins timeline with existing players', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 2'
    const userId = 1
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .set('userId', userId)
      .expect(200)
    const timeline = await getTimeline(timelineName, conn)
    t.deepEquals(timeline.players.sort(), [1, 2, 3].sort(), 'player appended to timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => costs 1 action', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 2'
    const userId = 1
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .set('userId', userId)
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
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const userId = 5
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .set('userId', userId)
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

test('POST /timeline/join/:timelineName => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/join/Timeline 5')
      .expect(400)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => bad parameters - no timelineName', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 3
    await request(app)
      .post('/timeline/join')
      .set('userId', userId)
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
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 99999
    await request(app)
      .post('/timeline/join/Timeline 1')
      .set('userId', userId)
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
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 3
    await request(app)
      .post('/timeline/join/foo')
      .set('userId', userId)
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
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 1
    const timelineName = 'Timeline 1'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.deepEquals(timeline.players.sort(), [1, 2, 3, 4].sort(), 'timeline players unchanged')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/join/:timelineName => timeline is locked', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 4
    const timelineName = 'Timeline 5'
    await request(app)
      .post(`/timeline/join/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.deepEquals(timeline.players.sort(), [1, 2, 3, 5].sort(), 'timeline players unchanged')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
