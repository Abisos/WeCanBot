module.exports = {
  name: 'thankyou',
  description: 'Say thank you to a user.',
  aliases: ["thx","ty"],
  usage: '[praefix+commandname User]',
  cooldown: 10,
  guildOnly: true,
  execute(message, args, client) {
    const Discord = require('discord.js');
    const db = require('../dbHandler.js');
    const util = require('../util.js');

    // return in case the member typed only the command without a mention
    if (!args[0]) {
      message.reply(`You have to add a User.`);
      message.delete(5000);
      return;
    }

    let guildMember= util.findGuildMember(message,args[0]);
    if(!guildMember){
      message.delete();
      return message.reply("Sorry, i couldn't find a Guildmember called`"+args[0]+"´.").then(m =>m.delete(30000));
    }

    // return if the mentioned user is the bot itself
    if (guildMember.user.equals(client.user)) {
      let embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`)
        .setColor("#4286f4")
        .setTitle(`😊 I am here to serve you, ${message.member.displayName}, and will not score myself! 😊`);

      message.delete(5000);
      return message.channel.send(embed).then(msg => msg.delete(10000)).catch(console.error);
    }

    // return if the mentioned user is another bot
    if (guildMember.user.bot) {
      let embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`)
        .setColor("#4286f4")
        .setTitle(`🙄 It would be more helpful if you thank the author of the bot. 😊`);

      message.delete(5000);
      return message.channel.send(embed).then(msg => msg.delete(10000)).catch(console.error);
    }

    // return if the mentioned user is the author of the message
    if (message.author.equals(guildMember.user)) {
      let embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`)
        .setColor("#4286f4")
        .setTitle(`😠 No, I will not do that. That's cheating! 😏`);

      message.delete(5000);
      return message.channel.send(embed).then(msg => msg.delete(10000)).catch(console.error);
    }

    // send thank you embed and update the database entry for the mentioned user
    db.updateThankyou(message.guild.database, guildMember.user.id);

    let embed = new Discord.RichEmbed()
      .setAuthor(`${message.guild.name}`)
      .setColor("#4286f4")
      .setTitle(`💐 ${guildMember.displayName} got a big thank you from ${message.member.displayName}! 💐`);

    message.delete(5000);
    message.channel.send(embed).catch(console.error);
  },
};
