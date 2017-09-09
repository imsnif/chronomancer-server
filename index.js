'use strict'

const r = require('rethinkdb')
const { CronJob } = require('cron');

(async function startServer () {
  try {
    const connection = await new Promise((resolve, reject) => {
      r.connect((err, conn) => {
        if (err) return reject(err)
        resolve(conn)
      })
    })
    const app = require('./app')(connection)
    require('./channel')(app, connection)
    const jobs = require('./jobs')(connection)
    app.listen(3000, function listening () {
      const cron = new CronJob('* * * * * *', () => jobs())
      cron.start()
      console.log('Listening on %d', 3000)
    })
  } catch (e) {
    console.error('Failed to start server:', e)
  }
})()
