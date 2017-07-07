'use strict'
const r = require('rethinkdb')

function deleteJob (job, connection) { // TODO: move elsewhere
  return new Promise((resolve, reject) => {
    r.table('powers').get(job.id).delete().run(connection, (err, result) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function jobHasSufficientScore (job) {
  const positive = job.allies.map(a => a.score).reduce((sum, item) => sum + item, 0) + 1
  const negative = job.enemies.map(a => a.score).reduce((sum, item) => sum + item, 0)
  return (positive - negative > 0)
}

module.exports = function (connection) {
  connection.use('chronomancer')
  const handleJob = require('./handle')(connection)
  const { getTimeline } = require('../service/timeline')(connection)
  return async function resolveJobs () {
    return new Promise((resolve, reject) => {
      r.table('powers').filter({gameId: 1})
      .run(connection, (err, cursor) => {
        if (err) return reject(err)
        cursor.toArray(async (err, jobs) => {
          if (err) return reject(err)
          try {
            await Promise.all(
              jobs.map(async j => {
                if (!j.name || typeof j.name !== 'string') return Promise.resolve()
                const jobName = j.name.toLowerCase()
                if (!handleJob[jobName]) return Promise.resolve()
                const { players } = await getTimeline(j.timelineName)
                if (jobHasSufficientScore(j) && players.includes(j.playerId)) {
                  await handleJob[jobName](j)
                }
                await deleteJob(j, connection)
                return Promise.resolve()
              })
            )
          } catch (e) {
            return reject(e)
          }
          return resolve()
        })
      })
    })
  }
}
