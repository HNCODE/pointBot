const { Schema, model } = require('mongoose')

module.exports = {
  modelName: 'Bannedword',
  getModel: model('bannedword', new Schema({
    _id: { type: String, required: true },
    BanWord: { type: Array, default: [] }
  }, { versionKey: false, collection: 'bannedword' }))
}
