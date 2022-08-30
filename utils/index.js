const { nanoid } = require('nanoid')

class Compressed {
  constructor (client = {}) { this.client = client }
  static highestColor (member) { return member.roles.highest.color }
  static genKeyCode (size = 6) { return nanoid(size) }
}

module.exports = {
  Logger: require('./Logger'),
  Database: require('./Database'),
  ArrayUtils: require('./ArrayUtils'),
  compressed: Compressed
}
