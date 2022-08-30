const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '프로필',
  aliases: ['profile', 'vmfhvlf', 'ㅔ개랴ㅣㄷ'],
  category: 'General',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ message, data: { getGuild, getMember, prefix } }) => {
    const allowChId = getGuild.GamblingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const Embed = new MessageEmbed()
      .setColor('#E5D85C')
      .setAuthor(`${message.author.tag} 님의 프로필:`, message.author.avatarURL({ type: 'png', dynamic: true, size: 4096 }))
      .addField('💰 보유 포인트: ', `**${getMember.point} 포인트** 보유중`, true)
      .addField('📋 보유 아이템: ', `**${getMember.items.length <= 0 ? 0 : getMember.items.map(el => el.quantity).reduce((prev, val) => prev + val)} 개의 아이템** 보유중`, true)
      .setFooter(`자신이 보유한 아이템을 보시려면, ${prefix}보유아이템 명령어를 사용해주세요.`)
      // .addField('', '', false)
    message.channel.send(Embed)
  }
}
