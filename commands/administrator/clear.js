module.exports = {
  name: '정리',
  aliases: ['clear', 'wjdfl', '칟ㅁㄱ', '청소', 'cjdth'],
  category: 'Administrator',
  permissions: (client, member) => ({
    result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
    name: 'Administrator'
  }),
  run: async ({ message, args }) => {
    const execCountOrMentions = args[0]
    await message.delete()
    if (!execCountOrMentions) return message.channel.send('❎ 삭제할 메세지 갯수 또는 유저가 보낸 메세지를 삭제하려면 해당 유저를 언급해주세요!').then(msg => msg.delete({ timeout: 4000 }))
    const filter = getFilterId(execCountOrMentions)
    if (filter.result) {
      console.log(filter.id)
      const getMember = message.guild.members.cache.get(filter.id)
      if (!getMember) return message.channel.send('❎ 해당 유저를 찾을 수 없습니다!').then(msg => msg.delete({ timeout: 4000 }))
      const getMessages = message.channel.messages.cache.filter(el => el.author.id === getMember.id)
      try {
        const deleteMessages = await message.channel.bulkDelete(getMessages, true)
        await message.channel.send(`🗑 해당 채널에서 ${getMember} 님의 메세지 **${deleteMessages.size} 개**를 정리하였어요!`).then(msg => msg.delete({ timeout: 4000 }))
      } catch (e) {
        message.channel.send('⚠ 권한이 부족하여 메세지를 정리할 수 없어요!').then(msg => msg.delete({ timeout: 4000 }))
      }
    } else {
      try {
        const deleteMessages = await message.channel.bulkDelete(execCountOrMentions, true)
        await message.channel.send(`🗑 해당 채널에서 **${deleteMessages.size} 개**의 메세지를 정리하였어요!`).then(msg => msg.delete({ timeout: 4000 }))
      } catch (e) {
        message.channel.send('⚠ 권한이 부족하여 메세지를 정리할 수 없어요!').then(msg => msg.delete({ timeout: 4000 }))
      }
    }
  }
}

function getFilterId (key) { return { id: String(key).replace(/<|#|@|&|!|>/gi, ''), result: /<|@|!|>/gi.test(key) } }
