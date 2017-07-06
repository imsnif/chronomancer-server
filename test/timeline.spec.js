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
        resolve(results[0][0])
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
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', 1)
      .expect(200)
    const playerItems = await getPlayerItems(1, conn)
    t.deepEquals(playerItems, {source: 'Timeline 1', name: 'steal'}, 'Item added to player')
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
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', 1)
      .expect(200)
    const playerActions = await getPlayerActions(1, conn)
    t.equals(playerActions, 9, 'actions decremented by 1')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test.onFinish(async t => {
  const conn = await fixtures()
  conn.close()
})
