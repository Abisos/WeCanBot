module.exports = {
  execute(oldMember, newMember) {
    const fs = require('fs');
    const Discord = require('discord.js');
    var guild = oldMember.guild;

    // return if the guild has not set an announcement channel
    if (!guild.settings.announcementchannel) return;

    var announcementChannel = guild.channels.find('id', guild.settings.announcementchannel);

    // delete setting if the channel was not found in guild (eg. has been deleted)
    if (!announcementChannel) {
      // parse settings file
      const SettingsFile = fs.readFileSync(`./GuildSettings.json`);
      const GuildSettings = JSON.parse(SettingsFile);

      GuildSettings[guild.id].announcementchannel = null;
      guild.settings.announcementchannel = null;

      // write new settings file
      const returnSettings = JSON.stringify(GuildSettings, null, 2);
      fs.writeFileSync('./GuildSettings.json', returnSettings);
      return;
    }

    // create the announcement list for the guild if necessary
    if (!guild.announcements ) {
        guild.announcements = new Discord.Collection();
    }

    // display a message if a member started a stream
    //if (newMember.presence.game && newMember.presence.game.name == "D.R.O.N.E." && newMember.presence.game.streaming) { // change line below to this to only announce drone streams. not sure if the game name is correct
    if (newMember.presence.game && newMember.presence.game.streaming) {
      // create embed
      let embed = new Discord.RichEmbed()
        .setColor("#4286f4")
        .setTitle(`New Live Stream`)
        .setDescription(`**${newMember.displayName}** is now streaming **${newMember.presence.game.name}** on Twitch:`)
        .addField("Link:", `${newMember.presence.game.url}`)
        .setTimestamp();

      // post embed and add announcement to list
      announcementChannel.send(embed).then(async function(m) {
        guild.announcements.set(`${newMember.id}`, `{"messageId":"${m.id}"}`);
      }).catch(console.error);
    }

    // delete messages if user stopped streaming
    if (oldMember.presence.game != null
      // && oldMember.presence.game.name == "D.R.O.N.E." // include this to only announce drone streams
      && oldMember.presence.game.streaming
      && !newMember.presence.game.streaming) {

      if (guild.announcements.has(oldMember.id)) {
        let announcement = JSON.parse(guild.announcements.get(oldMember.id));

        announcementChannel.fetchMessage(announcement.messageId).then(m => {
          m.delete().catch(() => {}); // suppress UnhandledPromiseRejectionWarning
          guild.announcements.delete(oldMember.id);
        }).catch(() => {}); // suppress UnhandledPromiseRejectionWarning
      }
    }
  },
};
