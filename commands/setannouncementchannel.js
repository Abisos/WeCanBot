module.exports = {
  name: 'setannouncementchannel',
  description: 'Sets the Channel where the live stream announcements are being posted.\nProvide a channel mention to set a new channel or the word "disable" to deactivate the function.',
  aliases: ['setac', 'sac'],
  usage: '[channelmention/disable]',
  example: "#announcements",
  cooldown: 10,
  guildOnly: true,
  args: true,
  execute(message, args, client) {
    const fs = require('fs');

    // catch missing argument from message
    if (!args[0]) return message.reply("You have to enter the channel name where the stream announcements should be posted.").then(msg => msg.delete(30000));

    // parse settings file
    const SettingsFile = fs.readFileSync(`./GuildSettings.json`);
    const GuildSettings = JSON.parse(SettingsFile);

    // if arg is "disable" delete the channel id in settings
    if (args[0] === "disable") {
      GuildSettings[message.guild.id].announcementchannel = null;
      message.guild.settings.announcementchannel = null;

      const returnSettings = JSON.stringify(GuildSettings, null, 2);
      fs.writeFileSync('./GuildSettings.json', returnSettings);

      message.delete(15000);
      return message.reply('The announcement function has been disabled.').then(msg => msg.delete(15000).catch(console.error));
    }

    // get the channel from message argument
    let channel = message.mentions.channels.first() ||
    message.guild.channels.find(guildchannel => guildchannel.id === args[0]) || null;

    if (!channel) return message.reply(`I couldn't find a channel with name: ${args[0]}`).then(msg => msg.delete(30000)).catch(console.error);

    // write channel id to settings file of the guild
    if (channel) {
      GuildSettings[message.guild.id].announcementchannel = channel.id;
      message.guild.settings.announcementchannel = channel.id;
      message.reply(`Channel for announcements is now set to ${channel.name}.`).then(msg => msg.delete(15000)).catch(console.error);
    }

    const returnSettings = JSON.stringify(GuildSettings, null, 2);
    fs.writeFileSync('./GuildSettings.json', returnSettings);
    message.delete(15000);
  },
};
