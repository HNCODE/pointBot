const { Schema, model } = require('mongoose')

module.exports = {
  modelName: 'Member',
  getModel: model('member', new Schema({
    _id: { type: String, required: true },
    point: { type: Number, default: 0 },
    items: { type: Array, default: [] },
    attendacneTime: { type: Number, default: 0 }
  }, { versionKey: false, collection: 'member' }))
}
