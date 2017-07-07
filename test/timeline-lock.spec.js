'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const { getPlayerItems, getPlayerActions, getTimeline } = require('./test-utils')

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
  // TBD
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 1
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', userId)
      .expect(200)
    const playerActions = await getPlayerActions(userId, conn)
    t.equals(playerActions, 9, 'actions decremented by 1')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => with no actions left', async t => {
  // TBD
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 5
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', userId)
      .expect(403)
    const playerItems = await getPlayerItems(userId, conn)
    const playerActions = await getPlayerActions(userId, conn)
    t.deepEquals(
      playerItems,
      [{source: 'Timeline 2', name: 'assist'}],
      'item not added to player'
    )
    t.equals(playerActions, 0, 'actions remain at 0')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => with no lock item', async t => {
  // TBD
})

test('POST /timeline/lock/:timelineName => bad parameters - no userId', async t => {
  // TBD
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .expect(400)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => bad parameters - no timelineName', async t => {
  // TBD
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 1
    await request(app)
      .post('/timeline/quest')
      .set('userId', userId)
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => bad parameters - non-existent user', async t => {
  // TBD
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 99999
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => bad parameters - non-existent timeline', async t => {
  // TBD
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 1
    await request(app)
      .post('/timeline/quest/foo')
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => user not in timeline', async t => {
  // TBD
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 1
    await request(app)
      .post('/timeline/quest/Timeline 4')
      .set('userId', userId)
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

test.skip('POST /timeline/lock/:timelineName => timeline already locked', async t => {
  // TBD
})
