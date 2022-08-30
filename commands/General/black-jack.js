const BlackJack = require('discord-blackjack')
const Discord = require('discord.js')

module.exports = {
  name: '블랙잭',
  aliases: ['blackjack', 'qmfforwor'],
  category: 'General',
  permissions: () => ({
    result: true,
    name: 'Everyone'
  }),
  // Use module - https://www.npmjs.com/package/discord-blackjack
  run: async ({ client, message, args, data: { getGuild, prefix } }) => {
    const key = args[0]
    const allowChId = getGuild.GamblingChannel
    const filter = (allowChId === 'null' || !allowChId || allowChId === undefined) ? true : message.channel.id === allowChId
    if (!filter) {
      await message.delete()
      return message.channel.send(`❎ 해당 명령어는 ${message.guild.channels.cache.get(allowChId)} 에서만 가능합니다.`).then(msg => msg.delete({ timeout: 2000 }))
    }
    const getMemberData = await client.database.getMember(message.guild.id, message.author.id)
    const MyPoint = getMemberData.point 
    const BaseEmbed = new Discord.MessageEmbed()
    .setColor(client.utils.compressed.highestColor(message.guild.me))
    .setTitle('블랙잭 게임')
    .addFields(
      [
        {
          name: `${message.author.username} 님의 덱`,
          value: '카드들: {yourcontent}\n점수: **{yvalue}**',
          inline: true
        },
        {
          name: '딜러 님의 덱',
          value: '카드들: {dcontent}\n점수: **{dvalue}**',
          inline: true
        }
      ]
      )
      .setFooter('E 또는 End 를 입력하여, 게임을 종료할 수 있습니다.')

      if (!key) {
        const Embed = new Discord.MessageEmbed()
        .setColor(client.utils.compressed.highestColor(message.guild.me))
        .setTitle('블랙잭 도움말')
        .addFields(
          [
            {
              name: `명령어: ${prefix}블랙잭 올인`,
              value: `모든 Point를 걸고 블랙잭을 함.`,
              inline: false
            },
            {
              name: `명령어: ${prefix}블랙잭 <배팅금(금액)>`,
              value: '<배팅금(금액)> 만 걸고 블랙잭을 함.',
              inline: false
            },
            {
              name: `게임 방법`,
              value: '1. 명령어를 입력한다.\n2. "h" 또는 "s"로 카드를 받거나 멈춘다.\n재밌게한다.',
              inline: false
            }
          ]
          )
          .setFooter('문의: 나를위한소녀#1793')
          await message.delete()
          await message.channel.send(Embed).then(msg => msg.delete({ timeout: 10000 }))
        } else if (key === '올인' || key === MyPoint) {
          const bat = getMemberData.point
          if (bat < 1000) {
            await message.delete()
            message.channel.send('블랙잭 최소 참여 배팅금은 **`1000포인트`**입니다.').then(msg => msg.delete({ timeout: 4000 }))
            return
           }
           client.database.updateMember(message.guild.id, message.author.id, { $set: { point: Number(0) } })
        const game = await BlackJack(message, client, { buttons: false, resultEmbed: false, normalEmbed: false, normalEmbedContent: BaseEmbed })
      await allresultEmbed( client, message, game, bat )
      } else if (key === '연습') {
        const game = await BlackJack(message, client, { buttons: false, resultEmbed: false, normalEmbed: false, normalEmbedContent: BaseEmbed })
        await practiceEmbed( client, message, game )  
      } else if(key !== '올인' && key !== '연습' && !isNaN(key)) {
        const bat = key
        if (isNaN(bat)) {
          await message.delete()
          message.channel.send('```명령어: '+`${prefix}블랙잭 올인`+'``````명령어: '+`${prefix}블랙잭 <배팅금(숫자)>`+'```').then(msg => msg.delete({ timeout: 4000 }))
          return 
        }
        if (!Number(bat)) {
          await message.delete()
          message.channel.send('```명령어: '+`${prefix}블랙잭 올인`+'``````명령어: '+`${prefix}블랙잭 <배팅금(숫자)>`+'```').then(msg => msg.delete({ timeout: 4000 }))
          return 
        }
        if (MyPoint < Number(bat)) {
          await message.delete()
          message.channel.send('❎ 배팅금이 보유 포인트를 초과하셨습니다.').then(msg => msg.delete({ timeout: 4000 }))
          return  
        }
        if (Number(bat) < 1000) {
          await message.delete()
          message.channel.send('블랙잭 최소 참여 배팅금은 **`1000포인트`**입니다.').then(msg => msg.delete({ timeout: 4000 }))
          return
        }
        client.database.updateMember(message.guild.id, message.author.id, { $set: { point: MyPoint - bat } })
            const game = await BlackJack(message, client, { buttons: false, resultEmbed: false, normalEmbed: false, normalEmbedContent: BaseEmbed })
        await resultEmbed( client, message, game, bat )
      }
    }
}
async function battingResult (client, message, bat, result) {
  const getMemberData = await client.database.getMember(message.guild.id, message.author.id)
  const mypoint = getMemberData.point
  switch (result) {
    case 'Win':
      client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: +(Number(bat)*2) } })
      return mypoint + (Number(bat)*2)
    case 'Lose': return mypoint
    case 'Tie': 
      client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: + Number(bat)} })
      return mypoint+Number(bat)
    case 'Double Win':
      client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: +(Number(bat)*3) } })
      return mypoint+(Number(bat)*3)
    case 'Double Lose':
      client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: - Number(bat) } })
      return mypoint-(Number(bat))
    case 'Timeout': return mypoint
  }
}



