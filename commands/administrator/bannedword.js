const { MessageEmbed } = require('discord.js')

module.exports = {
    name: '금지어',
    aliases: ['rmawldj'],
    category: 'Administrator',
    permissions: (client, member) => ({
      result: client._options.bot.owners.includes(member.id) || member.permissions.has('ADMINISTRATOR'),
      name: 'Administrator'
    }),
    run: async ({ client, args, message, data: { getBannedword, prefix } }) => {
        await message.delete()
        const FArg = args[0]
        const bannedword12 = args.slice(1).join(' ')
        // if(!FArg === "추가" || !FArg === "cnrk" || !FArg === "제거" || !FArg === "wprj" || !FArg === "삭제" || !FArg === "tkrwp") return //message.channel.send(`❎ ${prefix}금지어 추가 <단어> or ${prefix}금지어 삭제 <단어>}`).then(msg => msg.delete({ timeout: 5000 }))
        if(FArg === "추가" || FArg === "cnrk" || FArg === "등록" || FArg === "등록") {
            // if (!getBannedword.BanWord.filter(el => el.serverID === message.guiild.id)) return message.channel.send(`❎ **${prefix}금지어**를 입력 후! 다시 요청해주세요!`)
            const getBan = getBannedword.BanWord.filter(el=>el.ServerID === message.guild.id)
          const selectBannedWord = getBan[0] || {
            ServerID: message.guild.id,
            count: 0,
           Word: []
          }
          const Word = selectBannedWord.Word
          const WordOX = Word.indexOf(bannedword12)
            if(!bannedword12) return message.channel.send('❎ 추가할 금지어를 작성해주세요.').then(msg => msg.delete({ timeout: 10000 }))
            if ( WordOX >= 0) return message.channel.send('❎ 이미 등록된 금지어 입니다.').then(msg => msg.delete({ timeout: 10000 }))
            const Embed = new MessageEmbed()
              .setColor(message.guild.me.roles.highest.color)
              .setTitle('📋 금지어')
              .setDescription(`금지어: **${bannedword12}**`)
            const m = await message.channel.send('⏳ 해당 금지어를 등록하시겠습니까?', { embed: Embed })
            await m.react('✅')
            try {
              const collector = await m.awaitReactions((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, { max: 1, time: 15000, errors: ['time'] })
              const collected = collector.first()
              if (collected.emoji.name === '✅') {
                try { await m.reactions.removeAll() } catch {}
                // const getBannedwords = getBannedword.BanWord.filter(el => el.serverID === message.guild.id).Word.split(",").length
                  // const getItem = getGuild.items.filter(el => el.itemName === replaceItemName && el.pointPrice === Number(price))
                Word.push(String(bannedword12))

                if (getBan.length === 1) {
                  await client.database.mongo.collection('bannedword').updateOne({ _id: message.guild.id, 'BanWord.ServerID':  selectBannedWord.ServerID}, {
                    $set: {
                      'BanWord.$': {
                        ServerID: message.guild.id,
                        count: Number(selectBannedWord.count) + 1,
                        Word
                      }
                    }
                  })
                } else await client.database.updateBannedword(message.guild.id, { $push: { BanWord: {ServerID: message.guild.id, count: 1, Word }}})
                
                const getBannedworddData = await client.database.getBannedword(message.guild.id)
                const getUpdateItem = getBannedworddData.BanWord.filter(el => el.ServerID === selectBannedWord.ServerID)[0] || { count: 1 }
                const Embed = new MessageEmbed()
                  .setColor(message.guild.me.roles.highest.color)
                  .setTitle('✅ 금지어 등록')
                  .setDescription(`금지어 이름: **${bannedword12}**\n금지어 갯수: **${getUpdateItem.count}개**`)
                await m.edit('✅ 성공적으로 금지어를 등록하였습니다!', { embed: Embed }).then(msg => msg.delete({ timeout: 4000 }))
              }
            } catch (e) {
              await m.delete()
              await message.channel.send('❎ 시간이 초과되었습니다!').then(msg => msg.delete({ timeout: 4000 }))
              if (client.debug) message.channel.send(e.stack, { code: 'js' })
            }
        
        }
        else if(FArg === "제거" || FArg === "wprj" || FArg === "삭제" || FArg === "tkrwp") {
          const selectBannedWord = getBannedword.BanWord.filter(el=>el.ServerID === message.guild.id)[0]
          const Word = selectBannedWord.Word
          const WordOX = Word.indexOf(bannedword12)
            if(!bannedword12) return message.channel.send('❎ 삭제할 금지어를 작성해주세요.').then(msg => msg.delete({ timeout: 10000 }))
            if (selectBannedWord?.count === 0 || !selectBannedWord) return message.channel.send('❎ 저장된 금지어가 없습니다.').then(msg => msg.delete({ timeout: 10000 }))
            if (WordOX === -1) return message.channel.send('❎ `' +bannedword12+'` 금지어가 없습니다').then(msg => msg.delete({ timeout: 10000 }))
            
            const Embed = new MessageEmbed()
            .setColor(message.guild.me.roles.highest.color)
            .setTitle('📋 금지어')
            .setDescription(`금지어: **${bannedword12}**`)
            const m = await message.channel.send('⏳ 해당 금지어를 제거(삭제)하시겠습니까?', { embed: Embed })
            await m.react('✅')
            try {
              const collector = await m.awaitReactions((reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, { max: 1, time: 15000, errors: ['time'] })
              const collected = collector.first()
              if (collected.emoji.name === '✅') {
                try { await m.reactions.removeAll() } catch {}
                await client.database.mongo.collection('bannedword').updateOne({ _id: message.guild.id, 'BanWord.ServerID':  message.guild.id }, {
                  $set: {
                    'BanWord.$': {
                      ServerID: message.guild.id,
                      count: Number(selectBannedWord.count) - 1, 
                      Word: Word.filter(el => el !== String(bannedword12))
                    } 
                  } 
                })
                
                const getBannedworddData = await client.database.getBannedword(message.guild.id)
                const filters = getBannedworddData.BanWord.filter(el => el.ServerID === message.guild.id)[0]
                const Embed = new MessageEmbed()
                  .setColor(message.guild.me.roles.highest.color)
                  .setDescription(`금지어 이름: **${bannedword12}**\n금지어 갯수: **${Number(filters.count)}개**`)
                await m.edit('✅ 성공적으로 금지어를 제거(삭제)하였습니다!', { embed: Embed }).then(msg => msg.delete({ timeout: 4000 }))
              }
            } catch (e) {
              await m.delete()
              await message.channel.send('❎ 시간이 초과되었습니다!').then(msg => msg.delete({ timeout: 4000 }))
              message.channel.send(e.stack, { code: 'js' })
            }
        
        }
        else if(FArg === "목록" || FArg === "list") {
            const filterWord = getBannedword.BanWord.filter(el=>el.ServerID === message.guild.id)[0].Word || []
            const filtercount = getBannedword.BanWord.filter(el=>el.ServerID === message.guild.id)[0].count
            if (filterWord.length <= 0) return message.channel.send('❎ 저장된 금지어가 없습니다.')
            let page = 0
            const chunkArray = client.utils.ArrayUtils.chunkArray(filterWord, 10)
            const msg = await message.channel.send(getEmbed(message, chunkArray, page, getBannedword, filtercount))
            if (chunkArray.length <= 1) return
            const reactionEmojis = ['◀', '❌', '▶']
            for (const emoji of reactionEmojis) await msg.react(emoji)
            // Pagination
            const pageCollector = await msg.createReactionCollector((reaction, user) => {
              const result = reactionEmojis.includes(reaction.emoji.name) && user.id === message.author.id
              if (result) reaction.users.remove(user)
              return result
            })
            pageCollector.on('collect', async (collected) => {
              const findIndexEmoji = reactionEmojis.findIndex(e => e === collected.users.reaction.emoji.name)
              switch (findIndexEmoji) {
                case 0:
                  page--
                  if (page < 0) page = chunkArray.length - 1
                  await msg.edit(getEmbed(message, chunkArray, page, getBannedword, filtercount))
                  break
        
                case 2:
                  page++
                  if (page >= chunkArray.length) page = 0
                  await msg.edit(getEmbed(message, chunkArray, page, getBannedword, filtercount))
                  break
        
                default:
                  msg.reactions.removeAll()
                  pageCollector.stop()
                  break
              }
            })
        
        }
        else return message.channel.send('```'+prefix+'금지어 추가(등록) <금지어>\n'+prefix+'삭제(제거) <금지어>\n'+prefix+'목록```').then(msg => msg.delete({ timeout: 8000 }))
      }
    }
    function getEmbed (message, BanWord, page, filtercount) {
      const count = filtercount.BanWord.filter(el=>el.ServerID === message.guild.id)[0].count
        let WordNum = 0
        const listEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        const mapping = BanWord[page]?.map(el => `**${listEmojis[WordNum++]} ${el.split(",")}**`)
        const Embed = new MessageEmbed()
          .setTitle('📋 금지어 목록')
          .setColor(message.guild.me.roles.highest.color)
          .setDescription(mapping.join('\n')+`\n\n(총 ${count} 개 등록됨)`)
          .setFooter(`페이지 ${page + 1}/${BanWord.length}`)
        return Embed
      }

  