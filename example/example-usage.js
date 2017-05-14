'use strict'

const pon = require('pon')
const ponTaskSeed = require('pon-task-seed')

async function tryExample () {
  let run = pon({
    'db:seed': ponTaskSeed('db/seeds/:env/*.js')
  })

  run('db:seed')
}

tryExample()