async function resultEmbed ( client, message, game, bat ) {
  const BaseEmbed = new Discord.MessageEmbed()
  .setColor(client.utils.compressed.highestColor(message.guild.me))
  const batResult = await battingResult(client, message, bat, game.result)
  switch (game.result) {
    case 'Win':
      BaseEmbed.setTitle('당신이 이겼습니다!')
      .addFields(
        [
          {
            name: `${message.author.username} 님의 덱`,
            value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
            inline: true
          },
          {
            name: '딜러 님의 덱',
            value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
            inline: true
          },
          {
            name: '배팅금',
            value: `**${bat}포인트**.`,
            inline: false
          }
        ]
        )
        .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
        message.channel.send(BaseEmbed)
        break
        
        case 'Lose':
          BaseEmbed.setTitle('당신이 졌습니다...')
          .addFields(
            [
              {
                name: `${message.author.username} 님의 덱`,
                value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
                inline: true
              },
              {
                name: '딜러 님의 덱',
                value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
                inline: true
              },
              {
                name: '배팅금',
                value: `**${bat}포인트**.`,
                inline: false
              }
            ]
            )
            .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
            .setTimestamp()
            message.channel.send(BaseEmbed)
            break
            
            case 'Tie':
              BaseEmbed.setTitle('동점입니다!')
              .addFields(
                [
                  {
                    name: `${message.author.username} 님의 덱`,
                    value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
                    inline: true
                  },
                  {
                    name: '딜러 님의 덱',
                    value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
                    inline: true
                  },
                  {
                    name: '배팅금',
                    value: `**${bat}포인트**.`,
                    inline: false
                  }
                ]
                )
                .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
                .setTimestamp()
                message.channel.send(BaseEmbed)
                break
                
                case 'Double Win':
                  BaseEmbed.setTitle('두배로 승리하였습니다!')
                  .addFields(
                    [
                      {
                        name: `${message.author.username} 님의 덱`,
                        value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
                        inline: true
                      },
                      {
                        name: '딜러 님의 덱',
                        value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
                        inline: true
                      },
                      {
                        name: '배팅금',
                        value: `**${bat}포인트**.`,
                        inline: false
                      }
                    ]
                    )
                    .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
                    .setTimestamp()
                    message.channel.send(BaseEmbed)
                    break
                    
                    case 'Double Lose':
                      BaseEmbed.setTitle('두배로 지셨습니다...')
                      .addFields(
                        [
                          {
                            name: `${message.author.username} 님의 덱`,
                            value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
                            inline: true
                          },
                          {
                            name: '딜러 님의 덱',
                            value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
                            inline: true
                          },
                          {
                            name: '배팅금',
                            value: `**${bat}포인트**.`,
                            inline: false
                          }
                        ]
                        )
                        .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
                        .setTimestamp()
                        message.channel.send(BaseEmbed)
                        break
                        
                        case 'Cancel':
                          BaseEmbed.setTitle('게임을 취소하였습니다!')
                          message.channel.send(BaseEmbed)
                          break
                          
                          case 'Timeout':
                            BaseEmbed.setTitle('게임 시간이 초과되었습니다!')
                            .addFields(
                              [
                                {
                                  name: '배팅금',
                                  value: `**${bat}포인트**.`,
                                  inline: true
                                }
                              ]
                              )
                              .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
                              .setTimestamp()
                              message.channel.send(BaseEmbed)
                              break
                              
                              default:
                                BaseEmbed.setTitle(game.result)
                                message.channel.send(BaseEmbed)
                                break
                              }
}
                            
async function allbattingResult (client, message, bat, result) {
                            switch (result) {
                                case 'Win':
                                  client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: +(Number(bat)*3) } })
                                  return Number(bat)*3
                                case 'Lose': return 0
                                case 'Tie': 
                                  client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: + Number(bat)} })
                                  return Number(bat)
                                case 'Double Win':
                                  client.database.updateMember(message.guild.id, message.author.id, { $inc: { point: +(Number(bat)*5) } })
                                  return Number(bat)*5
                                case 'Double Lose': return 0
                                case 'Timeout': return 0
                              }
}

