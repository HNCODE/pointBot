const Discord =require('discord.js')
const { MessageEmbed } = require('discord.js')
const Utils = require('./utils')
const settings = require('./settings')
const path = require('path')
const moment = require('moment-timezone')
require('moment-duration-format')(moment)
const client = new Discord.Client({ ws: { intents: Discord.Intents.ALL } })

const { DiscordTogether } = require('discord-together')
client.discordTogether = new DiscordTogether(client)

client._options = settings
client.utils = Utils
client.logger = new Utils.Logger(client)
client.database = new Utils.Database(client)
client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.globAsync = require('util').promisify(require('glob'))
client.wait = require('util').promisify(setTimeout)
client.commands_loaded = false
client.models_loaded = false
client.isReady = false
client.reload = async function () {
  await loadCommands()
  for (const util of await client.globAsync(path.join(process.cwd(), 'src/utils/**/*.js'))) delete require.cache[require.resolve(util)]
  delete require.cache[require.resolve('./settings')]
  delete require.cache[require.resolve('./utils')]
  client._options = require('./settings')
  const { Database } = require('./utils')
  client.database = new Database(client)
  client.utils = require('./utils')
  await client.database.loadModels(true)
}

const run = () => (async () => {
  await loadCommands()
  await client.database.init()
  await client.login(settings.bot.token)
  return client
})()

client.on('ready', async () => {
  client.logger.info(`[준비됨] 봇이 준비되었습니다! (${client.user.tag}(${client.user.id}))`)
  let num = 0
  const games = [
    { name: '문의: 나를위한소녀#1793', type: 'WATCHING' }
  ]
  client.user.setActivity({ name: 'SinBot ON!', type: 'WATCHING' })
  setInterval(() => {
    if (num > games.length - 1) num = 0
    const getObj = games[num]
    client.user.setActivity(getObj)
    num++
    client.logger.debug(`[SETACTIVITY] Set Activity to (Name: ${getObj.name} | Type: ${getObj.type}${getObj.url ? ` | Url: ${getObj.url}` : ''})`)
  }, 5500)

  client.isReady = true
  const guilds = await client.database.models.Guild.find()
  for (const guildData of guilds) {
    if (guildData.memberSizeLogCh !== '0') {
      client.logger.debug(`[Log:SetChannelName:Interval] Set Channel Name interval is ready to ${guildData._id}`)
      client.memberSizeLogging = setInterval(async () => client.setChannelName(client, guildData._id), 60000)
    }
  }
})

