'use strict'

const test = require('tape')
const request = require('supertest')
const r = require('rethinkdb')
const fixtures = require('./fixtures')

function getPlayerItems (id, conn) {
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table('players').filter({id})('items').run(conn, (err, cursor) => {
      if (err) return reject(err)
      cursor.toArray((err, results) => {
        if (err) return reject(err)
        resolve(results[0])
      })
    })
  })
}

function getPlayerActions (id, conn) {
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table('players').filter({id})('actions').run(conn, (err, cursor) => {
      if (err) return reject(err)
      cursor.toArray((err, results) => {
        if (err) return reject(err)
        resolve(results[0])
      })
    })
  })
}

test('POST /timeline/quest/:timelineName => adds relevant item to player', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 1
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', userId)
      .expect(200)
    const playerItems = await getPlayerItems(userId, conn)
    t.deepEquals(playerItems, [{source: 'Timeline 1', name: 'steal'}], 'Item added to player')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/quest/:timelineName => costs 1 action', async t => {
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

test('POST /timeline/quest/:timelineName => with no actions left', async t => {
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

test('POST /timeline/quest/:timelineName => appends to existing item list', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 2
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', userId)
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

test.onFinish(async t => {
  const conn = await fixtures()
  conn.close()
})
