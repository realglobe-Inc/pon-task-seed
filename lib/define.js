/**
 * Define task
 * @function define
 * @param {function|ClayLump} db - DB instance or it's creator
 * @param {string} pattern - Filename pattern
 * @param {Object} [options={}] - Optional settings
 * @param {string} [options.env=process.env.NODE_ENV || 'development'] - Env to resolve
 * @param {function} [options.resolver] - Resolver for resource name
 * @returns {function} Defined task
 */
'use strict'

const asleep = require('asleep')
const aglob = require('aglob')
const path = require('path')

const defaultResolver = (filename) => path.basename(filename).replace(/^[0-9.]+/, '').split('.')[0]

/** @lends define */
function define (db, pattern, options = {}) {
  const {
    resolver = defaultResolver,
    seedKey = 'id'
  } = options

  async function task (ctx) {
    const {logger} = ctx
    const newInstance = typeof db === 'function'
    const instance = newInstance ? db() : db
    instance.theDBLogEnabled = false
    const {driver} = instance
    const env = process.env.NODE_ENV || 'development'
    const filenames = await aglob(pattern.replace(/:env/, env))

    const exists = async (resource, key) => {
      if (!key) {
        return false
      }
      if (seedKey === 'id') {
        return resource.has(key)
      }
      return resource.exists({[seedKey]: key})
    }

    for (const filename of filenames) {
      const resourceName = resolver(filename)
      const resource = instance.resource(resourceName)
      const attributesArray = require(path.resolve(filename))
      const created = []
      for (const attributes of attributesArray) {
        if (!attributes.hasOwnProperty(seedKey)) {
          logger.warn(`SeedKey "${seedKey}" is missing for entry: ${JSON.stringify(attributes)}`)
        }
        const key = attributes[seedKey]
        const skip = key && (await exists(resource, key))
        if (skip) {
          continue
        }
        const entity = await resource.create(attributes, {allowReserved: true, suppressWarning: true,})
        created.push(entity)
        await asleep(0)
      }

      if (created.length > 0) {
        logger.trace(`<${resourceName}> ${created.length} data for ${seedKey}: ${created.map((entity) => entity[seedKey] || entity.id).join(', ')}`)
      }
    }
    if (driver && driver.flush) {
      try {
        await driver.flush()
      } catch (e) {
        // Do nothing
      }
    }

    if (newInstance) {
      await asleep(100)
      await instance.close()
    }
    instance.theDBLogEnabled = true
  }

  return Object.assign(task,
    // Define sub tasks here
    {}
  )
}

module.exports = define
