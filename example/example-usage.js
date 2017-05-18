'use strict'

const pon = require('pon')
const ponTaskSeed = require('pon-task-seed')

async function tryExample () {
  let db = () => require('../db')
  let run = pon({
    'db:seed': ponTaskSeed(db, 'db/seeds/:env/*.js')
  })

  run('db:seed')
}

tryExample()
