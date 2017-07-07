'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const { getPlayerActions, getTimeline } = require('./test-utils')

test('POST /timeline/lock/:timelineName => locks timeline', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const userId = 3
    await request(app)
      .post(`/timeline/lock/${timelineName}`)
      .set('userId', userId)
      .expect(200)
    const timeline = await getTimeline(timelineName, conn)
    t.equals(timeline.isLocked, true, 'timeline is locked')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => costs 1 action', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const userId = 3
    await request(app)
      .post(`/timeline/lock/${timelineName}`)
      .set('userId', userId)
      .expect(200)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 9, 'one action was decremented')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => with no actions left', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const userId = 5
    await request(app)
      .post(`/timeline/lock/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 0, 'actions remain at 0')
    t.equals(timeline.isLocked, false, 'timeline still unlocked')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => with no lock item', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const userId = 1
    await request(app)
      .post(`/timeline/lock/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.equals(timeline.isLocked, false, 'timeline still unlocked')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})

test('POST /timeline/lock/:timelineName => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/lock/Timeline 1')
      .expect(400)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => bad parameters - no timelineName', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 3
    await request(app)
      .post('/timeline/lock')
      .set('userId', userId)
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => bad parameters - non-existent user', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 99999
    await request(app)
      .post('/timeline/lock/Timeline 1')
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => bad parameters - non-existent timeline', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 3
    await request(app)
      .post('/timeline/lock/foo')
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => user not in timeline', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 3
    const timelineName = 'Timeline 4'
    await request(app)
      .post(`/timeline/lock/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.equals(timeline.isLocked, false, 'timeline still unlocked')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => timeline already locked', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 5'
    const userId = 3
    await request(app)
      .post(`/timeline/lock/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const timeline = await getTimeline(timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.equals(timeline.isLocked, true, 'timeline still locked')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
