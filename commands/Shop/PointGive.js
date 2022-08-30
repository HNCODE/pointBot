module.exports = {
  name: '강제지급',
  aliases: ['머니지급', '포인트지급'],
  category: 'Administrator',
  permissions:  (client, member) => ({
    result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
    name: 'Administrator'
  }),
  run: async ({ client, args, message, data: { getGuild, getMember } }) => {
    const allowChId = getGuild.GamblingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    await message.delete()
    const USERS = args[0]
    const money = args[1]
    if (!USERS) return message.channel.send('❎ **유저의 아이디** 또는 **유저를 언급**해주세요!').then(msg => msg.delete({ timeout: 5000 }))
    // const GetMEMBER = message.guild.members.cache.get(message.mentions.members.first() ? message.mentions.members.first().id : getFilterId(USERS))
    const GetMEMBER = message.guild.members.cache.get(message.mentions.members.first() ? message.mentions.members.first().id : getFilterId(USERS)) || await message.guild.members.fetch(message.mentions.members.first() ? message.mentions.members.first().id : getFilterId(USERS)) || getFilterId(USERS)
    if (GetMEMBER.user.bot) return
    if (!money || isNaN(money)) return message.channel.send('❎ 금액은 숫자로만 적어주세요!').then(msg => msg.delete({ timeout: 5000 }))
    // const getMembers = Object.keys(client.database.getAll()).filter(el => el.includes(message.guild.id) && client.database.getAll()[el].auth).map(el => { return { id: el, data: client.database.getAll(el) } })
    // const isMember = getMembers.filter(el => el.id.includes(getMember.id))
    await client.database.updateMember(message.guild.id, GetMEMBER.id, { $inc: { point: +Number(money) } })
    const getMemberData = await client.database.getMember(message.guild.id, GetMEMBER.id)
    await message.channel.send(`✅ ${USERS}\n> 총 포인트: **${getMemberData.point} 포인트**`)
  }
}
function getFilterId (key) { return String(key).replace(/<|#|@|&|!|>/gi, '') }
