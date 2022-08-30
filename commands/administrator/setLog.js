module.exports = {
  name: 'setlog',
  aliases: ['입퇴장', 'dlqxhlwkd'],
  category: 'Administrator',
  permissions: (client, member) => ({
    result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
    name: 'Administrator'
  }),
  run: async ({ client, message, data: { getGuild, prefix } }) => {
    const allowChId = getGuild.settingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const result = !getGuild.enableLog
    // if (getGuild?.logChannel === '0' && result) return message.channel.send(`❎ 입퇴장 채널을 설정해주세요! \`'${prefix}입퇴장채널' 명령어를 통하여 설정할 수 있습니다.\``)
    await client.database.updateGuild(message.guild.id, { $set: { enableLog: result } })
    await message.channel.send(`✅ 입퇴장 로그가 **${result ? '활성화' : '비활성화'}** 되었습니다!`)
  }
}