client.setChannelName = async (guildId) => {
  if (!guildId) throw new Error('guildId is not provided!')
  const getGuildData = await client.database.getGuild(guildId)
  const getGuild = client.guilds.cache.get(guildId)
  if (!getGuild) throw new Error('guild is not found')
  const getChannel = getGuild?.channels?.cache?.get(getGuildData.memberSizeLogCh)
  if (!getGuild) throw new Error('channel is not found')
  const memberCount = getGuild.members.cache.filter(el => !el.user.bot).size
  if (!getChannel) {
    const getUser = client.users.cache.get(getGuild.ownerID)
    try {
      await getUser.send(`❎ ${getGuild.name} 서버의 멤버 수 기록 로그 채널을 찾을 수 없어, 기록이 중단되었습니다.`)
    } catch (e) {
      client.logger.error(`[MemberSizeLogging:Error] Not found channel to ${getGuild.id}, Error message send an error to ${getUser.id} (${e.name})`)
    }
    return setInterval(client.memberSizeLogging)
  }
  client.logger.info(`[Log:SetChannelName:Interval] Set Channe Name to ${getGuildData._id} & LogChannelId: ${getGuildData.logChannel}, memberCount: ${memberCount}`)
  getChannel.setName(`멤버 수: ${memberCount}명`)
}
client.on('guildMemberAdd', async (member, message) => {
  const guildData = await client.database.getGuild(member.guild.id)
  if (guildData?.enableLog) {
  const getChannel = client.channels.cache.get(guildData?.logChannel)
  try {
    const ABC = new Discord.MessageEmbed()
    .setColor('#FFE400')
    .setTitle(`${member.guild.name}`)
    .setDescription(`${member} 님, 오신걸 환영합니다!`)
    .addField('※꼭! 읽어주십시요!※', `<#887952516321513522>, <#887727707285225493>, <#895102168955256873>\n\n---`)
    .addField('\n\n🎧음성채널 생성', '명령어<#887727707285225493>\n\n<#887727516536680469>카테고리에 있는 `🚪방만들기`에 참여하면 자동으로 \n<#887727517367148555>카테고리에 음성채널과 채팅채널이 생성됩니다.\n\n---', true)
    .addField('\n\n🎧음성채널 참여', `명령어<#887727707285225493>\n\n<#887727517367148555>카테고리에 있는 음성채널 중 원하시는 채널에 입장하시면 됩니다.(방이 잠겼으면 참여 불가입니다.)\n\n---`, true)
    .addField('\n\n🎳게임 및 상점', `명령어<#895102168955256873>\n\n${member.guild.channels.cache.get(guildData?.GamblingChannel)}에서 출석하거나 게임해서 포인트를 벌고 그포인트로 ${member.guild.channels.cache.get(guildData?.shopChannel)}에서 아이템을 구매하신 후 사용하시면 됩니다.\n---`)
    .setFooter('문의: 관리자', 'https://cdn.discordapp.com/attachments/930843897293324348/931157529210273852/1_1_1.gif')
    if (getChannel === '0' || !getChannel){
        await member.send(ABC)
      } else {
        let ranNum = Math.floor(Math.random() * 6 + 1);
        if (ranNum == 1) {
        await getChannel.send(`${member.user} 님, ${member.guild.name}에 오신걸 환영합니다!`)
        }
        if (ranNum == 2) {
          await getChannel.send(`${member.guild.name}에 ${member.user}님이 들어오셨습니다!`)
          }
          if (ranNum == 3) {
            await getChannel.send(`${member.user} 님 반갑습니다!`)
            }
            if (ranNum == 4) {
              await getChannel.send(`${member.user} 님 잘오셨습니다~`)
              }
              if (ranNum == 5) {
                await getChannel.send(`${member.user} 님이 굴러들어왔습니다!`)
              }
              if (ranNum == 6) {
                await getChannel.send(`${member.user} 님 ${member.guild.name}의 룰을 꼭! 지켜주세요!`)
              }                                                                      
              await member.send(ABC)
            }
          } catch (e) {
            client.logger.error(`[Event:GuildMemberAdd] [${member.guild.id}] Send log message an error! (${e.name})`)
          }
        }
      })
      
      client.on('message', async (message) => {
        if (message.author.bot) return
  const OR = settings.bot.owners
  if (message.channel.type === 'dm') {
    OR.forEach(async (entry) => {
      const ABC = new Discord.MessageEmbed()
      .setColor('#FFE400')
      .setTitle('- 봇 DM 내용 -')
      .setDescription(`${message.content}`)
      .addField('보낸이', `닉네임: ${message.author.username} | 태그: ${message.author.tag}`)
      .setFooter(`${moment(Date.now()).format('YYYY.MM.DD / HH:mm:ss')}`)
      const DMM = await client.users.cache.get(entry).send(ABC)
      const emojis = ['✅']
      for (const emoji of emojis) await DMM.react(emoji)
      const DMMCollector = await DMM.awaitReactions((reaction) => emojis.includes(reaction.emoji.name), { max: 1, errors: ['time'] })
      const DMMCollected = DMMCollector.first()
      if (DMMCollected.emoji.name === '✅') {
        try { await DMM.reactions.removeAll() } catch (e) {}
        await DMM.delete()
      }
    })
  }
  if (message.channel.type === 'dm' || message.author.bot || message.system) return
  const getUser = await client.database.getUser(message.author.id)
  const getMember = await client.database.getMember(message.guild.id, message.author.id)
  const getGuild = await client.database.getGuild(message.guild.id)
  const getBannedword = await client.database.getBannedword(message.guild.id)
  const { prefix } = client._options.bot
  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  const Command = client.commands.get(command) || client.commands.get(client.aliases.get(command))
  const getBanChannel = client.channels.cache.get(getGuild?.BannedWordLogChannel)

  const words = await getBannedword.BanWord.filter(el=>el.ServerID === message.guild.id)[0]?.Word
  // console.log(String(words).split(","))
  let foundInText = false;
  for (var i in words) {
    if(message.content.toLowerCase().includes(words[i].toLowerCase())) {

      const Embed = new MessageEmbed()
      .setTitle('🚫금지어 감지!')
      .setColor(message.guild.me.roles.highest.color)
      .addFields(
        { name: "누가?",value: `${message.author} || ${message.author.tag}`,inline: false },
        { name: "메시지 내용:",value: `${message.content}`,inline: false },
        { name: "금지어",value: `${words[i]}`,inline: false }
      )

      if(getBanChannel === "0"||!getBanChannel) {
message.channel.send('🚫금지어: `'+words[i]+'` 감지!'+`${message.author}`).then(msg => msg.delete({ timeout: 4000 }))
      } else {
        message.channel.send('🚫금지어: `'+words[i]+'` 감지!'+`${message.author}`).then(msg => msg.delete({ timeout: 4000 }))
        getBanChannel.send({embed: Embed})
      }
      foundInText = true; 
    }
  }

  if(foundInText) {
        await message.delete()
  }


  if (message.content.startsWith(prefix) && Command) {
    if (message.member.useShop) return message.channel.send('❎ 현재 다른 구매 작업이 진행 중 입니다! 해당 작업을 먼저 마무리 해주세요!')
    if (!client._options.bot.owners.includes(message.author.id) && getUser.ban) {
      await message.delete()
      try {
        await message.author.send(`❌ ${message.author} 님은 해당 봇을 사용할 수 없습니다!\n\`사유: ${getUser.reason || '사유 없음'}\``)
      } catch (e) {
        client.logger.error(`[Message:banUser] Send DM an Error!\n(${e.stack})`)
      }
      return false
    }
    if (message.channel.type === 'dm') return message.channel.send('❎ Commands are not available on **DM** Channels!')
    const checkPerm = Command.permissions(client, message.member)
    if (!checkPerm.result) return message.channel.send(`❎ 해당 명령어를 사용하려면, 다음 권한이 필요합니다! **(${checkPerm.name})**`)
    try {
      client.logger.debug(`[Event:Message] Execute Command... (Member: ${message.guild.id}-${message.author.id}) (Command: ${Command.name})`)
      await Command.run({ client, message, args, data: { prefix, getUser, getGuild, getMember, getBannedword } })
    } catch (e) {
      client.logger.error(e.stack)
      await message.channel.send(`❌ 이런...! 알 수 없는 오류가 발생하였어요! **(오류 이름: ${e.name})**`)
    }
  }
})

