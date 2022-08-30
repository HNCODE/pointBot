const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '명령어',
  aliases: ['commands', 'audfuddj', '채ㅡㅡ뭉ㄴ'],
  category: 'General',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, message }) => {
    const options = {
      List: client.commands.map(el => el.category).reduce((prev, val) => prev.includes(val) ? prev : [...prev, val], []),
      Convert: (emoji = false) => emoji ? { ADMINISTRATOR: '🔧 관리자', GENERAL: '👤 일반', SHOP: '🏰 상점', BOTOWNER: '🔨 개발자' } : { ADMINISTRATOR: '관리자', GENERAL: '일반', SHOP: '상점', BOTOWNER: '개발자' }
    }
    const Embed = new MessageEmbed()
      .setColor('#5CD1E5')
      .setTitle(`${client.user.username} 봇의 명령어`)
    for (const key of options.List) {
      const Commands = client.commands.filter(el => String(el.category).toLowerCase() === String(key).toLowerCase())
      let string = ''
      for (const cmd of Commands.array()) {
        string += `\`${cmd.name}<${cmd.aliases[0]}>\`, `
      }
      Embed.addField(options.Convert(true)[String(key).toUpperCase()], Commands.keyArray().length <= 0 ? '`명령어가 존재하지 않습니다`' : string)
    }
    message.channel.send(Embed)
  }
}
