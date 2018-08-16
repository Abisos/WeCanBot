module.exports = {
  name: 'discordtag',
  description: 'Returns the users one and only Discordtag. (illuminati#3333)',
  aliases: ["dt", "tag"],
  usage: '[username/nickname/id/mention/none]',
  cooldown: 2,
  guildOnly: true,
  async execute(message, args) {

    const discord = require('discord.js');
    const util = require('../util.js');

     let guildMember= util.findGuildMember(message,args[0]);
     if(!guildMember){
       message.delete();
       return message.reply("Sorry, i couldn't find a Guildmember called`"+args[0]+"´.").then(m =>m.delete(30000));
     }

    let embed = new discord.RichEmbed().setAuthor(`${guildMember.user.username}#${guildMember.user.discriminator}`);
    message.channel.send(embed).then(msg => msg.delete(60000));;
    message.delete(60000);
  },
};
