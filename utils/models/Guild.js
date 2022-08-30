const { Schema, model } = require('mongoose')

module.exports = {
  modelName: 'Guild',
  getModel: model('guild', new Schema({
    _id: { type: String, required: true },
    items: { type: Array, default: [] },
    enableLog: { type: Boolean, default: false },
    logChannel: { type: String, default: '0' },
    memberSizeLogCh: { type: String, default: '0' },
    useChannel: { type: String, default: '0' },
    GamblingChannel: { type: String, default: '0' },
    settingChannel: { type: String, default: '0' },
    shopChannel: { type: String, default: '0' },
    BannedWordLogChannel: { type: String, default: '0' }
  }, { versionKey: false, collection: 'guild' }))
}
