const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '설정',
  aliases: ['tjfwjd'],
  category: 'Administrator',
  permissions: (client, member) => ({
    result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
    name: 'Administrator'
  }),
  run: async ({ client, args, message, data: { getGuild, prefix } }) => {
    const command = args[0]
    const key = args[1]
    if (!command) {
      const Embed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle(`${message.guild.name} 의 설정들`)
        .addFields([
          {
            name: '채널설정',
            value: `🔒 봇 설정 채널: ${getGuild.settingChannel ? `<#${getGuild.settingChannel}>` : '**없음**'}\n🔒 상점채널: ${getGuild.shopChannel ? `<#${getGuild.shopChannel}>` : '**없음**'}\n🔒 아이템이용채널: ${getGuild.useChannel ? `<#${getGuild.useChannel}>` : '**없음**'}\n🔒 게임채널: ${getGuild.GamblingChannel ? `<#${getGuild.GamblingChannel}>` : '**없음**'}\n`,
            inline: true
          }
        ])
        .setFooter(`${prefix}설정 <봇설정채널|상점채널|이용채널> 으로 설정할 수 있습니다!`)
      message.channel.send(Embed)
    } else if (command === '봇설정채널') {
      if (!key) return message.channel.send('❎ 채널 아이디 또는 언급을 해주세요!')
      if (key === '없음') {
        await client.database.updateGuild(message.guild.id, { $set: { settingChannel: '0' } })
        await message.channel.send('✅ 해당 봇설정채널을 **없음** 으로 설정하였습니다!')
      } else {
        const getChannel = message.guild.channels.cache.get(message.mentions.channels.first() ? message.mentions.channels.first().id : getFilterId(key))
        if (!getChannel) return message.channel.send('❎ 해당 채널을 찾을 수 없습니다!')
        if (getChannel.type !== 'text') return message.channel.send('❎ 봇설정채널은 오로지 **텍스트 채널**이여야 합니다!')
        await client.database.updateGuild(message.guild.id, { $set: { settingChannel: getChannel.id } })
        await message.channel.send(`✅ 해당 서버의 봇설정채널을 ${getChannel} 으로 설정하였습니다!`)
      }
    } else if (command === '상점채널') {
      if (!key) return message.channel.send('❎ 채널 아이디 또는 언급을 해주세요!')
      if (key === '없음') {
        await client.database.updateGuild(message.guild.id, { $set: { shopChannel: '0' } })
        await message.channel.send('✅ 해당 상점채널을 **없음** 으로 설정하였습니다!')
      } else {
        const getChannel = message.guild.channels.cache.get(message.mentions.channels.first() ? message.mentions.channels.first().id : getFilterId(key))
        if (!getChannel) return message.channel.send('❎ 해당 채널을 찾을 수 없습니다!')
        if (getChannel.type !== 'text') return message.channel.send('❎ 상점채널은 오로지 **텍스트 채널**이여야 합니다!')
        await client.database.updateGuild(message.guild.id, { $set: { shopChannel: getChannel.id } })
        await message.channel.send(`✅ 해당 서버의 상점채널을 ${getChannel} 으로 설정하였습니다!`)
      }
    } else if (command === '이용채널') {
      if (!key) return message.channel.send('❎ 채널 아이디 또는 언급을 해주세요!')
      if (key === '없음') {
        await client.database.updateGuild(message.guild.id, { $set: { useChannel: '0' } })
        await message.channel.send('✅ 해당 이용채널을 **없음** 으로 설정하였습니다!')
      } else {
        const getChannel = message.guild.channels.cache.get(message.mentions.channels.first() ? message.mentions.channels.first().id : getFilterId(key))
        if (!getChannel) return message.channel.send('❎ 해당 채널을 찾을 수 없습니다!')
        if (getChannel.type !== 'text') return message.channel.send('❎ 이용채널은 오로지 **텍스트 채널**이여야 합니다!')
        await client.database.updateGuild(message.guild.id, { $set: { useChannel: getChannel.id } })
        await message.channel.send(`✅ 해당 서버의 이용채널을 ${getChannel} 으로 설정하였습니다!`)
      }
    } else if (command === '게임채널') {
      if (!key) return message.channel.send('❎ 채널 아이디 또는 언급을 해주세요!')
      if (key === '없음') {
        await client.database.updateGuild(message.guild.id, { $set: { GamblingChannel: '0' } })
        await message.channel.send('✅ 해당 게임채널을 **없음** 으로 설정하였습니다!')
      } else {
        const getChannel = message.guild.channels.cache.get(message.mentions.channels.first() ? message.mentions.channels.first().id : getFilterId(key))
        if (!getChannel) return message.channel.send('❎ 해당 채널을 찾을 수 없습니다!')
        if (getChannel.type !== 'text') return message.channel.send('❎ 게임채널은 오로지 **텍스트 채널**이여야 합니다!')
        await client.database.updateGuild(message.guild.id, { $set: { GamblingChannel: getChannel.id } })
        await message.channel.send(`✅ 해당 서버의 게임채널을 ${getChannel} 으로 설정하였습니다!`)
      }
    }
  }
}

function getFilterId (key) { return String(key).replace(/<|#|@|&|>/gi, '') }
