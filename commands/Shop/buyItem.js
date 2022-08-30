const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '아이템구매',
  aliases: ['buyitem', '구매', 'buy', 'rnao', 'ㅠㅕㅛ', 'dkdlxparnao', 'ㅠㅕㅛㅑㅅ드'],
  category: 'Shop',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, message, args, data: { getGuild, getMember } }) => {
    const item = args.join(' ')
    const allowChId = getGuild.shopChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    if (!item) return message.channel.send('❎ 구매할 아이템을 입력해주세요!')
    const filterItem = getGuild.items.filter(el => String(el.itemName).includes(item) && el.quantity !== 0)
    if (filterItem.length <= 0) return message.channel.send('❎ 해당 아이템은 존재하지 않거나, 수량이 존재하지 않습니다!')
    if (filterItem.length > 1) {
      let page = 0
      const chunkArray = client.utils.ArrayUtils.chunkArray(filterItem, 5)
      const msg = await message.channel.send(getEmbed(message, chunkArray, page))
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
        if (selectItem.pointPrice > getMember.point) return message.channel.send(`❎ 해당 아이템을 구매하기 위해선 **${selectItem.pointPrice - getMember.point} 포인트**가 더 필요합니다!`)
        const Embed = new MessageEmbed()
          .setColor(message.guild.me.roles.highest.color)
          .setTitle('📋 아이템 구매')
          .setDescription(`아이템 이름: **${selectItem.itemName}**\n아이템 가격: **${selectItem.pointPrice} 포인트**\n구매 후 남은 포인트: **${getMember.point - selectItem.pointPrice} 포인트**\n\`구매하시려면 ✅ 이모지에 반응해주세요.\``)
        const m = await message.channel.send(Embed)
        await msg.delete()
        message.member.useShop = true
        await m.react('✅')
        try {
          const collector = await m.awaitReactions((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, { max: 1, time: 15000, errors: ['time'] })
          const collected = collector.first()
          if (collected.emoji.name === '✅') {
            await m.reactions.removeAll()
            const getMemberData = await client.database.getMember(message.guild.id, message.author.id)
            const getItem = getMemberData.items.filter(el => el.itemName === selectItem.itemName)
            selectItem.code.splice(selectItem.code.length - 1)
            if (getItem.length >= 1) {
              await client.database.mongo.collection('member').updateOne({ _id: `${message.guild.id}-${message.author.id}`, 'items.itemName': selectItem.itemName }, { $inc: { 'items.$.quantity': +1 } })
              await client.database.mongo.collection('member').updateOne({ _id: `${message.guild.id}-${message.author.id}`, 'items.itemName': selectItem.itemName }, { $push: { 'items.$.code': selectItem.code[selectItem.code.length - 1] || '코드가 존재하지 않습니다, 관리자에게 문의해주세요!' } })
            } else {
              await client.database.updateMember(message.guild.id, message.author.id, { $push: { items: { itemName: selectItem.itemName, quantity: 1 } } })
            }
            await client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: -selectItem.pointPrice } })
            await client.database.mongo.collection('guild').updateOne({ _id: message.guild.id, 'items.itemName': selectItem.itemName }, {
              $set: {
                'items.$': {
                  itemName: selectItem.itemName,
                  pointPrice: Number(selectItem.pointPrice),
                  quantity: Number(selectItem.quantity) - 1,
                  code: selectItem.code
                }
              }
            })
            const success = new MessageEmbed()
              .setColor(message.guild.me.roles.highest.color)
              .setTitle('✅ 구매 완료')
              .setDescription(`아이템 이름: **${selectItem.itemName}**\n아이템 가격: **${selectItem.pointPrice} 포인트**\n남은 아이템 수량: **${selectItem.quantity - 1} 개**\n보유 포인트: **${getMember.point - selectItem.pointPrice} 포인트**`)
            await m.edit(success)
            message.member.useShop = false
          }
        } catch (e) {
          message.member.useShop = false
          await m.delete()
          await message.channel.send('❎ 시간이 초과되었습니다!')
          if (client.debug) message.channel.send(e.stack, { code: 'js' })
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
      if (selectItem.pointPrice > getMember.point) return message.channel.send(`❎ 해당 아이템을 구매하기 위해선 **${selectItem.pointPrice - getMember.point} 포인트**가 더 필요합니다!`)
      const Embed = new MessageEmbed()
        .setColor(message.guild.me.roles.highest.color)
        .setTitle('📋 아이템 구매')
        .setDescription(`아이템 이름: **${selectItem.itemName}**\n아이템 가격: **${selectItem.pointPrice} 포인트**\n구매 후 남은 포인트: **${getMember.point - selectItem.pointPrice} 포인트**\n\`구매하시려면 ✅ 이모지에 반응해주세요.\``)
      const m = await message.channel.send(Embed)
      message.member.useShop = true
      await m.react('✅')
      try {
        const collector = await m.awaitReactions((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, { max: 1, time: 15000, errors: ['time'] })
        const collected = collector.first()
        if (collected.emoji.name === '✅') {
          await m.reactions.removeAll()
          const getMemberData = await client.database.getMember(message.guild.id, message.author.id)
          const getItem = getMemberData.items.filter(el => el.itemName === selectItem.itemName)
          if (getItem.length >= 1) {
            await client.database.mongo.collection('member').updateOne({ _id: `${message.guild.id}-${message.author.id}`, 'items.itemName': selectItem.itemName }, { $inc: { 'items.$.quantity': +1 } })
            await client.database.mongo.collection('member').updateOne({ _id: `${message.guild.id}-${message.author.id}`, 'items.itemName': selectItem.itemName }, { $push: { 'items.$.code': selectItem.code[selectItem.code.length - 1] || '코드가 존재하지 않습니다, 관리자에게 문의해주세요!' } })
          } else {
            await client.database.updateMember(message.guild.id, message.author.id, { $push: { items: { itemName: selectItem.itemName, quantity: 1, code: [selectItem.code[selectItem.code.length - 1]] } } })
          }
          await client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: -selectItem.pointPrice } })
          selectItem.code.splice(selectItem.code.length - 1)
          await client.database.mongo.collection('guild').updateOne({ _id: message.guild.id, 'items.itemName': selectItem.itemName }, {
            $set: {
              'items.$': {
                itemName: selectItem.itemName,
                pointPrice: Number(selectItem.pointPrice),
                quantity: Number(selectItem.quantity) - 1,
                code: selectItem.code
              }
            }
          })
          const success = new MessageEmbed()
            .setColor(message.guild.me.roles.highest.color)
            .setTitle('✅ 구매 완료')
            .setDescription(`아이템 이름: **${selectItem.itemName}**\n아이템 가격: **${selectItem.pointPrice} 포인트**\n남은 아이템 수량: **${selectItem.quantity - 1} 개**\n보유 포인트: **${getMember.point - selectItem.pointPrice} 포인트**`)
          await m.edit(success)
          message.member.useShop = false
        }
      } catch (e) {
        message.member.useShop = false
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
