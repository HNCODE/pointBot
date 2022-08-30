const { MessageEmbed } = require('discord.js')

module.exports = {
  name: '투표',
  aliases: ['vote', 'xnvy', '팻ㄷ'],
  category: 'Utils',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  run: async ({ client, message, args }) => {
    const title = args[0]
    if (!title || title.length === 0) return message.channel.send('❎ 투표 제목을 입력해주세요! `(띄어쓰기는 _ 으로 가능합니다)`')
    const items = args.slice(1).join(' ').split(',').map(el => el.trim())
    if (!items || items.length === 0) return message.channel.send('❎ 투표 아이템들을 적어주세요!')
    if (items.filter(el => el.length !== 0).length > 10) return message.channel.send('❎ 투표 아이템은 **최대 10개** 까지 가능합니다!')
    const keyCode = client.utils.compressed.genKeyCode()
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
    const reactEmojis = []
    let count = 0
    let string = ''
    const Embed = new MessageEmbed()
      .setColor(client.utils.compressed.highestColor(message.guild.me))
      .setFooter(`ID: ${keyCode}`)
    for (const item of items) {
      if (item.length !== 0) {
        string += `${emojis[count]} ${item.replace(/_/gi, ' ')}\n`
        reactEmojis.push(emojis[count])
        count++
      }
    }
    Embed.setDescription(string)
    const msg = await message.channel.send(`>>> 📊 ${title.replace(/_/gi, ' ')}`, { embed: Embed })
    reactEmojis.map(el => msg.react(el))
  }
}