async function allresultEmbed ( client, message, game, bat ) {
                              const BaseEmbed = new Discord.MessageEmbed()
                              .setColor(client.utils.compressed.highestColor(message.guild.me))
                              const batResult = await allbattingResult(client, message, bat, game.result)
                              const getMemberData = await client.database.getMember(message.guild.id, message.author.id)
                              const mypoint = getMemberData.point + Number(bat)
                              switch (game.result) {
                                case 'Win':
                                  BaseEmbed.setTitle('당신이 이겼습니다!')
                                  .addFields(
                                    [
                                      {
                                        name: `${message.author.username} 님의 덱`,
                                        value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
                                        inline: true
                                      },
                                      {
                                        name: '딜러 님의 덱',
                                        value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
                                        inline: true
                                      },
                                      {
                                        name: '결과',
              value: `${bat}포인트 **3배**`,
              inline: false
            }
          ]
        )
        .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Lose':
      BaseEmbed.setTitle('당신이 졌습니다...')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            },
            {
              name: '결과',
              value: `${bat}}포인트 **0배**`,
              inline: false
            }
          ]
        )
        .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Tie':
      BaseEmbed.setTitle('동점입니다!')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            },
            {
              name: '결과',
              value: `${bat}}포인트 유지..`,
              inline: false
            }
          ]
        )
        .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Double Win':
      BaseEmbed.setTitle('두배로 승리하였습니다!')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            },
            {
              name: '결과',
              value: `${bat}포인트 **5배**.`,
              inline: false
            }
          ]
        )
        .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Double Lose':
      BaseEmbed.setTitle('두배로 지셨습니다...')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            },
            {
              name: '결과',
              value: `${bat}포인트 **0배**.`,
              inline: false
            }
          ]
        )
        .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Cancel':
      BaseEmbed.setTitle('게임을 취소하였습니다!')
      message.channel.send(BaseEmbed)
      break

    case 'Timeout':
      BaseEmbed.setTitle('게임 시간이 초과되었습니다!')
      .addFields(
        [
            {
              name: '결과',
              value: `${bat}포인트 차감..`,
              inline: true
            }
          ]
        )
        .setFooter(`보유 포인트: ${batResult}포인트 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    default:
      BaseEmbed.setTitle(game.result)
      message.channel.send(BaseEmbed)
      break
  }
}


async function practiceEmbed ( client, message, game ) {
  const getMemberData = await client.database.getMember(message.guild.id, message.author.id)
  const mypoint = getMemberData.point
  const BaseEmbed = new Discord.MessageEmbed()
    .setColor(client.utils.compressed.highestColor(message.guild.me))

    switch (game.result) {
    case 'Win':
      BaseEmbed.setTitle('당신이 이겼습니다!')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            }
          ]
        )
        .setFooter(`보유 포인트: **${mypoint}포인트** 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Lose':
      BaseEmbed.setTitle('당신이 졌습니다...')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            }
          ]
        )
        .setFooter(`보유 포인트: **${mypoint}포인트** 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Tie':
      BaseEmbed.setTitle('동점입니다!')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            }
          ]
        )
        .setFooter(`보유 포인트: **${mypoint}포인트** 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Double Win':
      BaseEmbed.setTitle('두배로 승리하였습니다!')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            }
          ]
        )
        .setFooter(`보유 포인트: **${mypoint}포인트** 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Double Lose':
      BaseEmbed.setTitle('두배로 지셨습니다...')
        .addFields(
          [
            {
              name: `${message.author.username} 님의 덱`,
              value: `카드들: ${game.ycontent}\n점수: **${game.yvalue}**`,
              inline: true
            },
            {
              name: '딜러 님의 덱',
              value: `카드들: ${game.dcontent}\n점수: **${game.dvalue}**`,
              inline: true
            }
          ]
        )
        .setFooter(`보유 포인트: **${mypoint}포인트** 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    case 'Cancel':
      BaseEmbed.setTitle('게임을 취소하였습니다!')
      message.channel.send(BaseEmbed)
      break

    case 'Timeout':
      BaseEmbed.setTitle('게임 시간이 초과되었습니다!')
        .setFooter(`보유 포인트: **${mypoint}포인트** 보유중`, 'https://cdn.discordapp.com/attachments/882637515075498026/887712259571326996/1_00000.png')
        .setTimestamp()
      message.channel.send(BaseEmbed)
      break

    default:
      BaseEmbed.setTitle(game.result)
      message.channel.send(BaseEmbed)
      break
  }
}
