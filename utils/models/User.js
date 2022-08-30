const { Schema, model } = require('mongoose')

module.exports = {
  modelName: 'User',
  getModel: model('user', new Schema({
    _id: { type: String, required: true },
    ban: { type: Boolean, default: false },
    reason: { type: String, default: '' }
  }, { versionKey: false, collection: 'user' }))
}
