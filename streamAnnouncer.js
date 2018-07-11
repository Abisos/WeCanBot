/**
 * This will post a RichEmbed to the announcement channel of a guild when a member
 * starts a live stream on Twitch.
 * It is required that the member has linked his Twitch account with discord,
 * has the streamer mode activated and has set the name of a game in his
 * Twitch stream settings.
 * It also requires that the host of the bot has set a Twitch app ID in the bot
 * configuration. The ID can be generated at https://dev.twitch.tv/.
 * @param {GuildMember} [oldMember] The guild member before the presence change
 * @param {GuildMember} [newMember] The guild member after the presence change
 */
module.exports = {
  execute(oldMember, newMember) {
    const fs = require('fs');
    const util = require('./util.js')
    const Discord = require('discord.js');
    const config = require('./config.json');
    var guild = oldMember.guild;

    // check if twitch client id is set
    if (!config.twitchClientID) return;

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

    // display a message when a member started a stream
    if (newMember.presence.game && newMember.presence.game.type === 1) {

      // create the announcement list for the guild if necessary
      if (!guild.announcements ) {
          guild.announcements = new Discord.Collection();
      }

      // get stream metadata and post announcement message
      util.getTwitchStream(newMember.presence.game.url)
      .then(data => {
        // set thumbnail size
        var thumbnailURL = data.thumbnail_url.replace("{width}", "112").replace("{height}", "63");

        // get game name
        util.getTwitchGame(data.game_id).then(gameName => {
          // create embed
          let embed = new Discord.RichEmbed()
            .setColor("#fa006c")
            .setFooter(`/${data.twitchname}`, 'attachment://twitchAvatar_190x190.png')
            .setThumbnail(`${thumbnailURL}`)
            .setAuthor(`${newMember.displayName}`, `${newMember.user.avatarURL}`)
            .addField( `is now streaming on Twitch:`, `:red_circle: [LIVE: ${data.title}](${newMember.presence.game.url})`)
            .addField("Game", `${gameName}`)
            .attachFile('./twitchAvatar_190x190.png');

          // post embed and add announcement to list
          announcementChannel.send(embed).then(async function(m) {
            guild.announcements.set(`${newMember.id}`, `{"messageId":"${m.id}"}`);
          }).catch(console.error);
        }).catch(console.error);
      }).catch(err => {
        console.log(`no stream found: ERROR ${err}`);
      });
    }

    // delete messages if user stopped streaming
    if (oldMember.presence.game != null && oldMember.presence.game.type === 1) {

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
