const moment = require('moment-timezone')
require('moment-duration-format')(moment)

module.exports = {
  name: '출석',
  aliases: ['attendance', 'cnftjr', 'ㅁㅅㅅ둥뭋ㄷ'],
  category: 'General',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, message, data: { getGuild, getMember } }) => {
    const allowChId = getGuild.GamblingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const getDuraction = moment.duration(getMember.attendacneTime + 86400000 - Date.now()).format('HH시간 mm분 ss초')
    if (getMember.attendacneTime !== 0 && getMember.attendacneTime + 86400000 > Date.now()) return message.channel.send(`❎ 다음 시간이 지나야 포인트를 지급 받을 수 있습니다... **(${getDuraction} 남음)**`)
    await client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: +5000 } })
    await client.database.updateMember(message.guild.id, message.author.id, { $set: { attendacneTime: Date.now() } })
    const getMemberData = await client.database.getMember(message.guild.id, message.author.id)
    await message.channel.send(`✅ 오늘 하루 출석하여, **5000 포인트**를 지급 받았어요!\n> 총 포인트: **${getMemberData.point} 포인트**`)
  }
}
