const Mongo = require('mongoose')

class Database {
  constructor (client) {
    this.client = client
    this.mongo = Mongo.connection
    this.models = {}
  }

  async init () {
    await this.loadModels()
    await this.connect()
    await this.client.wait(5500)
  }

  async connect (re = false) {
    const msg = re ? 'Reconnecting' : 'Connecting'
    this.client.logger.debug(`[Database:Init] ${msg} to MongoDB... (Host: ${this.client._options.db.mongo.url})`)
    try {
      await Mongo.connect(this.client._options.db.mongo.url, this.client._options.db.mongo.options)
      this.connected = true
      this.client.logger.info(`[Database:Init] Successfully ${msg} to MongoDB! (Host: ${this.client._options.db.mongo.url})`)
    } catch (err) {
      this.client.logger.error(`[Database:Init] ${msg} to MongoDB an error! (${err.name})`)
      this.client.logger.error(err)
      this.connect(true)
    }
  }

  async loadModels (reload = false) {
    const ReloadOrLoad = this.client.models_loaded ? 'Reload' : 'Load'
    this.client.logger.debug(`[Database:Models:${ReloadOrLoad}] ${ReloadOrLoad}ing Database Models...`)
    const loadModels = await this.client.globAsync(require('path').join(process.cwd(), 'src/utils/models/**/*.js'))
    this.client.logger.info(`[Database:Models:${ReloadOrLoad}] Loaded Database Models ${loadModels.length}`)
    this.client.logger.info(`[Database:Models:${ReloadOrLoad}] Database Model Files (${loadModels.join(' | ')})`)
    if (reload) {
      for (const modelName of this.mongo.modelNames()) {
        this.mongo.deleteModel(modelName)
        this.client.logger.warn(`[Database:Models:${ReloadOrLoad}] Deleted (${modelName}) Database Model.`)
      }
    }
    for (const model of loadModels) {
      const Model = require(model)
      this.models[Model.modelName] = Model.getModel
      this.mongo.models[Model.modelName] = Model.getModel
      this.client.logger.info(`[Database:Models:${ReloadOrLoad}] Added (${Model.modelName}) Database Model.`)
      delete require.cache[require.resolve(model)]
    }
    this.client.logger.info(`[Database:Models:${ReloadOrLoad}] Successfully ${ReloadOrLoad}ed Database Models!`)
    this.client.models_loaded = true
    return this.models
  }

  async getMember (guildId, memberId) {
    const getMemberId = this.getFormatter(guildId, memberId)
    this.client.logger.debug(`[Database:getMember] Get (${getMemberId}) Member database...`)
    let result = await this.mongo.collection('member').findOne({ _id: getMemberId })
    if (!result) {
      this.client.logger.debug(`[Database:getMember] (${getMemberId}) database is not exist, create one...`)
      try {
        this.client.logger.debug(`[Database:getMember] (${getMemberId}) Saving...`)
        await this.models.Member({ _id: getMemberId }).save()
        result = await this.mongo.collection('member').findOne({ _id: getMemberId })
      } catch (e) {
        this.client.logger.warn(`[Database:getMember] Saving to (${getMemberId}) an error! (${e.name})`)
        if (this.client.debug) this.client.logger.error(`[Database:getMember] ${e.stack}`)
        throw new Error(`[Database:getMember] Saving to (${getMemberId}) an error! (${e.name})`)
      }
    }
    return result
  }

  async getUser (userId) {
    this.client.logger.debug(`[Database:getUser] Get (${userId}) User database...`)
    let result = await this.mongo.collection('user').findOne({ _id: userId })
    if (!result) {
      this.client.logger.debug(`[Database:getUser] (${userId}) database is not exist, create one...`)
      try {
        this.client.logger.debug(`[Database:getUser] (${userId}) Saving...`)
        await this.models.User({ _id: userId }).save()
        result = await this.mongo.collection('user').findOne({ _id: userId })
      } catch (e) {
        this.client.logger.warn(`[Database:getUser] Saving to (${userId}) an error! (${e.name})`)
        if (this.client.debug) this.client.logger.error(`[Database:getUser] ${e.stack}`)
        throw new Error(`[Database:getUser] Saving to (${userId}) an error! (${e.name})`)
      }
    }
    return result
  }

  async getGuild (guildId) {
    this.client.logger.debug(`[Database:getGuild] Get (${guildId}) Guild database...`)
    let result = await this.mongo.collection('guild').findOne({ _id: guildId })
    if (!result) {
      this.client.logger.debug(`[Database:getGuild] (${guildId}) database is not exist, create one...`)
      try {
        this.client.logger.debug(`[Database:getGuild] (${guildId}) Saving...`)
        await this.models.Guild({ _id: guildId }).save()
        result = await this.mongo.collection('guild').findOne({ _id: guildId })
      } catch (e) {
        this.client.logger.warn(`[Database:getGuild] Saving to (${guildId}) an error! (${e.name})`)
        if (this.client.debug) this.client.logger.error(`[Database:getGuild] ${e.stack}`)
        throw new Error(`[Database:getGuild] Saving to (${guildId}) an error! (${e.name})`)
      }
    }
    return result
  }

  async getBannedword (guildId) {
    this.client.logger.debug(`[Database:getBannedword] Get (${guildId}) bannedword database...`)
    let result = await this.mongo.collection('bannedword').findOne({ _id: guildId })
    if (!result) {
      this.client.logger.debug(`[Database:getBannedword] (${guildId}) database is not exist, create one...`)
      try {
        this.client.logger.debug(`[Database:getBannedword] (${guildId}) Saving...`)
        await this.models.Bannedword({ _id: guildId }).save()
        result = await this.mongo.collection('bannedword').findOne({ _id: guildId })
      } catch (e) {
        this.client.logger.warn(`[Database:getBannedword] Saving to (${guildId}) an error! (${e.name})`)
        if (this.client.debug) this.client.logger.error(`[Database:getBannedword] ${e.stack}`)
        throw new Error(`[Database:getBannedword] Saving to (${guildId}) an error! (${e.name})`)
      }
    }
    return result
  }


  async updateMember (guildId, memberId, query, insert = false) {
    const result = await this.mongo.collection('member').updateOne({ _id: this.getFormatter(guildId, memberId) }, query, { insert })
    return result
  }

  async updateUser (userId, query, insert = false) {
    const result = await this.mongo.collection('user').updateOne({ _id: userId }, query, { insert })
    return result
  }

  async updateGuild (guildId, query, insert = false) {
    const result = await this.mongo.collection('guild').updateOne({ _id: guildId }, query, { insert })
    return result
  }

  async updateBannedword (guildId, query, insert = false) {
    const result = await this.mongo.collection('bannedword').updateOne({ _id: guildId }, query, { insert })
    return result
  }

  async removeMember (guildId, memberId) {}

  async removeUser (userId) {}

  async removeGuild (guildId) {}

  async removeGuild (guildId) {}

  getFormatter (...args) { return args.join('-') }
}

module.exports = Database
