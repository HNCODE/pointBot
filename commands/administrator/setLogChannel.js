module.exports = {
  name: 'setlogchannel',
  aliases: ['입퇴장채널', 'dlqxhlwkdcosjf'],
  category: 'Administrator',
  permissions: (client, member) => ({
    result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
    name: 'Administrator'
  }),
  run: async ({ client, args, message, data: { getGuild } }) => {
    const allowChId = getGuild.settingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const opts = args[0]
    if (!opts) return message.channel.send('❎ 채널 아이디 또는 언급을 해주세요!')
    if (opts === '없음') {
      await client.database.updateGuild(message.guild.id, { $set: { logChannel: '0' } })
      await message.channel.send('✅ 해당 입퇴장 로그채널을 **없음** 으로 설정하였습니다!')
    } else {
      const getChannel = message.guild.channels.cache.get(message.mentions.channels.first() ? message.mentions.channels.first().id : getFilterId(opts))
      if (!getChannel) return message.channel.send('❎ 해당 채널을 찾을 수 없습니다!')
      if (getChannel.type !== 'text') return message.channel.send('❎ 입퇴장 로그채널은 오로지 **텍스트 채널**이여야 합니다!')
      await client.database.updateGuild(message.guild.id, { $set: { logChannel: getChannel.id } })
      await message.channel.send(`✅ 해당 서버의 입퇴장 로그채널을 ${getChannel} 으로 설정하였습니다!`)
    }
  }
}

function getFilterId (key) { return String(key).replace(/<|#|@|&|>/gi, '') }
