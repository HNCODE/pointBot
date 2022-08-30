/* eslint-disable no-unused-vars */
const Discord = require('discord.js')
const child = require('child_process')
const util = require('util')
const sleep = util.promisify(setTimeout)
const moment = require('moment-timezone')
require('moment-duration-format')(moment)
moment.locale('ko-KR')

module.exports = {
  name: 'compile',
  aliases: ['eval', 'cmd'],
  category: 'BotOwner',
  permissions: (client, member) => ({
    result: client._options.bot.owners.includes(member.id),
    name: 'BotOwner'
  }),
  run: async (compressed) => {
    const { client, message, args } = compressed
    const waitReaction = await message.react('⏳')
    const codeToRun = args.join(' ')
    const startTime = getNanoSecTime()
    let endTime
    try {
      // eslint-disable-next-line no-eval
      const evalPromise = (code) => new Promise((resolve, reject) => { try { resolve(eval(`(async () => { ${code} })()`)) } catch (e) { reject(e) } })
      const result = await Promise.race([timeout(15000), evalPromise(codeToRun)])
      endTime = getNanoSecTime() - startTime
      await message.react('✅')
      await sendOver2000(util.inspect(result, { depth: 1 }), message, { code: 'js' })
    } catch (e) {
      endTime = getNanoSecTime() - startTime
      await message.react('❌')
      await sendOver2000(e.stack || e.message || e.name || e, message, { code: 'js' })
    } finally {
      await message.channel.send(`> \`Processing Time: ${endTime}ns, ${endTime / 1000000}ms\``)
      try {
        await waitReaction.remove()
      } catch {}
    }
  }
}

async function timeout (time) {
  await sleep(time)
  throw new Error('Execution Timed out.')
}

function getNanoSecTime () {
  const hrTime = process.hrtime()
  return hrTime[0] * 1000000000 + hrTime[1]
}

async function sendOver2000 (content, message, options = {}) {
  if (content.length < 1990) return message.channel.send(content, options)
  const messagesList = []
  while (content.length > 1990) {
    let index = content.lastIndexOf('\n\n', 1990)
    if (index === -1) { index = content.lastIndexOf('\n', 1990) }
    if (index === -1) { index = content.lastIndexOf(' ', 1990) }
    if (index === -1) { index = 1990 }
    messagesList.push(await message.channel.send(content.substring(0, index), options))
    content = content.substring(index).trim()
  }
  messagesList.push(await message.channel.send(content, options))
  return messagesList
}
