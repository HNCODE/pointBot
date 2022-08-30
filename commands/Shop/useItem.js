const { MessageEmbed } = require('discord.js')
const moment = require('moment-timezone')

module.exports = {
  name: '아이템사용',
  aliases: ['useitem', 'dkdlxpatkdyd', 'ㅕㄴ댯드'],
  category: 'Shop',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, message, args, data: { getGuild, getMember } }) => {
    const allowChId = getGuild.purchaseChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 6000 }))
    }
    const owner = client._options.bot.owners
    const item = args.join(' ')
    if (!item) return message.channel.send('❎ 사용하실 아이템 이름을 입력해주세요!')
    const filterItem = getMember.items.filter(el => el.itemName === item)
    if (filterItem.length <= 0) return message.channel.send('❎ 해당 아이템을 보유하고 있지 않습니다!')
    if (filterItem.length === 1 && filterItem[0].quantity === 0) return message.channel.send('❎ 해당 아이템의 수량이 부족합니다!')
    //해당 채널에 메세지 보내기
    const sm = await message.channel.send('✅ DM 메세지로 해당 아이템 사용 내역이 전송되었습니다!')
    
    try {
      //메세지 작성자에게 보내기
      const selcetItem = filterItem[0]
      const code = selcetItem.code[selcetItem.code.length - 1]
      const AuthorEmbed = new MessageEmbed()
      .setColor(message.guild.me.roles.highest.color)
      .setTitle('📋 아이템 사용')
      .setDescription(`아이템 이름: **${selcetItem.itemName}**\n남은 수량: **${selcetItem.quantity - 1}**\n아이템 코드: **${code}**`)
      const QP = await message.author.send('✅ 해당 아이템 사용처리가 완료되었습니다!', { embed: AuthorEmbed })
      selcetItem.code.splice(selcetItem.code.length - 1)
      await client.database.mongo.collection('member').updateOne({ _id: `${message.guild.id}-${message.author.id}`, 'items.itemName': selcetItem.itemName }, {
        $set: {
          'items.$': {
            itemName: selcetItem.itemName,
            quantity: Number(selcetItem.quantity - 1),
            code: selcetItem.code
          }
        }
      })
      //owner에게 dm보내기
      owner.forEach(async (entry) => {
        const ABC = new MessageEmbed()
        .setColor(message.guild.me.roles.highest.color)
        .setTitle('📋 아이템 사용')
        .setDescription(`닉네임: ${message.author.username} | 태그: ${message.author.tag}`)
        .addField('아이템 이름', `**${selcetItem.itemName}**`, true)
        .addField('남은 수량', `**${selcetItem.quantity - 1}**`, true)
        .addField('아이템 코드', `**${code}**`, true)
        .setFooter(`${moment(Date.now()).format('YYYY.MM.DD / HH:mm:ss')}`)
        const DMM = await client.users.cache.get(entry).send(ABC)
        const emojis = ['✅']
        for (const emoji of emojis) await DMM.react(emoji)
        const DMMCollector = await DMM.awaitReactions((reaction) => emojis.includes(reaction.emoji.name), { max: 1, errors: ['time'] })
        const DMMCollected = DMMCollector.first()
        if (DMMCollected.emoji.name === '✅') {
          try { await DMM.reactions.removeAll() } catch (e) {}
          await DMM.delete()
          await QP.delete()
          
          const MES = new MessageEmbed()
          .setColor(message.guild.me.roles.highest.color)
          .setTitle(`✅ **${selcetItem.itemName}**`)
          .setDescription(`${message.member}님의 **아이템**을 성공적으로 **지급**하셨습니다.`)
          .setFooter(`${moment(Date.now()).format('YYYY.MM.DD / HH:mm:ss')}`)
          
          await sm.edit(MES)
        }
      })
    } catch (e) {
      message.channel.send('❎ 원할한 사용을 위하여, DM 메세지 전송을 허용해주세요!')
    }
  }
}
