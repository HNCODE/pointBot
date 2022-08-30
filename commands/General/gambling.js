const moment = require('moment-timezone')
require('moment-duration-format')(moment)
const sleep = require('util').promisify(setTimeout)
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '도박',
  aliases: ['ehqkr', 'gambling', 'ㅎ므ㅠㅣㅑㅜㅎ'],
  category: 'General',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, args, message, data: { getGuild } }) => {
    const gamble = args[0]
    const getMemberData = await client.database.getMember(message.guild.id, message.author.id)
    const allowChId = getGuild.GamblingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const lepoint = await client.database.getMember(message.guild.id, message.author.id)
    if (gamble === '로또' || gamble === '올인') {
      if (getMemberData.point <= 0) return message.channel.send(`❎ ${message.author.tag} `+'님은 `0포인트` 이하이므로 참여 불가!\n💰보유 포인트: '+`${getMemberData.point}포인트 `).then(msg => msg.delete({ timeout: 5000 }))
      // let percent = Math.floor(Math.random() * 13);
      const chances = ['win', 'lose', 'lose1', 'lose2', 'lose3', 'lose4', 'lose5', 'lose6']
      const pick = chances[Math.floor(Math.random() * chances.length)]
      const msg = await message.channel.send(`🎰| **${getMemberData.point} 포인트` + ' **올인!! (**``25%``**의 확률!!)\n성공시 포인트 **``20배``** | 실패시 **``0포인트(파산)``**')
      if (pick === 'win') {
        // const POINT = getMemberData.point*percent
        const POINT = getMemberData.point * 40
        await client.database.updateMember(message.guild.id, message.author.id, { $set: { point: Number(POINT) } })
        await sleep(2000)
        const getMembepoint = await client.database.getMember(message.guild.id, message.author.id)
        
        const Embed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('🎰 **올인 or 로또**')
        .setDescription('📍 결과: **``성공``**')
        .addField('📋 배팅금액 ', `**${lepoint.point} 포인트** - 올인!`)
        .addField('📊 확률! ', '12.5%', true)
        .addField('💰 로또 or 올인 배수 ', '40배', true)
        .addField('💰 총 자산 ', `**${getMembepoint.point} 포인트**`)
        .setFooter('문의: 관리자', 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
        
        await sleep(600)
        await msg.delete()
        await message.channel.send(Embed)
      } else if (pick === 'lose' || pick === 'lose1' || pick === 'lose2' || pick === 'lose3' || pick === 'lose4' || pick === 'lose5' || pick === 'lose6') {
        await client.database.updateMember(message.guild.id, message.author.id, { $set: { point: Number(0) } })
        await sleep(2000)
        const getMembepoint = await client.database.getMember(message.guild.id, message.author.id)
        
        const Embed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('🎰 **올인 or 로또**')
        .setDescription('📍 결과: **``실패``**')
        .addField('📋 배팅금액 ', `**${lepoint.point} 포인트** - 올인!`)
        .addField('📊 확률! ', '12.5%', true)
        .addField('💰 로또 or 올인 배수: ', '0배', true)
        .addField('💰 총 자산 ', `**${getMembepoint.point} 포인트**`)
        .setFooter('문의: 관리자', 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
        
        await sleep(600)
        await msg.delete()
        await message.channel.send(Embed)
      }
    } else {
      if (Number(gamble) <= 0) return message.channel.send('❎ (음수(0)배팅 불가!)').then(msg => msg.delete({ timeout: 5000 }))
      if (!Number(gamble)) return message.channel.send('❎ 숫자로 배팅해주세요!').then(msg => msg.delete({ timeout: 5000 }))
      if (gamble > getMemberData.point / (3/5)) {
        await message.delete()
        message.channel.send('```명령어: !도박 <금액>```' + `위 명령어는 현제 가지고 있는 포인트\n즉! **${getMemberData.point}포인트**의 **60%**까지만 사용가능합니다.\n` + '**```사용가능 금액: ' + `${getMemberData.point / (3/5)}포인트` + '```**').then(msg => msg.delete({ timeout: 5000 }))
        return
      }
      if (Number(gamble)) {
        const percent = Math.floor(Math.random() * 3) + 1
        const mynuse = Math.floor(Math.random() * 1) + 1
        const chances = ['win', 'win1', 'win2', 'lose', 'lose1', 'lose2', 'lose3', 'lose4']
        const pick = chances[Math.floor(Math.random() * chances.length)]
        const msg = await message.channel.send(`🎰| **${getMemberData.point} 포인트**중 **${gamble} 포인트**를 사용하셨습니다.\n` + '```과연 결과는...```')
        if (pick === 'win' || pick === 'win1' || pick === 'win2') {
          const POINT = getMemberData.point - gamble
          const POIN = gamble * percent
          await client.database.updateMember(message.guild.id, message.author.id, { $set: { point: Number(POINT + POIN) } })
          await sleep(2000)
          const getMembepoint = await client.database.getMember(message.guild.id, message.author.id)

          const Embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('🎰 **도박**')
            .setDescription('📍 결과: **``성공``**')
            .addField('📋 배팅금액 ', `**${gamble} 포인트**`, false)
            .addField('📊 배수 ', `${percent - 1}배`, false)
            .addField('💰 받은 금액 ', `${POIN - gamble}포인트`, false)
            .addField('💰 총 자산 ', '``' + `**${getMembepoint.point} 포인트**`, false)
            .setFooter('문의: 관리자', 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
            .setTimestamp()

          await sleep(600)
          await msg.edit(`🎰| **${getMemberData.point} 포인트**중 **${gamble} 포인트**를 사용하셨습니다.`)
          await message.channel.send(Embed)
        } else if (pick === 'lose' || pick === 'lose1' || pick === 'lose2' || pick === 'lose3' || pick === 'lose4') {
          const POINT1 = getMemberData.point
          const POIN = gamble * mynuse

          await client.database.updateMember(message.guild.id, message.author.id, { $set: { point: Number(POINT1 - POIN) } })
          await sleep(2000)
          const getMembepoint = await client.database.getMember(message.guild.id, message.author.id)

          const Embed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('🎰 **도박**')
            .setDescription('📍 결과: **``실패``**')
            .addField('📋 배팅금액 ', `**${gamble} 포인트**`, false)
            .addField('📊 배수 ', `${mynuse}배`, false)
            .addField('💰 차감 금액 ', `- ${POIN}`, false)
            .addField('💰 총 자산 ', '``' + `**${getMembepoint.point} 포인트**`, false)
            .setFooter('문의: 관리자', 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
            .setTimestamp()

          await sleep(600)
          await msg.edit(`🎰| **${getMemberData.point} 포인트**중 **${gamble} 포인트**를 사용하셨습니다.`)
          await message.channel.send(Embed)
        }
      }
    }
  }
}
