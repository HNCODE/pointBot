const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '개표',
  aliases: ['votecounting', 'rovy', '팻ㄷ채ㅕㅜ샤ㅜㅎ'],
  category: 'Utils',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, message, args }) => {
    const opts = args[0]
    if (!opts || opts.length === 0) return message.channel.send('❎ 개표할 투표 아이디를 입력해주세요!')
    const getMessage = message.channel.messages.cache.filter(el => el.embeds.length !== 0 && el.embeds?.[0]?.footer?.text?.includes(opts))?.first()
    if (!getMessage) return message.channel.send('❎ 해당 아이디를 가진 투표를 찾을 수 없습니다!')
    let string = `${getMessage.embeds[0].description}\n\n**투표 결과**\n`
    for (const item of getMessage.reactions.cache.array()) {
      const userSize = item.users.cache.filter(el => !el.bot).size
      string += `${item._emoji.name} \`${userSize} 표\` `
    }
    const Embed = new MessageEmbed()
      .setDescription(string)
    await message.channel.send(getMessage.content, { embed: Embed })
    await getMessage.reactions.removeAll()
  }
}
