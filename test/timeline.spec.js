'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')
const request = require('supertest')
const sinon = require('sinon')
const r = require('rethinkdb')
const mockData = require('./mock-data')

async function insertData (name, data, connection) {
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table(name).insert(data).run(connection, (err, result) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

async function fixtures () {
  const tables = [ 'players', 'powers', 'timelines' ]
  const connection = await new Promise((resolve, reject) => {
    r.connect((err, connection) => {
      if (err) return reject('error connecting to rethinkdb: ', err)
      resolve(connection)
    })
  })
  await new Promise((resolve, reject) => {
    r.dbDrop('chronomancer').run(connection, (err, result) => {
      r.dbCreate('chronomancer').run(connection, (err, result) => {
        resolve(Promise.all(
          tables.map(tableName => {
            return new Promise((resolve, reject) => {
              r.db('chronomancer').tableCreate(tableName).run(connection, function(err, result) {
                if (err) return reject(err)
                return resolve()
              })
            })
          })
        ))
      })
    })
  })
  for (let tName of tables) {
    await insertData(tName, mockData[tName], connection)
  }
  return connection
}

test('POST /timeline/quest/:timelineName => adds relevant item to player', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    await new Promise(resolve => setTimeout(resolve, 200)) // TODO: remove connection from app to fix this
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', 1)
      .expect(200)
    const playerItems = await new Promise((resolve, reject) => {
      r.db('chronomancer').table('players').filter({id: 1})('items').run(conn, (err, cursor) => {
        if (err) throw err
        cursor.toArray((err, results) => {
          if (err) throw err
          resolve(results[0][0])
        })
      })
    })
    t.deepEquals(playerItems, {source: 'Timeline 1', name: 'steal'}, 'Item added to player')
    conn.close()
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
