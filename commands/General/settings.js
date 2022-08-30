const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '채널설정',
  aliases: ['cosjftjfwjd'],
  category: 'Administrator',
  permissions: (client, member) => ({
    result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
    name: 'Administrator'
  }),
  run: async ({ message, data: { getGuild } }) => {
    const allowChId = getGuild.settingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const serverSettings = [
      `**입퇴장 설정**: ${getGuild?.enableLog ? '활성화' : '비활성화'}`,
      `**입퇴장 채널**: ${getGuild?.logChannel === '0' ? '없음' : message.guild.channels.cache.get(getGuild.logChannel) ?? '알 수 없음'}`,
      `**유저인원 채널**: ${getGuild?.memberSizeLogCh === '0' ? '없음' : message.guild.channels.cache.get(getGuild.memberSizeLogCh) ?? '알 수 없음'}`
    ]

    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .addField('🎁 상점', `**상점 아이템 갯수**: ${getGuild?.items?.length ?? 0}개`, true)
      .addField('📝 서버 설정', serverSettings.join('\n'), true)
    message.channel.send(`🔧 **${message.guild.name} 설정들**`, { embed })
  }
}
