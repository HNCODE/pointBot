const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '상점',
  aliases: ['shop', 'tkdwja', '놰ㅔ'],
  category: 'Shop',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, message, args, data: { getGuild } }) => {
    const allowChId = getGuild.shopChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const item = args[0]
    if (item) {
      const filterItem = getGuild.items.filter(el => String(el.itemName).includes(item) && el.quantity !== 0)
      if (filterItem.length <= 0) return message.channel.send('❎ 해당 아이템은 존재하지 않거나, 수량이 존재하지 않습니다!')
      if (filterItem.length > 1) {
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
      } else {
        return// message.channel.send(getEmbed(message, filterItem, 0))
      }
    } else {
      const filterItem = getGuild?.items?.filter(el => el.quantity !== 0) || []
      if (filterItem.length <= 0) return message.channel.send('❎ 상점에 아이템이 존재하지 않습니다!')
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
}

function getEmbed (message, items, page) {
  let itemNum = 0
  const listEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
  const mapping = items[page]?.map(el => `**${listEmojis[itemNum++]} ${el.itemName}** (${el.pointPrice} 포인트) \`(${el.quantity} 개 남음)\``)??'❎ 상점에 아이템이 없습니다.'
  const Embed = new MessageEmbed()
    .setTitle('📋 아이템 목록')
    .setColor(message.guild.me.roles.highest.color)
    .setDescription(mapping.join('\n'))
    .setFooter(`페이지 ${page + 1}/${items.length}`)
  return Embed
}
