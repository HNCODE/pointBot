const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '아이템제거',
  aliases: ['removeitem', 'dkdlxpawprj', 'ㄱ드ㅐㅍ댯드'],
  category: 'Shop',
  permissions: (client, member) => ({
    result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
    name: 'Administrator'
  }),
  run: async ({ client, message, args, data: { getGuild } }) => {
    const allowChId = getGuild.shopChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const item = args.join(' ')
    if (!item) return message.channel.send('❎ 제거하실 아이템의 이름을 입력해주세요!')
    const replaceItemName = item.replace(/-/g, ' ')
    const filterItem = getGuild.items.filter(el => String(el.itemName).includes(replaceItemName))
    if (filterItem.length <= 0) return message.channel.send('❎ 해당 아이템은 존재하지 않습니다!')
    let mm
    if (filterItem.length > 1) {
      let page = 0
      const chunkArray = client.utils.ArrayUtils.chunkArray(filterItem, 5)
      const msg = await message.channel.send(getEmbed(message, chunkArray, page))
      mm = msg
      if (chunkArray.length <= 0) return
      const reactionEmojis = ['◀', '❌', '▶']
      const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
      if (chunkArray.length === 1) for (const emoji of numberEmojis.slice(0, chunkArray[0].length)) await msg.react(emoji)
      else for (const emoji of numberEmojis) await msg.react(emoji)
      if (chunkArray.length !== 1) for (const emoji of reactionEmojis) await msg.react(emoji)
      // Selector
      const collector = await msg.createReactionCollector((reaction, user) => numberEmojis.includes(reaction.emoji.name) && user.id === message.author.id, { max: 1 })
      collector.on('collect', async (collected) => {
        const findIndexEmoji = numberEmojis.findIndex(el => el === collected.users.reaction.emoji.name)
        const selectItem = chunkArray[page][findIndexEmoji]
        if (!selectItem) {
          message.channel.send(`❎ 해당 **(${findIndexEmoji + 1} 번)**의 아이템이 존재하지 않습니다!`)
          return collector
        }
        const Embed = new MessageEmbed()
          .setColor(message.guild.me.roles.highest.color)
          .setTitle('📋 아이템 제거')
          .setDescription(`아이템 이름: **${selectItem.itemName}**\n아이템 가격: **${selectItem.pointPrice} 포인트**\n아이템 수량: **${selectItem.quantity} 개**`)
        const m = await message.channel.send('⏳ 해당 아이템을 상점 목록에서 제거하시겠습니까?', { embed: Embed })
        await msg.delete()
        await m.react('✅')
        try {
          const collector = await m.awaitReactions((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, { max: 1, time: 15000, errors: ['time'] })
          const collected = collector.first()
          if (collected.emoji.name === '✅') {
            await m.reactions.removeAll()
            await client.database.mongo.collection('guild').updateOne({ _id: message.guild.id, 'items.itemName': selectItem.itemName }, { $pull: { items: { itemName: selectItem.itemName, pointPrice: selectItem.pointPrice } } })
            const Embed = new MessageEmbed()
              .setColor(message.guild.me.roles.highest.color)
              .setTitle('✅ 아이템 제거')
              .setDescription(`아이템 이름: **${replaceItemName}**\n아이템 가격: **${selectItem.pointPrice} 포인트**\n아이템 수량: **${selectItem.quantity} 개**`)
            await m.edit('✅ 성공적으로 아이템을 제거하였습니다!', { embed: Embed })
          }
        } catch (e) {
          await m.delete()
          await message.channel.send('❎ 시간이 초과되었습니다!')
        }
      })
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
      const selectItem = filterItem[0]
      const Embed = new MessageEmbed()
        .setColor(message.guild.me.roles.highest.color)
        .setTitle('📋 아이템 제거')
        .setDescription(`아이템 이름: **${selectItem.itemName}**\n아이템 가격: **${selectItem.pointPrice} 포인트**\n아이템 수량: **${selectItem.quantity} 개**`)
      const m = await message.channel.send('⏳ 해당 아이템을 상점 목록에서 제거하시겠습니까?', { embed: Embed })
      await m.react('✅')
      try {
        const collector = await m.awaitReactions((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, { max: 1, time: 15000, errors: ['time'] })
        const collected = collector.first()
        if (collected.emoji.name === '✅') {
          await m.reactions.removeAll()
          await client.database.mongo.collection('guild').updateOne({ _id: message.guild.id, 'items.itemName': selectItem.itemName }, { $pull: { items: { itemName: selectItem.itemName } } })
          const Embed = new MessageEmbed()
            .setColor(message.guild.me.roles.highest.color)
            .setTitle('✅ 아이템 제거')
            .setDescription(`아이템 이름: **${replaceItemName}**\n아이템 가격: **${selectItem.pointPrice} 포인트**\n아이템 수량: **${selectItem.quantity} 개**`)
          await m.edit('✅ 성공적으로 아이템을 제거하였습니다!', { embed: Embed })
        }
      } catch (e) {
        await mm.delete()
        await m.delete()
        await message.channel.send('❎ 시간이 초과되었습니다!')
        if (client.debug) message.channel.send(e.stack, { code: 'js' })
      }
    }
  }
}

function getEmbed (message, items, page) {
  let itemNum = 0
  const listEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
  const mapping = items[page].map(el => `**${listEmojis[itemNum++]} ${el.itemName}** (${el.pointPrice} 포인트) \`(${el.quantity} 개 남음)\``)
  const Embed = new MessageEmbed()
    .setTitle('📋 아이템 목록')
    .setColor(message.guild.me.roles.highest.color)
    .setDescription(mapping.join('\n'))
    .setFooter(`페이지 ${page + 1}/${items.length}`)
  return Embed
}
