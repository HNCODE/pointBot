const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '보유아이템',
  aliases: ['retaineditem', 'qhdbdkdlxpa', 'ㄱㄷㅅ먀ㅜㄷ얏드'],
  category: 'Shop',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, message, data: { getGuild, getMember } }) => {
    const allowChId = getGuild.shopChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const filterItem = getMember.items.filter(el => el.quantity !== 0)
    if (filterItem.length <= 0) return message.channel.send('❎ 보유하고 있는 아이템이 존재하지 않습니다!')
    let page = 0
    const chunkArray = client.utils.ArrayUtils.chunkArray(filterItem, 5)
    const msg = await message.channel.send(getEmbed(message, chunkArray, page))
    if (chunkArray.length <= 1) return
    const reactionEmojis = ['◀', '❌', '▶']
    for (const emoji of reactionEmojis) await msg.react(emoji)
    // Pagination
    const pageCollector = await msg.createReactionCollector((reaction, user) => {
      const result = reactionEmojis.includes(reaction.emoji.name) && user.id === message.author.id
      if (result) reaction.users.remove(user)
      return result
    })
    pageCollector.on('collect', async (collected) => {
      const findIndexEmoji = reactionEmojis.findIndex(e => e === collected.users.reaction.emoji.name)
      switch (findIndexEmoji) {
        case 0:
          page--
          if (page < 0) page = chunkArray.length - 1
          await msg.edit(getEmbed(message, chunkArray, page))
          break

        case 2:
          page++
          if (page >= chunkArray.length) page = 0
          await msg.edit(getEmbed(message, chunkArray, page))
          break

        default:
          msg.reactions.removeAll()
          pageCollector.stop()
          break
      }
    })
  }
}

function getEmbed (message, items, page) {
  let itemNum = 0
  const listEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
  const mapping = items[page].map(el => `**${listEmojis[itemNum++]} ${el.itemName}** \`(${el.quantity} 개 남음)\``)
  const Embed = new MessageEmbed()
    .setTitle('📋 보유 아이템 목록')
    .setColor(message.guild.me.roles.highest.color)
    .setDescription(mapping.join('\n'))
    .setFooter(`페이지 ${page + 1}/${items.length}`)
  return Embed
}
