module.exports = {
  name: 'stats',
  description: 'Returns server statistics.',
  aliases: ["ss", "serverinfo", "server"],
  usage: '',
  cooldown: 4,
  guildOnly: true,
  execute(message, args, client) {
    const discord = require('discord.js');

    let embed = new discord.RichEmbed().setAuthor(`${message.guild.name}`)
      .setColor("#4286f4")
      .setThumbnail(message.guild.iconURL)
      .addField("Owner", `${message.guild.owner.user.username}#${message.guild.owner.user.discriminator} - ${message.guild.owner.user.presence.status}`)
      .addField("Server createdAt", message.guild.createdAt.toString().slice(0, 33), true)
      .addField("Total Members", message.guild.memberCount, true)
      .addField("Online", message.guild.members.filter(m => m.presence.status === 'online' || m.presence.status === 'idle').size, true)
      .addField("Offline", message.guild.members.filter(m => m.presence.status === 'offline' || m.presence.status === 'dnd').size, true);

    //
    message.delete(2000);
    message.channel.send(embed).then(msg => msg.delete(60000));

  },
};
