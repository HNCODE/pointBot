const sleep = require('util').promisify(setTimeout)

module.exports = {
  name: 'reload',
  aliases: ['리로드', 'flfhem'],
  category: 'BotOwner',
  permissions: (client, member) => ({
    result: client._options.bot.owners.includes(member.id),
    name: 'BotOwner'
  }),
  run: async ({ client, message }) => {
    const msg = await message.channel.send('⏳ 리로드 중입니다...')
    try {
      await client.reload()
      await sleep(1000)
      await msg.edit('✅ 리로드를 완료하였습니다!')
    } catch (e) {
      await msg.edit(`❎ 리로드 하는 도중, 에러가 발생하였습니다! **(${e.name})**`)
    }
  }
}
