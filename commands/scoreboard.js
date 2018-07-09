/**
* sends a message with a ordered list of the top ten members with their rank, display name and score
*/
module.exports = {
  name: 'scoreboard',
  description: 'Show the top ten members of this guild.',
  aliases: ["topten", "leaderboard"],
  usage: '[praefix+commandname]',
  cooldown: 60,
  guildOnly: true,
  async execute(message, args, client) {
    const Discord = require('discord.js');
    const db = require('../dbHandler.js');
    const util = require('../util.js');

    // request top ten list
    var topTen = await db.getTopTen(message.guild.database)
                           .catch(err => console.log(err));

    // create list
    var rank = 1;
    var topTenRank = "";
    var topTenMember = "";
    var topTenScore = "";

    await topTen.forEach(entry => {
      message.guild.fetchMember(entry.userID).then(member => {
        topTenRank += `**${entry.rank}** - (Lvl. ${util.calcLevel(entry.score).level})\n`;
        topTenMember += `${member.displayName}\n`;
        topTenScore += `${entry.score}\n`;
      }).catch(console.error);
    });

    // create embed and post it
    let embed = new Discord.RichEmbed()
      .setAuthor(`${message.guild.name} Top Ten`)
      .setColor("#4286f4")
      .addField(`Rank:`, `${topTenRank}`, true)
      .addField(`Member:`, `${topTenMember}`, true)
      .addField(`Score:`, `${topTenScore}`, true);

    message.delete(5000);
    message.channel.send(embed).catch(console.error);
  },
};
