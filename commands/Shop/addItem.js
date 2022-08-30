const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '아이템등록',
  aliases: ['additem', 'dkdlxpaemdfhr', 'ㅁㅇ얏드'],
  category: 'Shop',
  permissions: (client, member) => ({
    result: true,
    name: 'Administrator'
  }),
  run: async ({ client, message, args, data: { getGuild, prefix } }) => {
    const item = args[0]
    const price = args[1]
    // const quantity = args[2]
    const content = args.slice(2).join(' ')
    const allowChId = getGuild.shopChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      if (content && price) {
        await message.delete()
        return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
      }
    }
    if (!item) {
      await message.delete()
      await message.channel.send('❎ 등록하실 아이템명을 입력해주세요! <아이템명의 띄어쓰기는"-"> \n```작성된 명령어: ' + `${prefix}아이템등록 ${item} ${price} ${content}` + '```').then(msg => msg.delete({ timeout: 4000 }))
      return
    }
    if (!price) {
      await message.delete()
      await message.channel.send('❎ 아이템의 가격을 입력해주세요! <아이템명의 띄어쓰기는"-">\n```작성된 명령어: ' + `${prefix}아이템등록 ${item} ${price} ${content}` + '```').then(msg => msg.delete({ timeout: 4000 }))
      return
    }
    // if (!quantity) return message.channel.send('❎ 아이템의 수량을 입력해주세요!')
    if (isNaN(price) || price.includes('-') || price.includes('.')) {
      await message.delete()
      await message.channel.send('❎ 아이템의 가격은 오로지 정수로만 가능합니다! <아이템명의 띄어쓰기는"-">\n```작성된 명령어: ' + `${prefix}아이템등록 ${item} ${price} ${content}` + '```').then(msg => msg.delete({ timeout: 4000 }))
      return
    }
    // if (isNaN(quantity) || quantity.includes('-') || quantity.includes('.')) return message.channel.send('❎ 아이템의 수량은 오로지 정수로만 가능합니다!')
    if (!content) {
      await message.delete()
      await message.channel.send('❎ 아이템의 상품 코드를 적어주세요! 만약 상품 코드가 없을 경우 사용법을 적어주세요! <아이템명의 띄어쓰기는"-">\n```작성된 명령어: ' + `${prefix}아이템등록 ${item} ${price} ${content}` + '```').then(msg => msg.delete({ timeout: 4000 }))
      return
    }
    const replaceItemName = item.replace(/-/g, ' ')
    const Embed = new MessageEmbed()
      .setColor(message.guild.me.roles.highest.color)
      .setTitle('📋 아이템 등록')
      .setDescription(`아이템 이름: **${replaceItemName}**\n아이템 가격: **${price} 포인트**\n아이템 코드: **||${content}||**`)
    const m = await message.channel.send('⏳ 해당 아이템을 상점 목록에 등록하시겠습니까?', { embed: Embed })
    await message.delete()
    await m.react('✅')
    try {
      const collector = await m.awaitReactions((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, { max: 1, time: 15000, errors: ['time'] })
      const collected = collector.first()
      if (collected.emoji.name === '✅') {
        try { await m.reactions.removeAll() } catch {}
        const getItem = getGuild.items.filter(el => el.itemName === replaceItemName && el.pointPrice === Number(price))
        const selectItem = getItem[0] || {
          itemName: item,
          pointPrice: Number(price),
          quantity: 0,
          code: []
        }
        const code = selectItem.code
        code.push(content)
        if (getItem.length >= 1) {
          await client.database.mongo.collection('guild').updateOne({ _id: message.guild.id, 'items.itemName': selectItem.itemName }, {
            $set: {
              'items.$': {
                itemName: selectItem.itemName,
                pointPrice: Number(selectItem.pointPrice),
                quantity: Number(selectItem.quantity) + 1,
                code
              }
            }
          })
        } else await client.database.updateGuild(message.guild.id, { $push: { items: { itemName: replaceItemName, pointPrice: Number(price), quantity: 1, code } } })
        const getGuildData = await client.database.getGuild(message.guild.id)
        const getUpdateItem = getGuildData.items.filter(el => el.itemName === selectItem.itemName&&el.pointPrice === selectItem.pointPrice)[0] || { quantity: 1 }
        console.log(getUpdateItem)
        console.log(getUpdateItem.quantity)
        const Embed = new MessageEmbed()
          .setColor(message.guild.me.roles.highest.color)
          .setTitle('✅ 아이템 등록')
          .setDescription(`아이템 이름: **${replaceItemName}**\n아이템 가격: **${price} 포인트**\n상점에 등록된 아이템 수량: **${getUpdateItem.quantity} 개**\n아이템 코드: ||비공개||`)
        await m.edit('✅ 성공적으로 아이템을 등록하였습니다!', { embed: Embed })
      }
    } catch (e) {
      await m.delete()
      await message.channel.send('❎ 시간이 초과되었습니다!')
      if (client.debug) message.channel.send(e.stack, { code: 'js' })
    }
  }
}
