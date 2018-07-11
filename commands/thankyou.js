module.exports = {
  name: 'thankyou',
  description: 'Say thank you to a user.',
  aliases: ["thx","ty"],
  usage: '[praefix+commandname @Mention]',
  cooldown: 300,
  guildOnly: true,
  execute(message, args, client) {
    const Discord = require('discord.js');
    const db = require('../dbHandler.js');

    // return in case the member typed only the command without a mention
    if (!args[0] || !message.mentions.users.first()) {
      message.reply(`You have to add a mention.`);
      message.delete(5000);
      return;
    }

    // return if the mentioned user is the bot itself
    if (message.mentions.users.first().equals(client.user)) {
      let embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`)
        .setColor("#4286f4")
        .setTitle(`😊 I am here to serve you ${message.member.displayName} and will not score myself! 😊`);

      message.delete(5000);
      return message.channel.send(embed).then(msg => msg.delete(10000)).catch(console.error);
    }

    // return if the mentioned user is another bot
    if (message.mentions.users.first().bot) {
      let embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`)
        .setColor("#4286f4")
        .setTitle(`🙄 It would be more helpful if you thank the author of the bot. 😊`);

      message.delete(5000);
      return message.channel.send(embed).then(msg => msg.delete(10000)).catch(console.error);
    }

    // return if the mentioned user is the author of the message
    if (message.author.equals(message.mentions.users.first())) {
      let embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`)
        .setColor("#4286f4")
        .setTitle(`😠 No, I will not do that. That's cheating! 😏`);

      message.delete(5000);
      return message.channel.send(embed).then(msg => msg.delete(10000)).catch(console.error);
    }

    // send thank you embed and update the database entry for the mentioned user
    db.updateThankyou(message.guild.database, message.mentions.users.first().id);

    let embed = new Discord.RichEmbed()
      .setAuthor(`${message.guild.name}`)
      .setColor("#4286f4")
      .setTitle(`💐 ${message.mentions.members.first().displayName} got a big thank you from ${message.member.displayName}! 💐`);

    message.delete(5000);
    message.channel.send(embed).catch(console.error);
  },
};
