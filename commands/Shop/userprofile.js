const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '유저프로필',
  aliases: ['userprofile', 'dbwjvmfhvlf', 'ㅕㄴㄷㄱㅔ개랴ㅣㄷ'],
  category: 'Administrator',
  permissions:  (client, member) => ({
    result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
    name: 'Administrator'
  }),
  run: async ({ client, message, args, data: { getGuild, getMember, prefix } }) => {
    const allowChId = getGuild.GamblingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const USERS = args[0]
    if (!USERS) return message.channel.send('❎ **유저의 아이디** 또는 **유저를 언급**해주세요!').then(msg => msg.delete({ timeout: 5000 }))
    // const GetMEMBER = message.guild.members.cache.get(message.mentions.members.first() ? message.mentions.members.first().id : getFilterId(USERS))
    const GetMEMBER = message.guild.members.cache.get(message.mentions.members.first() ? message.mentions.members.first().id : getFilterId(USERS)) || message.guild.members.fetch(message.mentions.members.first() ? message.mentions.members.first().id : getFilterId(USERS)) || getFilterId(USERS)
    if (GetMEMBER.user.bot) return
    const getMemberData = await client.database.getMember(message.guild.id, GetMEMBER.id)
    const Embed = new MessageEmbed()
      .setColor('#E5D85C')
      .setAuthor(`${GetMEMBER.displayName} 님의 프로필:`, GetMEMBER.user.avatarURL({ type: 'png', dynamic: true, size: 4096 }))
      .addField('💰 보유 포인트: ', `**${getMemberData.point} 포인트** 보유중`, true)
      .addField('📋 보유 아이템: ', `**${getMemberData.items.length <= 0 ? 0 : getMemberData.items.map(el => el.quantity).reduce((prev, val) => prev + val)} 개의 아이템** 보유중`, true)
      .setFooter(`✅ ${GetMEMBER.displayName} 의 프로필입니다.`)
      // .addField('', '', false)
    message.channel.send(Embed)
  }
}
function getFilterId (key) { return String(key).replace(/<|#|@|&|!|>/gi, '') }