client.on('message', async (message) => {
  const { prefix } = client._options.bot
  if(message.content == `${prefix}유튜브`||message.content == `${prefix}youtube`){
    const channel = message.member.voice.channel
    if(!channel) return message.reply("음성채널에 접속해주세요!")
    client.discordTogether.createTogetherCode(channel.id, 'youtube').then(invite => {
      return message.channel.send(invite.code)
    })
  }
})


process.on('uncaughtException', error => client.logger.error(`[uncaughtException] ${error.stack || error}`))
process.on('unhandledRejection', (reason, promise) => client.logger.error(`[unhandledRejection] ${reason.stack || reason}`))

module.exports = run()

async function loadCommands () {
  const ReloadOrLoad = `${client.commands_loaded ? '리로드' : '로드'}`
  client.logger.debug(`[명령어:${ReloadOrLoad}] 명령어 ${ReloadOrLoad}중...`)

  const loadCmds = await client.globAsync(path.join(process.cwd(), 'src/commands/**/*.js'))
  client.logger.info(`[명령어:${ReloadOrLoad}] ${ReloadOrLoad}된 명령어들: ${loadCmds.length}`)
  client.logger.info(`[명령어:${ReloadOrLoad}] 명령어들: (${loadCmds.join(' | ')})`)

  for (const cmd of loadCmds) {
    const command = require(cmd)

    client.logger.debug(`[명령어:${ReloadOrLoad}] 명령어 설정: (${command.name})`)

    for (const aliases of command.aliases) {
      client.logger.debug(`[명령어:${ReloadOrLoad}] 명령어 단축키 설정: (${aliases}) 을 ${command.name}에 설정.`)
      client.aliases.set(aliases, command.name)
    }
    delete require.cache[require.resolve(cmd)]
    client.commands.set(command.name, command)
  }
  client.logger.info(`[명령어:${ReloadOrLoad}] 모든 명령어가 ${ReloadOrLoad} 되었습니다!`)
  client.commands_loaded = true
  return client.commands
}
