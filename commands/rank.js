/**
* sends a message with the rank, the level, the received thank you's and the exp of the author
* of the message to the channel in which the command was typed
*/
module.exports = {
  name: 'rank',
  description: 'Show your rank and exp on this guild.',
  aliases: ["xp", "score"],
  usage: '[praefix+commandname]',
  cooldown: 60,
  guildOnly: true,
  async execute(message, args, client) {
    const Discord = require('discord.js');
    const db = require('../dbHandler.js');
    const util = require('../util.js');

    // request xp stats for the guild member
    var rankinfo = await db.getRankInfo(message.guild.database, message.author.id)
                           .catch(err => console.log(err));

    // return in case the member is not ranked yet
    if (!rankinfo.score) {
      message.delete(5000);
      return message.reply(`Looks like you are not ranked yet.`)
        .then(msg => msg.delete(5000));
    }

    // calculate the level
    let level = util.calcLevel(rankinfo.score);

    // create embed and post it
    let embed = new Discord.RichEmbed()
      .setAuthor(`${message.member.displayName}`, `${message.author.avatarURL}`)
      .setColor("#4286f4");

      switch (true) {
        case rankinfo.rank == 1:
          embed.setColor("#FFD700")
            .addField("Rank", `🥇 ${rankinfo.rank}/${rankinfo.maxrank} (Lvl. ${level.level})`, true);
          break;
        case rankinfo.rank == 2:
          embed.setColor("#C0C0C0")
            .addField("Rank", `🥈 ${rankinfo.rank}/${rankinfo.maxrank} (Lvl. ${level.level})`, true);
          break;
        case rankinfo.rank == 3:
          embed.setColor("#7f3131")
            .addField("Rank", `🥉 ${rankinfo.rank}/${rankinfo.maxrank} (Lvl. ${level.level})`, true);
          break;
        default:
          embed.addField("Rank", `${rankinfo.rank}/${rankinfo.maxrank} (Lvl. ${level.level})`, true);
      }

      embed.addField("Thanks", rankinfo.thx, true)
        .addField("Exp.", `${level.score}/${level.required}  (tot. ${rankinfo.score})`, true);

    message.delete(5000);
    message.channel.send(embed).catch(console.error);
  },
};
