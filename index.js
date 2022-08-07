require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Route } = require("discord-api-types/v9");
const { Client, Intents ,Collection  ,GuildScheduledEvent} = require("discord.js");
const DiscordJS = require("discord.js");
const mongoose = require('mongoose');
const profileModel = require('./profileSchema.js');
const log4js = require('log4js')

const logger = log4js.getLogger();
require('date-utils');
logger.level = 'trace';

var dt = new Date();
var formatted = dt.toFormat("YYYYMMDDHH24MISS");

log4js.configure({
    appenders : {
    system : {type : 'file', filename : formatted + '.log'}
    },
    categories : {
    default : {appenders : ['system'], level : 'trace'},
    }
});

const client = new Client({
    intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES],
})

mongoose 
    .connect(process.env.MONGOURL, {
        useNewUrlParser: true, 
    })
    .then(() => {
        console.log('データベースに接続しました');
        logger.debug('データーベースに接続しました');
    })
    .catch((error) => {
        console.error('エラー: データーベースに接続できません'); //エラー出力
        logger.error('エラー: データーベースに接続できません');
    });


client.once("ready", () => {


    console.log(process.env.BOTNAME  + " is online");
    console.log(formatted)

    const guildId = '986942977681285131'
    const guild = client.guilds.cache.get(guildId)

    
    let commands

    if (guild){
        commands = guild.commands
    } else {
        commands = client.appication?.commands

    }

    commands?.create({
        name: 'gban',
        description: 'gbanを行います',
        options:[
            {
                name: 'id',
                description: 'banしたいh人のidを指定します',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
            {

                name: 'why',
                description: '理由を入力します',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ]
    })

    commands?.create({
        name: 'gban-remove',
        description: 'gbanを解除します',
        options:[
            {
                name: 'id-remove',
                description: 'banしたいh人のidを指定します',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
            {

                name: 'why-remove',
                description: '理由を入力します',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            },
        ]
    })

    commands?.create({
        name: 'help',
        description: 'めるぷみぃぃぃいぃぃいぃ！！！！！',
    })

    commands?.create({
        name: 'join',
        description: 'よみあげるぜぇぇぇぇぇえぇぇぇぇ！！！',
    })
})

client.on('interactionCreate', async(interaction) => {
    if(!interaction.isCommand()){
        return
    }

    const { commandName, options } = interaction

    if (commandName ==='ping') {
        interaction.reply({
            content:'保存しました', 
        })
    }

    if (commandName ==='help') {
        interaction.reply({
            content:'/gban:このbotが入っている全サーバーでbanすることができます',
        })
    }

    if (commandName ==='gban'){
        const gbanId = options.getString('id')
        const reason = options.getString('why')

        client.guilds.cache.forEach(g => { // Botが参加しているすべてのサーバーで実行
            g.members.ban(options.getString('id')).catch(error => {
                if (error.code !== 403) {
                    console.error('エラーメッセージ:'+ g.name +'でbanできませんでした. ' +'ban該当ユーザー: ' + options.getString('id')+ '   実行ユーザーID: '+interaction.user.id);
                    logger.errot('エラーメッセージ:'+ g.name +'でbanできませんでした. ' +'ban該当ユーザー: ' + options.getString('id')+ '   実行ユーザーID: '+interaction.user.id);
                }
            })
        })
        
        const profile = await profileModel.create({
            use: interaction.user.id, //実行者ID
            name: options.getString('id'), //ban対象ユーザーID
            why: options.getString('why'), //banの理由
        });
        profile.save();

        console.log('データベースに保存しました: ban該当ユーザーID: ' + options.getString('id') + '   実行ユーザーID: '+ interaction.user.id); //コンソールに出力
        logger.debug('データベースに保存しました: ban該当ユーザーID: ' + options.getString('id') + '   実行ユーザーID: '+ interaction.user.id)
        interaction.reply({
            content: '実行しました',
        })
    }

    if (commandName ==='gban-remove'){
        const gbanIdremove = options.getString('id-remove')//idが一致するユーザーをデーターベースから削除
        console.log(options.getString('id-remove') + options.getString('why-remove'))
        client.guilds.cache.forEach(g => { // Botが参加しているすべてのサーバーで実行
                    g.members.unban(options.getString('id-remove')).catch(error => {
                        if (error.code !== 404) {
                            console.error('エラーメッセージ:'+ g.name +'でbanを解除できませんでした.' +'解除該当ユーザーID: ' + options.getString('id-remove') + '   実行ユーザーID: '+interaction.user.id);
                            logger.error('エラーメッセージ:'+ g.name +'でbanを解除できませんでした.' +'解除該当ユーザーID: ' + options.getString('id-remove') + '   実行ユーザーID: '+interaction.user.id)
                        }
                    })// メンバーをBAN
        })
        console.log("BAN解除に成功しました"); // 成功したらコンソールに出す
        logger.debug("BAN解除に成功しました")
        const profile = await profileModel.remove({
            name: options.getString('id-remove'), 
        })
        console.log('データベースから削除しました: 解除該当ユーザーID: ' + options.getString('id-remove')+ '   実行ユーザーID: '+interaction.user.id); //コンソールに出力
        logger.debug('データベースから削除しました: 解除該当ユーザーID: ' + options.getString('id-remove')+ '   実行ユーザーID: '+interaction.user.id)
        interaction.reply({
            content: '実行しました',
        })
    }
})


        
client.login(process.env.TOKEN)